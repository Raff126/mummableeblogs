const TRUST_CARDS = [
  {
    icon: '✨',
    title: 'Practical Family Perspective',
    description: 'Real-world ideas focused on making family days easier to plan, from timing tips to stroller accessibility.',
  },
  {
    icon: '📍',
    title: 'UAE Focused',
    description: 'Detailed guides covering Dubai, Abu Dhabi, and everyday family life across the Emirates.',
  },
  {
    icon: '🤍',
    title: 'Useful & Honest',
    description: 'Practical information designed to help parents decide what experiences are genuinely worth their time.',
  },
];

export default function TrustSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-sans font-bold tracking-widest text-mumma-rose uppercase block mb-1">
            WHY PARENTS RETURN
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
            Why UAE Parents Trust MummaBeeBlog
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {TRUST_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-desert-blush/50 p-8 rounded-3xl border border-mumma-rose/20 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-white text-2xl flex items-center justify-center mx-auto shadow-xs">
                {card.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-date-burgundy">
                {card.title}
              </h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
