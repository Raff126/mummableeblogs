'use client';

import Link from 'next/link';

export default function ExpatEditSection() {
  const expatGuides = [
    {
      id: 'expat-1',
      badge: 'COMMUNITY & FRIENDSHIPS',
      title: 'How to Build a Supportive Mum Village as an Expat',
      category: 'The Expat Edit',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&fit=crop&q=80',
      link: '/the-expat-edit/how-to-build-a-supportive-mum-community-as-an-expat-in-the-uae',
      bgColor: 'bg-[#B75B70]',
    },
    {
      id: 'expat-2',
      badge: 'SCHOOL & EDUCATION',
      title: 'Choosing Between British, IB, & American Curriculums',
      category: 'The Expat Edit',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&fit=crop&q=80',
      link: '/the-expat-edit/choosing-between-british-ib-and-american-curriculums-in-the-uae',
      bgColor: 'bg-[#4D7987]',
    },
    {
      id: 'expat-3',
      badge: 'UAE LIVING & SEASONS',
      title: 'Handling Seasonal Transitions & Summer with Kids',
      category: 'The Expat Edit',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&fit=crop&q=80',
      link: '/the-expat-edit/how-we-handle-seasonal-transitions-and-summer-months-with-kids',
      bgColor: 'bg-[#D79A30]',
    },
  ];

  return (
    <section id="expat-edit" className="py-16 sm:py-20 bg-[#F8EDEF]/40 border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
              CURATED ESSENTIALS FOR UAE FAMILIES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
              The Expat Edit
            </h2>
            <p className="text-xs sm:text-sm text-[#332D2F]/80 font-sans mt-1">
              Practical guides, school choices & community wisdom for raising kids in the Emirates
            </p>
          </div>
          <Link
            href="/the-expat-edit"
            className="text-xs font-bold tracking-wider text-[#B75B70] hover:text-[#683846] transition-colors uppercase self-start sm:self-auto inline-flex items-center gap-1"
          >
            <span>View All Expat Guides</span>
            <span>→</span>
          </Link>
        </div>

        {/* 3 Featured Expat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {expatGuides.map((guide) => (
            <Link
              key={guide.id}
              href={guide.link}
              className="group bg-white rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={guide.image}
                  alt={guide.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase text-white px-3 py-1 rounded-full shadow-xs ${guide.bgColor}`}>
                  {guide.badge}
                </span>
              </div>

              {/* Text Container */}
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <span className="text-[10px] font-bold text-[#B75B70] uppercase tracking-wider block mb-1">
                    {guide.category}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors leading-snug">
                    {guide.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[11px] text-[#332D2F]/60 font-sans">
                  <span>{guide.readTime}</span>
                  <span className="font-bold text-[#B75B70] group-hover:translate-x-1 transition-transform">
                    Read Guide →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
