import Link from 'next/link';

const LOCATIONS = [
  { label: 'Dubai Guides', path: '/uae-with-kids' },
  { label: 'Abu Dhabi Spots', path: '/uae-with-kids' },
  { label: 'Ras Al Khaimah', path: '/travel' },
  { label: 'UAE-Wide Finds', path: '/uae-with-kids' },
];

const TOPICS = [
  { label: 'UAE With Kids', path: '/uae-with-kids' },
  { label: 'Family Life & Parenting', path: '/family-life' },
  { label: 'Food & Family Dining', path: '/food' },
  { label: 'Family Travel & Stays', path: '/travel' },
  { label: 'Brands We Love', path: '/brands-we-love' },
  { label: 'UAE Deals', path: '/uae-deals' },
];

export default function ExploreByTopicLocation() {
  return (
    <section className="py-16 bg-[#F8EDEF]/40 border-y border-[#B75B70]/15">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
            DISCOVER GUIDES
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
            Explore by Topic or Location
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Location Group */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 text-center space-y-4 shadow-soft">
            <span className="text-[10px] font-bold tracking-widest text-[#683846] uppercase block">
              📍 BY LOCATION
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {LOCATIONS.map((loc) => (
                <Link
                  key={loc.label}
                  href={loc.path}
                  className="bg-[#F8EDEF] hover:bg-[#B75B70] hover:text-white text-[#683846] text-xs font-semibold px-4 py-2 rounded-full border border-[#B75B70]/20 shadow-2xs transition-all"
                >
                  {loc.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Topic Group */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 text-center space-y-4 shadow-soft">
            <span className="text-[10px] font-bold tracking-widest text-[#683846] uppercase block">
              📚 BY TOPIC
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {TOPICS.map((topic) => (
                <Link
                  key={topic.label}
                  href={topic.path}
                  className="bg-[#F8EDEF] hover:bg-[#B75B70] hover:text-white text-[#683846] text-xs font-semibold px-4 py-2 rounded-full border border-[#B75B70]/20 shadow-2xs transition-all"
                >
                  {topic.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
