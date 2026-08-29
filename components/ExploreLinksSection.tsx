import Link from 'next/link';

const EXPLORE_LINKS = [
  { label: 'Dubai Guides', path: '/uae-with-kids?sub=Dubai%20Activities', icon: '🏙️' },
  { label: 'Abu Dhabi Days Out', path: '/uae-with-kids?sub=Abu%20Dhabi%20Days%20Out', icon: '🕌' },
  { label: 'Indoor Play', path: '/uae-with-kids?sub=Indoor%20Play', icon: '❄️' },
  { label: 'Outdoor Parks', path: '/uae-with-kids?sub=Weekend%20Ideas', icon: '🌳' },
  { label: 'Family Dining', path: '/food', icon: '🍽️' },
  { label: 'Family Travel', path: '/travel', icon: '✈️' },
  { label: 'School & Activities', path: '/school-and-activities', icon: '📚' },
];

export default function ExploreLinksSection() {
  return (
    <section className="py-12 bg-secondary-blush/40 border-y border-mumma-rose/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-[11px] font-sans font-bold tracking-widest text-mumma-rose uppercase block mb-1">
            EDITORIAL EXPLORATION
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
            Explore More Family Guides
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
          {EXPLORE_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className="bg-white hover:bg-mumma-rose hover:text-white text-charcoal font-sans text-xs font-semibold px-5 py-2.5 rounded-full border border-mumma-rose/20 shadow-xs transition-all flex items-center gap-2 group"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              <span className="text-mumma-rose group-hover:text-white transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
