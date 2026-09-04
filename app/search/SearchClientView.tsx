'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArticleItem, getAllArticles } from '../../data/articles';
import { CATEGORIES } from '../../data/categories';
import { getInitialArticles } from '../../data/store';
import GuideCard from '../../components/GuideCard';
import NewsletterBand from '../../components/NewsletterBand';

const POPULAR_SEARCHES = [
  'Dubai indoor play',
  'Family brunch',
  'Abu Dhabi staycation',
  'Outdoor parks',
  'Toddler activities',
  'School holidays',
  'Budget friendly',
  'Packing list',
];

const LOCATIONS = [
  'All Locations',
  'Dubai',
  'Abu Dhabi',
  'Ras Al Khaimah',
  'Sharjah',
  'Fujairah',
];

const TOPICS = [
  'All Topics',
  'Indoor',
  'Outdoor',
  'Toddlers',
  'Dining',
  'Staycation',
  'Weekend',
  'Budget',
];

export default function SearchClientView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialLocation = searchParams.get('location') || 'all';
  const initialTopic = searchParams.get('topic') || 'all';
  const initialSort = searchParams.get('sort') || 'newest';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [sortBy, setSortBy] = useState(initialSort);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with URL params when they change
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedLocation(searchParams.get('location') || 'all');
    setSelectedTopic(searchParams.get('topic') || 'all');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  // Load articles from localStorage and API
  useEffect(() => {
    const local = getInitialArticles();
    const all = local.length > 0 ? local : getAllArticles();
    setArticles(all.filter((a) => !a.isDraft));
    setIsLoading(false);

    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocal ? `/api/articles/?t=${Date.now()}` : `/data/articles.json?t=${Date.now()}`;
    fetch(endpoint, { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : null)
      .then((apiArticles: ArticleItem[]) => {
        if (Array.isArray(apiArticles) && apiArticles.length > 0) {
          setArticles(apiArticles.filter((a) => !a.isDraft));
        }
      })
      .catch((err) => console.error('Error loading search articles:', err));
  }, []);

  // Update URL helper
  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === 'all' || (k === 'sort' && v === 'newest')) {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    const queryString = params.toString();
    router.replace(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    updateUrl({ q: val.trim() });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateUrl({ category: cat });
  };

  const handleLocationChange = (loc: string) => {
    setSelectedLocation(loc);
    updateUrl({ location: loc });
  };

  const handleTopicChange = (top: string) => {
    setSelectedTopic(top);
    updateUrl({ topic: top });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateUrl({ sort });
  };

  const handleClearAll = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedTopic('all');
    setSortBy('newest');
    router.replace('/search', { scroll: false });
  };

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    let result = articles;

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((a) => {
        const titleMatch = a.title.toLowerCase().includes(q);
        const excerptMatch = a.excerpt.toLowerCase().includes(q);
        const contentMatch = a.content.toLowerCase().includes(q);
        const locationMatch = a.location?.toLowerCase().includes(q);
        const tagMatch = a.tags?.some((t) => t.toLowerCase().includes(q));
        const subcatMatch = a.subcategory?.toLowerCase().includes(q);
        return titleMatch || excerptMatch || contentMatch || locationMatch || tagMatch || subcatMatch;
      });
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Filter by Location
    if (selectedLocation !== 'all') {
      result = result.filter((a) => {
        const loc = a.location?.toLowerCase() || '';
        return loc.includes(selectedLocation.toLowerCase());
      });
    }

    // Filter by Topic
    if (selectedTopic !== 'all') {
      const top = selectedTopic.toLowerCase();
      result = result.filter((a) => {
        const tagMatch = a.tags?.some((t) => t.toLowerCase().includes(top));
        const indoorOutdoorMatch = a.indoorOutdoor?.toLowerCase().includes(top);
        const titleMatch = a.title.toLowerCase().includes(top);
        const subcatMatch = a.subcategory?.toLowerCase().includes(top);
        return tagMatch || indoorOutdoorMatch || titleMatch || subcatMatch;
      });
    }

    // Sort
    const sorted = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = new Date(a.publishedAt).getTime() || 0;
        const timeB = new Date(b.publishedAt).getTime() || 0;
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = new Date(a.publishedAt).getTime() || 0;
        const timeB = new Date(b.publishedAt).getTime() || 0;
        return timeA - timeB;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return sorted;
  }, [articles, query, selectedCategory, selectedLocation, selectedTopic, sortBy]);

  const hasActiveFilters =
    query.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedLocation !== 'all' ||
    selectedTopic !== 'all';

  return (
    <div className="min-h-screen bg-[#FCF9F9] flex flex-col justify-between">
      <div>
        {/* Search Header Banner */}
        <section className="bg-[#F8EDEF] py-10 sm:py-14 border-b border-[#B75B70]/15">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-xs font-medium text-[#332D2F] space-x-2">
              <Link href="/" className="hover:text-[#B75B70]">Home</Link>
              <span>/</span>
              <span className="text-[#683846] font-semibold">Search</span>
            </nav>

            <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block">
              DISCOVER MUMMABEE EXPERIENCES & GUIDES
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#683846] leading-tight">
              Search UAE Family Guides
            </h1>
            <p className="font-sans text-xs sm:text-base text-[#332D2F] max-w-xl mx-auto leading-relaxed">
              Find family-tested recommendations, days out, dining spots, school checklists, and weekend getaways across Dubai and Abu Dhabi.
            </p>

            {/* Main Search Input Form */}
            <div className="pt-2 max-w-2xl mx-auto relative">
              <div className="relative flex items-center">
                <input
                  type="search"
                  id="main-search-input"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search articles, places, activities, or topics..."
                  className="w-full px-5 py-3.5 sm:py-4 pl-12 pr-12 rounded-full border border-[#B75B70]/30 focus:outline-none focus:ring-2 focus:ring-[#B75B70] bg-white text-sm text-[#332D2F] placeholder-gray-400 shadow-soft transition-all"
                />
                <svg
                  className="w-5 h-5 text-[#683846] absolute left-4 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {query && (
                  <button
                    onClick={() => handleQueryChange('')}
                    className="absolute right-4 text-gray-400 hover:text-[#683846] p-1 rounded-full text-sm font-bold"
                    aria-label="Clear search query"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Popular Search Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-[10px] font-bold tracking-wider text-[#332D2F]/70 uppercase">
                Popular:
              </span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQueryChange(term)}
                  className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-all ${
                    query.toLowerCase() === term.toLowerCase()
                      ? 'bg-[#683846] text-white border-[#683846]'
                      : 'bg-white hover:bg-[#F8EDEF] text-[#683846] border-gray-200 shadow-2xs'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Toolbar & Results Section */}
        <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            {/* Category, Location & Topic Filter Controls */}
            <div className="bg-[#FAF7F7] rounded-3xl p-5 sm:p-6 border border-gray-100 space-y-5">
              
              {/* Row 1: Categories */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#683846] block">
                  Category
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-[#683846] text-white shadow-xs'
                        : 'bg-white text-[#332D2F] border border-gray-200 hover:bg-[#F8EDEF]'
                    }`}
                  >
                    All Categories
                  </button>
                  {Object.entries(CATEGORIES).map(([slug, cat]) => (
                    <button
                      key={slug}
                      onClick={() => handleCategoryChange(slug)}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                        selectedCategory === slug
                          ? 'bg-[#683846] text-white shadow-xs'
                          : 'bg-white text-[#332D2F] border border-gray-200 hover:bg-[#F8EDEF]'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Location & Topics & Sort */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-3 border-t border-gray-200/60">
                {/* Location Pills */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#683846] block">
                    Location / Emirate
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {LOCATIONS.map((loc) => {
                      const val = loc === 'All Locations' ? 'all' : loc;
                      return (
                        <button
                          key={loc}
                          onClick={() => handleLocationChange(val)}
                          className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                            selectedLocation === val
                              ? 'bg-[#B75B70] text-white'
                              : 'bg-white text-[#332D2F] border border-gray-200 hover:bg-[#F8EDEF]'
                          }`}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Topic Pills */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#683846] block">
                    Topic / Vibe
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPICS.map((top) => {
                      const val = top === 'All Topics' ? 'all' : top;
                      return (
                        <button
                          key={top}
                          onClick={() => handleTopicChange(val)}
                          className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                            selectedTopic === val
                              ? 'bg-[#B75B70] text-white'
                              : 'bg-white text-[#332D2F] border border-gray-200 hover:bg-[#F8EDEF]'
                          }`}
                        >
                          {top}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="md:col-span-2 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#683846] block">
                    Sort By
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[#332D2F] focus:outline-none focus:ring-2 focus:ring-[#B75B70]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title (A–Z)</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips & Reset */}
              {hasActiveFilters && (
                <div className="pt-3 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-500 font-medium">Active filters:</span>
                    {query && (
                      <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-[#683846] font-semibold">
                        "{query}"
                        <button onClick={() => handleQueryChange('')} className="hover:text-red-500">×</button>
                      </span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-[#683846] font-semibold">
                        {CATEGORIES[selectedCategory]?.name || selectedCategory}
                        <button onClick={() => handleCategoryChange('all')} className="hover:text-red-500">×</button>
                      </span>
                    )}
                    {selectedLocation !== 'all' && (
                      <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-[#683846] font-semibold">
                        📍 {selectedLocation}
                        <button onClick={() => handleLocationChange('all')} className="hover:text-red-500">×</button>
                      </span>
                    )}
                    {selectedTopic !== 'all' && (
                      <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-[#683846] font-semibold">
                        🏷️ {selectedTopic}
                        <button onClick={() => handleTopicChange('all')} className="hover:text-red-500">×</button>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-bold text-[#B75B70] hover:text-[#683846] underline decoration-dotted underline-offset-4"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-serif text-2xl font-bold text-[#683846]">
                {hasActiveFilters ? 'Search Results' : 'All Published Guides'}
              </h2>
              <span className="text-xs text-[#332D2F]/80 font-medium">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'guide found' : 'guides found'}
              </span>
            </div>

            {/* Results Grid */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArticles.map((article) => (
                  <GuideCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="bg-[#F8EDEF] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
                  <span className="text-4xl">🔍</span>
                  <h3 className="font-serif text-2xl font-bold text-[#683846]">No Matching Guides Found</h3>
                  <p className="text-xs text-[#332D2F] leading-relaxed">
                    We couldn't find any guides matching your criteria. Try adjusting your keyword or clearing active filters to browse our library.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={handleClearAll}
                      className="btn-primary inline-block text-xs uppercase tracking-wider font-bold"
                    >
                      Reset Search & Filters
                    </button>
                  </div>
                </div>
              )
            )}

          </div>
        </section>
      </div>

      <NewsletterBand />
    </div>
  );
}
