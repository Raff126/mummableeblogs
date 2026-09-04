'use client';

import Link from 'next/link';

const PAGES = [
  { name: 'Homepage (Family Guide Hub)', editPath: '/admin/homepage/', status: 'Live', url: '/' },
  { name: 'About Donne & Our Story', editPath: '/admin/about/', status: 'Live', url: '/about/' },
  { name: 'Work With Us (Partnerships & Media Kit)', editPath: '/admin/work-with-us/', status: 'Live', url: '/work-with-us/' },
  { name: 'The Expat Edit (Curated UAE Essentials)', editPath: '/admin/categories/?edit=the-expat-edit', status: 'Live', url: '/the-expat-edit/' },
  { name: 'UAE With Kids (Activities & Days Out)', editPath: '/admin/categories/?edit=uae-with-kids', status: 'Live', url: '/uae-with-kids/' },
  { name: 'Family Life (Parenting & Stories)', editPath: '/admin/categories/?edit=family-life', status: 'Live', url: '/family-life/' },
  { name: 'Food & Dining (Family-Friendly Places)', editPath: '/admin/categories/?edit=food', status: 'Live', url: '/food/' },
  { name: 'Family Travel (Trips & Staycations)', editPath: '/admin/categories/?edit=travel', status: 'Live', url: '/travel/' },
  { name: 'School & Activities (Learning & Prep)', editPath: '/admin/categories/?edit=school-and-activities', status: 'Live', url: '/school-and-activities/' },
  { name: 'Brands We Love (Tested Gear & Essentials)', editPath: '/admin/categories/?edit=brands-we-love', status: 'Live', url: '/brands-we-love/' },
  { name: 'UAE Deals (Discount Codes & Offers)', editPath: '/admin/deals/', status: 'Live', url: '/uae-deals/' },
];

export default function AdminPagesPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#683846]">Site Pages</h1>
        <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
          Overview of primary marketing, hub, and content pages on MummaBeeBlog.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="divide-y divide-gray-100 text-xs font-sans">
          {PAGES.map((pg) => (
            <div key={pg.name} className="p-5 flex items-center justify-between hover:bg-[#F8EDEF]/40 transition-colors">
              <div>
                <h3 className="font-serif text-base font-bold text-[#683846]">{pg.name}</h3>
                <span className="text-[10px] text-[#332D2F]/60 font-mono">{pg.url}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-[#683846] bg-[#F8EDEF] border border-[#D7BB91] px-2.5 py-1 rounded-full uppercase">
                  {pg.status}
                </span>
                {pg.editPath && (
                  <Link
                    href={pg.editPath}
                    className="px-3.5 py-1.5 rounded-xl bg-[#683846] text-xs font-bold text-white hover:bg-[#B75B70] transition-colors"
                  >
                    ✏️ Edit Page
                  </Link>
                )}
                <Link
                  href={pg.url}
                  target="_blank"
                  className="px-3.5 py-1.5 rounded-xl bg-[#F8EDEF] text-xs font-bold text-[#683846] hover:bg-[#B75B70] hover:text-white transition-colors"
                >
                  View Live →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
