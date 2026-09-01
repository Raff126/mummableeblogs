'use client';

import { useState, useEffect } from 'react';
import { getInitialDeals, isDealActive, DiscountCode, STORAGE_KEYS } from '../data/store';

interface DiscountCodesSectionProps {
  placement?: 'homepage' | 'dealsPage' | 'all';
}

export default function DiscountCodesSection({ placement = 'all' }: DiscountCodesSectionProps) {
  const [deals, setDeals] = useState<DiscountCode[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadDeals = () => {
    const local = getInitialDeals();
    setDeals(local);

    fetch(`/api/deals?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDeals(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    setMounted(true);
    loadDeals();

    const handleUpdate = (e: any) => {
      if (e.detail?.key === STORAGE_KEYS.DEALS && Array.isArray(e.detail?.data)) {
        setDeals(e.detail.data);
      } else {
        loadDeals();
      }
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleCopy = (id: string, code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter deals by active status and page placement
  const activeDeals = deals.filter((deal) => {
    if (!isDealActive(deal)) return false;
    if (placement === 'homepage') return deal.showOnHomepage;
    if (placement === 'dealsPage') return deal.showOnDealsPage;
    return true;
  });

  const getExpirationDays = (expDate?: string) => {
    if (!mounted || !expDate) return null;
    const exp = new Date(expDate);
    if (expDate.length <= 10) {
      exp.setHours(23, 59, 59, 999);
    }
    const diffMs = exp.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    if (diffDays <= 7) return `Ends in ${diffDays} days`;
    return `Valid until ${expDate}`;
  };

  return (
    <section id="deals" className="py-14 sm:py-18 bg-[#FEFAF9] border-t border-[#B75B70]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8EDEF] border border-[#B75B70]/30 text-[#B75B70] text-[10px] font-sans font-bold tracking-widest uppercase">
            <span>🏷️</span>
            <span>EXCLUSIVE FAMILY PERKS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
            {placement === 'dealsPage' ? 'UAE Family Promo Codes' : 'Exclusive UAE Family Deals & Codes'}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-[#332D2F]/80 leading-relaxed">
            Tested and verified discounts for family days out, attractions, kid-friendly cafes, and UAE staycations.
          </p>
        </div>

        {/* When active deals exist: Centered Responsive Cards Layout */}
        {activeDeals.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6">
            {activeDeals.map((deal) => {
              const expText = getExpirationDays(deal.expirationDate);
              const isCopied = copiedId === deal.id;

              return (
                <div
                  key={deal.id}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
                >
                  {/* Decorative Top Accent Border */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DF3E6B] via-[#B75B70] to-[#D7BB91]" />

                  <div className="space-y-4">
                    {/* Badge & Expiration Row */}
                    <div className="flex items-center justify-between gap-2">
                      {deal.discountBadge && (
                        <span className="bg-[#DF3E6B] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                          {deal.discountBadge}
                        </span>
                      )}

                      {expText && (
                        <span className="text-[10px] font-semibold text-[#B75B70] bg-[#F8EDEF] px-2.5 py-0.5 rounded-full border border-[#B75B70]/20 flex items-center gap-1">
                          <span>⏳</span>
                          <span>{expText}</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#683846] leading-snug group-hover:text-[#B75B70] transition-colors">
                        {deal.title}
                      </h3>
                      {deal.description && (
                        <p className="text-xs text-[#332D2F]/80 mt-1.5 leading-relaxed">
                          {deal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Promo Code Copy Box & Redeem CTA */}
                  <div className="pt-6 mt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between bg-[#F8EDEF] rounded-2xl p-2 pl-4 border border-[#B75B70]/25">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#683846] tracking-wider select-all">
                        {deal.code}
                      </span>

                      <button
                        onClick={() => handleCopy(deal.id, deal.code)}
                        className={`px-3.5 py-1.5 rounded-xl font-sans text-[11px] font-bold uppercase tracking-wider transition-all duration-200 shadow-2xs ${
                          isCopied
                            ? 'bg-green-600 text-white'
                            : 'bg-[#683846] hover:bg-[#332D2F] text-white'
                        }`}
                      >
                        {isCopied ? '✨ Copied!' : 'Copy Code'}
                      </button>
                    </div>

                    {deal.link && (
                      <a
                        href={deal.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-center text-xs font-bold text-[#B75B70] hover:text-[#683846] hover:bg-[#F8EDEF]/50 transition-colors uppercase tracking-wider"
                      >
                        <span>Redeem Deal</span>
                        <span className="text-sm">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Placeholder State when no active promo codes exist */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-soft text-center max-w-xl mx-auto space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#F8EDEF] border border-[#B75B70]/30 flex items-center justify-center mx-auto text-2xl shadow-xs">
              🏷️
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#683846]">
              Fresh Deals & Promo Codes Coming Soon
            </h3>
            <p className="text-xs sm:text-sm text-[#332D2F]/80 leading-relaxed max-w-md mx-auto">
              We are actively partnering with top UAE family venues, dining spots, and staycations to secure exclusive discounts for our community.
            </p>
            <p className="text-xs text-[#B75B70] font-semibold tracking-wide">
              ✨ Subscribe to our Friday newsletter below to be the first to receive new verified codes!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
