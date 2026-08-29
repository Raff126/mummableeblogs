import Link from 'next/link';

export default function FeaturedGuidesSection() {
  return (
    <section className="py-14 sm:py-16 bg-white border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
              LATEST UAE FAMILY GUIDES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
              Plan your next family day
            </h2>
          </div>
          <Link
            href="/uae-with-kids"
            className="text-[11px] font-bold tracking-wider text-[#B75B70] hover:text-[#683846] transition-colors uppercase self-start sm:self-auto"
          >
            VIEW ALL GUIDES →
          </Link>
        </div>

        {/* 3 Featured Editorial Cards Matching Exact Reference Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: DUBAI (Berry Pink) */}
          <Link
            href="/uae-with-kids/10-family-friendly-things-to-do-in-dubai-this-weekend"
            className="group bg-white rounded-[26px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col relative"
          >
            {/* Top Pink Block with Overlapping Circles */}
            <div className="relative bg-[#DF2A64] text-white p-7 h-44 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-8 -right-6 w-32 h-32 bg-[#F8EDEF]/25 rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -right-6 w-36 h-36 bg-white/20 rounded-full pointer-events-none" />

              <span className="text-[9px] font-bold tracking-widest uppercase text-white/90">
                WEEKEND GUIDE
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                DUBAI
              </h3>
            </div>

            {/* Bottom White Area */}
            <div className="p-6 space-y-1 flex-1 flex flex-col justify-between bg-white">
              <h4 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors">
                10 Dubai Activities for Kids
              </h4>
              <span className="text-[11px] text-[#332D2F]/60 font-medium block">
                Activities • 4 min read
              </span>
            </div>
          </Link>

          {/* Card 2: EAT (Mustard Gold) */}
          <Link
            href="/food/7-dubai-restaurants-parents-and-kids-will-both-enjoy"
            className="group bg-white rounded-[26px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col relative"
          >
            {/* Top Gold Block with Overlapping Circle */}
            <div className="relative bg-[#D79A30] text-white p-7 h-44 flex flex-col justify-between overflow-hidden">
              <div className="absolute -bottom-8 -right-6 w-36 h-36 bg-white/25 rounded-full pointer-events-none" />
              <div className="absolute -bottom-4 right-10 w-28 h-28 bg-[#F8EDEF]/20 rounded-full pointer-events-none" />

              <span className="text-[9px] font-bold tracking-widest uppercase text-white/90">
                FAMILY DINING
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                EAT
              </h3>
            </div>

            {/* Bottom White Area */}
            <div className="p-6 space-y-1 flex-1 flex flex-col justify-between bg-white">
              <h4 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors">
                7 Family Restaurants in Dubai
              </h4>
              <span className="text-[11px] text-[#332D2F]/60 font-medium block">
                Food • 4 min read
              </span>
            </div>
          </Link>

          {/* Card 3: SCHOOL (Slate Teal) */}
          <Link
            href="/school-and-activities/a-uae-back-to-school-checklist-for-busy-parents"
            className="group bg-white rounded-[26px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col relative"
          >
            {/* Top Teal Block with Overlapping Circles */}
            <div className="relative bg-[#4D7987] text-white p-7 h-44 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-10 -right-6 w-36 h-36 bg-[#86B3C2]/30 rounded-full pointer-events-none" />
              <div className="absolute -bottom-8 -right-6 w-32 h-32 bg-white/20 rounded-full pointer-events-none" />

              <span className="text-[9px] font-bold tracking-widest uppercase text-white/90">
                PARENT GUIDE
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                SCHOOL
              </h3>
            </div>

            {/* Bottom White Area */}
            <div className="p-6 space-y-1 flex-1 flex flex-col justify-between bg-white">
              <h4 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors">
                Back-to-School Checklist
              </h4>
              <span className="text-[11px] text-[#332D2F]/60 font-medium block">
                School • 5 min read
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
