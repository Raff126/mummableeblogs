export type FrameStyle =
  | 'double-gold-border'
  | 'frosted-halo-border'
  | 'artisan-stitched-border'
  | 'museum-mat-border'
  | 'rosegold-gradient-border'
  | 'layered-offset-border';

export interface FrameStyleConfig {
  id: FrameStyle;
  name: string;
  sampleLabel: string;
  subtitle: string;
  borderType: string;
  badge: string;
  icon: string;
  description: string;
  features: string[];
  bestFor: string;
  // Hero Portrait Styling (Family Photograph in Hero Section)
  heroOuter: string;
  heroInner: string;
  heroBadge: string;
  labelFormat: string;
  // Blog Card Thumbnail Styling
  cardThumbnailWrapper: string;
  cardThumbnailInner: string;
  cardThumbnailBorder: string;
  // Article Page Featured Hero Image
  articleBannerOuter: string;
  articleBannerInner: string;
  articleBannerShadow: string;
}

export const FRAME_STYLES: Record<FrameStyle, FrameStyleConfig> = {
  'double-gold-border': {
    id: 'double-gold-border',
    name: 'Double Gold & Cream Border',
    sampleLabel: 'BORDER 1',
    subtitle: 'Dual-layer casing: pure white outer + champagne gold inner hairline',
    borderType: 'Double Inset Border',
    badge: 'Luxury Double Border',
    icon: '✨',
    description:
      'A luxury double-border construction featuring a crisp white outer casing and an inner champagne gold metallic hairline rule with generous air spacing between layers.',
    features: [
      'Dual-border construction with outer white & inner gold line',
      'Champagne gold metallic hairline trim (#D7BB91)',
      'Subtle 3mm spacer margin between inner and outer borders',
      'Prestigious, refined, and royal UAE aesthetic'
    ],
    bestFor: 'Luxury editorial lifestyle, high-end family portraits, and hotel guides.',
    heroOuter:
      'relative w-full max-w-[350px] sm:max-w-[400px] aspect-[4/5] rounded-[30px] sm:rounded-[38px] p-3 sm:p-4 bg-white border-2 border-[#D7BB91]/60 shadow-[0_16px_50px_rgba(215,187,145,0.22)] ring-4 ring-[#F8EDEF] ring-offset-2 ring-offset-white transition-all duration-500 hover:border-[#D7BB91]',
    heroInner:
      'w-full h-full rounded-[20px] sm:rounded-[26px] overflow-hidden bg-[#F8EDEF] border-2 border-[#D7BB91]/40 shadow-inner',
    heroBadge:
      'bg-[#683846] text-[#D7BB91] text-[7.5px] sm:text-[8px] font-sans font-bold tracking-[0.2em] uppercase px-3.5 py-1 rounded-full border border-[#D7BB91]/60 shadow-xs',
    labelFormat: 'FAMILY-TESTED • UAE-BASED',
    cardThumbnailWrapper:
      'relative h-48 sm:h-52 overflow-hidden bg-white block p-2 bg-white rounded-t-3xl border-b-2 border-[#D7BB91]/40',
    cardThumbnailInner:
      'w-full h-full rounded-2xl overflow-hidden border border-[#D7BB91]/30',
    cardThumbnailBorder:
      'border-2 border-[#D7BB91]/60',
    articleBannerOuter:
      'rounded-[30px] sm:rounded-[38px] p-2.5 sm:p-3.5 bg-white border-2 border-[#D7BB91]/60 shadow-[0_12px_40px_rgba(215,187,145,0.18)] ring-4 ring-[#F8EDEF] overflow-hidden transition-all duration-500',
    articleBannerInner:
      'w-full h-80 sm:h-[420px] rounded-[20px] sm:rounded-[26px] overflow-hidden bg-[#F8EDEF] border border-[#D7BB91]/40',
    articleBannerShadow:
      'shadow-soft',
  },

  'frosted-halo-border': {
    id: 'frosted-halo-border',
    name: 'Frosted Glass Halo Border',
    sampleLabel: 'BORDER 2',
    subtitle: 'No solid line — translucent frosted glass aura with ambient glow',
    borderType: 'Translucent Frosted Halo',
    badge: 'Minimal Glassmorphism',
    icon: '🪞',
    description:
      'Removes standard solid lines completely in favor of a modern frosted-glass halo that diffuses into the soft blush background with a polished glassmorphism edge.',
    features: [
      'Translucent frosted-glass backdrop aura (backdrop-blur-md)',
      'Subtle white glass edge reflection (ring-1 ring-white/80)',
      'No heavy or harsh solid border lines',
      'Clean, ultra-modern, and weightless visual presence'
    ],
    bestFor: 'Modern minimalism, airy layouts, and effortless luxury.',
    heroOuter:
      'relative w-full max-w-[350px] sm:max-w-[400px] aspect-[4/5] rounded-[32px] sm:rounded-[40px] p-3 sm:p-3.5 bg-white/45 backdrop-blur-md border border-white/80 shadow-[0_20px_50px_rgba(104,56,70,0.12)] transition-all duration-500 hover:bg-white/60 hover:shadow-[0_25px_60px_rgba(104,56,70,0.18)]',
    heroInner:
      'w-full h-full rounded-[24px] sm:rounded-[30px] overflow-hidden bg-[#F8EDEF] shadow-sm',
    heroBadge:
      'bg-white/85 backdrop-blur-md text-[#683846] text-[7.5px] sm:text-[8px] font-sans font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-white/60 shadow-2xs',
    labelFormat: 'FAMILY-TESTED • UAE-BASED',
    cardThumbnailWrapper:
      'relative h-48 sm:h-52 overflow-hidden bg-[#F8EDEF] block p-2 bg-white/50 backdrop-blur-sm rounded-t-3xl border-b border-white/80',
    cardThumbnailInner:
      'w-full h-full rounded-2xl overflow-hidden',
    cardThumbnailBorder:
      'border border-white/80',
    articleBannerOuter:
      'rounded-[32px] sm:rounded-[40px] p-2.5 sm:p-3 bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_14px_40px_rgba(104,56,70,0.10)] overflow-hidden transition-all duration-500',
    articleBannerInner:
      'w-full h-80 sm:h-[420px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-[#F8EDEF]',
    articleBannerShadow:
      'shadow-soft',
  },

  'artisan-stitched-border': {
    id: 'artisan-stitched-border',
    name: 'Artisan Stitched / Dashed Border',
    sampleLabel: 'BORDER 3',
    subtitle: 'Couture dashed stitch line in soft berry rose with ivory mat',
    borderType: 'Dashed Couture Stitching',
    badge: 'Artisan & Handcrafted',
    icon: '🧵',
    description:
      'Features a high-fashion couture dashed stitch border in soft berry rose around a creamy linen mat. Warm, handcrafted, and delightfully feminine.',
    features: [
      'Artisan dashed stitch perimeter line (#B75B70)',
      'Creamy ivory linen card mat background (#FFFDF9)',
      'Layered multi-tone border depth',
      'Charming European stationery / bespoke boutique look'
    ],
    bestFor: 'Mum life memories, boutique finds, kids activities, and dining reviews.',
    heroOuter:
      'relative w-full max-w-[350px] sm:max-w-[400px] aspect-[4/5] rounded-[30px] sm:rounded-[38px] p-3.5 sm:p-4 bg-[#FFFDF9] border-2 border-dashed border-[#B75B70]/50 shadow-[0_16px_45px_rgba(183,91,112,0.16)] transition-all duration-500 hover:border-[#B75B70]',
    heroInner:
      'w-full h-full rounded-[20px] sm:rounded-[26px] overflow-hidden bg-[#F8EDEF] border-2 border-white shadow-xs',
    heroBadge:
      'bg-[#B75B70] text-white text-[7.5px] sm:text-[8px] font-sans font-bold tracking-[0.2em] uppercase px-3.5 py-1 rounded-full border border-white/30 shadow-xs',
    labelFormat: 'FAMILY-TESTED • UAE-BASED',
    cardThumbnailWrapper:
      'relative h-48 sm:h-52 overflow-hidden bg-[#FFFDF9] block p-2 bg-[#FFFDF9] rounded-t-3xl border-b-2 border-dashed border-[#B75B70]/40',
    cardThumbnailInner:
      'w-full h-full rounded-2xl overflow-hidden border border-white',
    cardThumbnailBorder:
      'border-2 border-dashed border-[#B75B70]/40',
    articleBannerOuter:
      'rounded-[30px] sm:rounded-[38px] p-3 sm:p-4 bg-[#FFFDF9] border-2 border-dashed border-[#B75B70]/50 shadow-[0_14px_40px_rgba(183,91,112,0.12)] overflow-hidden transition-all duration-500',
    articleBannerInner:
      'w-full h-80 sm:h-[420px] rounded-[20px] sm:rounded-[26px] overflow-hidden bg-[#F8EDEF] border-2 border-white',
    articleBannerShadow:
      'shadow-soft',
  },

  'museum-mat-border': {
    id: 'museum-mat-border',
    name: 'Museum Passe-Partout Mat Border',
    sampleLabel: 'BORDER 4',
    subtitle: 'Wide ivory fine-art mat board with beveled shadow inset',
    borderType: 'Fine-Art Mat Board',
    badge: 'Gallery Heirloom',
    icon: '🖼️',
    description:
      'Emulates a museum-grade picture framing mat board. Provides a generous 20mm warm ivory border around the photograph with a fine-line beveled shadow inset.',
    features: [
      'Generous 20mm fine-art passe-partout mat board (p-5)',
      'Fine beveled inner frame line around the photo',
      'Timeless heirloom fine-art portrait presentation',
      'Warm natural ivory linen paper tone (#FFFCF8)'
    ],
    bestFor: 'Heartfelt family storytelling, personal essays, and signature memories.',
    heroOuter:
      'relative w-full max-w-[350px] sm:max-w-[400px] aspect-[4/5] rounded-2xl sm:rounded-3xl p-4 sm:p-5 pb-6 sm:pb-7 bg-[#FFFCF8] border border-[#E2D5C8] shadow-[0_16px_50px_rgba(51,45,47,0.12)] transition-all duration-500',
    heroInner:
      'w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F8EDEF] border border-[#DECBC0] shadow-inner',
    heroBadge:
      'bg-[#332D2F]/85 backdrop-blur-md text-[#FFFCF8] text-[7.5px] sm:text-[8px] font-sans font-medium tracking-[0.2em] uppercase px-3 py-1 rounded-sm border border-white/10 shadow-2xs',
    labelFormat: 'FAMILY-TESTED • UAE-BASED',
    cardThumbnailWrapper:
      'relative h-48 sm:h-52 overflow-hidden bg-[#FFFCF8] block p-2.5 pb-4 bg-[#FFFCF8] rounded-t-2xl border-b border-[#E2D5C8]',
    cardThumbnailInner:
      'w-full h-full rounded-lg overflow-hidden border border-[#DECBC0]',
    cardThumbnailBorder:
      'border border-[#E2D5C8]',
    articleBannerOuter:
      'rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 pb-5 bg-[#FFFCF8] border border-[#E2D5C8] shadow-[0_10px_35px_rgba(51,45,47,0.08)] overflow-hidden transition-all duration-500',
    articleBannerInner:
      'w-full h-80 sm:h-[420px] rounded-xl sm:rounded-2xl overflow-hidden bg-[#F8EDEF] border border-[#DECBC0]',
    articleBannerShadow:
      'shadow-soft',
  },

  'rosegold-gradient-border': {
    id: 'rosegold-gradient-border',
    name: 'Rose-Gold Metallic Gradient Border',
    sampleLabel: 'BORDER 5',
    subtitle: 'Smooth radiant gradient flowing from rose-gold to champagne blush',
    borderType: 'Metallic Gradient Border',
    badge: 'Radiant & Glowing',
    icon: '🌸',
    description:
      'A seamless multi-color gradient border that transitions gently from warm rose-gold through blush pink to champagne sand, creating an elegant luminous perimeter.',
    features: [
      'Seamless multi-hue metallic gradient perimeter (#E6CA9A to #E8B4B8)',
      'Subtle inner white spacer line for clean photo separation',
      'Radiant, feminine, and glowing appearance',
      'Perfect match for MummaBeeBlog blush & gold branding'
    ],
    bestFor: 'Beauty, lifestyle, mum pampering, and luxury UAE experiences.',
    heroOuter:
      'relative w-full max-w-[350px] sm:max-w-[400px] aspect-[4/5] rounded-[32px] sm:rounded-[40px] p-3 sm:p-3.5 bg-gradient-to-tr from-[#E6CA9A] via-[#E8B4B8] to-[#D7BB91] shadow-[0_18px_50px_rgba(183,91,112,0.20)] transition-all duration-500',
    heroInner:
      'w-full h-full rounded-[24px] sm:rounded-[30px] overflow-hidden bg-[#F8EDEF] border-2 border-white shadow-2xs',
    heroBadge:
      'bg-[#683846] text-[#F8EDEF] text-[7.5px] sm:text-[8px] font-sans font-bold tracking-[0.2em] uppercase px-3.5 py-1 rounded-full border border-white/20 shadow-xs',
    labelFormat: 'FAMILY-TESTED • UAE-BASED',
    cardThumbnailWrapper:
      'relative h-48 sm:h-52 overflow-hidden bg-[#F8EDEF] block p-2 bg-gradient-to-r from-[#E6CA9A]/80 via-[#E8B4B8]/80 to-[#D7BB91]/80 rounded-t-3xl border-b border-white',
    cardThumbnailInner:
      'w-full h-full rounded-2xl overflow-hidden border border-white',
    cardThumbnailBorder:
      'border-2 border-white',
    articleBannerOuter:
      'rounded-[32px] sm:rounded-[40px] p-2.5 sm:p-3.5 bg-gradient-to-tr from-[#E6CA9A] via-[#E8B4B8] to-[#D7BB91] shadow-[0_14px_40px_rgba(183,91,112,0.15)] overflow-hidden transition-all duration-500',
    articleBannerInner:
      'w-full h-80 sm:h-[420px] rounded-[24px] sm:rounded-[30px] overflow-hidden bg-[#F8EDEF] border-2 border-white',
    articleBannerShadow:
      'shadow-soft',
  },

  'layered-offset-border': {
    id: 'layered-offset-border',
    name: 'Layered Offset Card Border',
    sampleLabel: 'BORDER 6',
    subtitle: 'Dual-card stacked border with terracotta blush shadow backing',
    borderType: 'Stacked Card Backdrop',
    badge: 'Chic & Dynamic',
    icon: '📐',
    description:
      'A multi-dimensional stacked card border where the white primary frame floats above a secondary warm terracotta blush backdrop card, giving depth and chic modern flair.',
    features: [
      'Multi-card layered depth with subtle 2° tilt offset backdrop',
      'Crisp primary photo frame with pure white casing',
      'Tactile magazine scrapbook aesthetic',
      'Adds physical paper depth and visual excitement'
    ],
    bestFor: 'Trending guides, seasonal roundups, and active family lifestyle.',
    heroOuter:
      'relative w-full max-w-[340px] sm:max-w-[390px] aspect-[4/5] rounded-[30px] sm:rounded-[38px] p-3 sm:p-3.5 bg-white border-2 border-white shadow-[0_20px_50px_rgba(183,91,112,0.20)] ring-8 ring-[#F2DCD8]/80 ring-offset-4 ring-offset-[#F8EDEF] transition-all duration-500 hover:ring-[#B75B70]/40',
    heroInner:
      'w-full h-full rounded-[22px] sm:rounded-[28px] overflow-hidden bg-[#F8EDEF] border border-[#E8D4CE] shadow-2xs',
    heroBadge:
      'bg-[#DF2A64] text-white text-[7.5px] sm:text-[8px] font-sans font-bold tracking-[0.2em] uppercase px-3.5 py-1 rounded-full border border-white/30 shadow-md',
    labelFormat: 'FAMILY-TESTED • UAE-BASED',
    cardThumbnailWrapper:
      'relative h-48 sm:h-52 overflow-hidden bg-[#F8EDEF] block p-2 bg-gradient-to-b from-white to-[#FDF0EE] rounded-t-3xl border-b-2 border-[#E8D4CE]',
    cardThumbnailInner:
      'w-full h-full rounded-2xl overflow-hidden border border-[#E8D4CE]',
    cardThumbnailBorder:
      'border-2 border-[#E8D4CE]',
    articleBannerOuter:
      'rounded-[30px] sm:rounded-[38px] p-2.5 sm:p-3.5 bg-white border-2 border-white shadow-[0_16px_45px_rgba(183,91,112,0.16)] ring-4 ring-[#F2DCD8] ring-offset-2 overflow-hidden transition-all duration-500',
    articleBannerInner:
      'w-full h-80 sm:h-[420px] rounded-[22px] sm:rounded-[28px] overflow-hidden bg-[#F8EDEF]',
    articleBannerShadow:
      'shadow-soft',
  },
};

export const DEFAULT_FRAME_STYLE: FrameStyle = 'double-gold-border';
