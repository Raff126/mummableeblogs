export interface DiscoveryCard {
  title: string;
  description: string;
  icon: string;
  link: string;
  color: 'pink' | 'sand' | 'teal' | 'rose' | 'burgundy';
}

export interface CategoryInfo {
  slug: string;
  name: string;
  heroEyebrow: string;
  heroTitle: string;
  heroIntro: string;
  description: string;
  subcategories: string[];
  color: string;
  icon: string;
  seoTitle: string;
  seoDescription: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  'uae-with-kids': {
    slug: 'uae-with-kids',
    name: 'UAE With Kids',
    heroEyebrow: 'DUBAI & ABU DHABI DAYS OUT',
    heroTitle: 'Things to Do with Kids in the UAE',
    heroIntro: 'Tested family activities, indoor venues, seasonal weekend ideas, and honest reviews across Dubai and Abu Dhabi.',
    description: 'Activities, attractions and family days out',
    subcategories: ['All Guides', 'Dubai Activities', 'Abu Dhabi Days Out', 'Weekend Ideas', 'Indoor Play'],
    color: 'pink',
    icon: '🏖️',
    seoTitle: 'Things to Do with Kids in Dubai & Abu Dhabi',
    seoDescription: 'Discover tested family activities, indoor play areas, theme parks, and weekend ideas across Dubai and Abu Dhabi.',
  },
  'family-life': {
    slug: 'family-life',
    name: 'Family Life',
    heroEyebrow: 'PARENTING & MOTHERHOOD',
    heroTitle: 'Everyday Family Life in the UAE',
    heroIntro: 'Honest reflections, mum routines, raising girls in the Emirates, and practical parenting advice.',
    description: 'School, motherhood and growing together',
    subcategories: ['All Guides', 'Mum Notes', 'Growing Up', 'Home & Routines', 'UAE Life'],
    color: 'rose',
    icon: '🏡',
    seoTitle: 'Everyday Family Life & Parenting in the UAE',
    seoDescription: 'Honest notes on parenting, raising children in the UAE, routines, and life between Dubai and Abu Dhabi.',
  },
  'food': {
    slug: 'food',
    name: 'Food & Dining',
    heroEyebrow: 'FAMILY DINING & CAFÉS',
    heroTitle: 'Family-Friendly Dining in the UAE',
    heroIntro: 'Restaurants, brunch spots, and cafés where parents can relax and kids are genuinely welcomed.',
    description: 'Family-friendly places worth trying',
    subcategories: ['All Guides', 'Family Brunch', 'Kid-Friendly Cafés', 'Weekend Dining', 'Healthy Recipes'],
    color: 'sand',
    icon: '🍽️',
    seoTitle: 'Family-Friendly Restaurants & Cafés in Dubai & Abu Dhabi',
    seoDescription: 'Honest parent reviews of family-friendly dining spots, weekend brunches, and casual dining in the UAE.',
  },
  'travel': {
    slug: 'travel',
    name: 'Family Travel',
    heroEyebrow: 'STAYCATIONS & GETAWAYS',
    heroTitle: 'Family Travel & UAE Staycations',
    heroIntro: 'Practical travel itineraries, resort staycations, packing checklists, and weekend getaways for families.',
    description: 'Tips, stays and itineraries',
    subcategories: ['All Guides', 'UAE Staycations', 'Short Flights', 'Resort Reviews', 'Packing & Logistics'],
    color: 'teal',
    icon: '✈️',
    seoTitle: 'UAE Family Travel & Resort Staycations',
    seoDescription: 'Tested staycation ideas, resort reviews, and family travel itineraries between Dubai, Abu Dhabi, and beyond.',
  },
  'school-and-activities': {
    slug: 'school-and-activities',
    name: 'School & Activities',
    heroEyebrow: 'SCHOOL & LEARNING',
    heroTitle: 'UAE School Life & Activities',
    heroIntro: 'Back-to-school checklists, after-school clubs, sports, and educational experiences for UAE kids.',
    description: 'School life, learning, clubs and activities',
    subcategories: ['All Guides', 'Back to School', 'After School Clubs', 'Learning', 'Kids Sports'],
    color: 'burgundy',
    icon: '📚',
    seoTitle: 'UAE School Guides & Kids Activities',
    seoDescription: 'Back-to-school checklists, term prep, after-school activities, and learning experiences for UAE families.',
  },
  'brands-we-love': {
    slug: 'brands-we-love',
    name: 'Brands We Love',
    heroEyebrow: 'CURATED FAMILY FAVORITES',
    heroTitle: 'Family Brands & Essentials We Genuinely Love',
    heroIntro: 'Tested family products, mum essentials, children’s gear, and vetted brands we personally use and trust in the UAE.',
    description: 'Tested family essentials, gear, and trusted brands',
    subcategories: ['All Guides', 'Family Essentials', 'Kids Gear', 'Mum Favorites', 'Home & Lifestyle'],
    color: 'burgundy',
    icon: '✨',
    seoTitle: 'Family Brands We Love | MummaBeeBlog',
    seoDescription: 'Discover our favorite tested family products, mum essentials, and trusted UAE brand recommendations.',
  },
  'the-expat-edit': {
    slug: 'the-expat-edit',
    name: 'The Expat Edit',
    heroEyebrow: 'CURATED FOR UAE EXPATS',
    heroTitle: 'The Expat Edit: Living & Thriving in the UAE',
    heroIntro: 'Curated essentials, school choices, community wisdom, neighbourhood guides, and honest advice for international families living in the UAE.',
    description: 'School choices, community wisdom and expat essentials',
    subcategories: ['All Guides', 'Expat Life', 'Community', 'School Choices', 'Home & Routines'],
    color: 'teal',
    icon: '🌍',
    seoTitle: 'The Expat Edit: UAE Family & Living Guides | MummaBeeBlog',
    seoDescription: 'Practical guides, school choices, and community wisdom for expat families raising children in Dubai, Abu Dhabi, and the UAE.',
  },
  'uae-deals': {
    slug: 'uae-deals',
    name: 'UAE Deals',
    heroEyebrow: 'EXCLUSIVE OFFERS & SAVINGS',
    heroTitle: 'Best UAE Family Deals & Discounts',
    heroIntro: 'Curated discount codes, seasonal family passes, staycation deals, and money-saving tips across Dubai and Abu Dhabi.',
    description: 'Discount codes, seasonal offers and family savings',
    subcategories: ['All Deals', 'Family Passes', 'Staycation Offers', 'Dining Deals', 'Promo Codes'],
    color: 'sand',
    icon: '🏷️',
    seoTitle: 'UAE Family Deals, Discounts & Promo Codes | MummaBeeBlog',
    seoDescription: 'Save on family days out, staycations, dining, and kids activities with curated UAE discounts and offers.',
  },
};

export const HOMEPAGE_DISCOVERY_CARDS: DiscoveryCard[] = [
  {
    title: 'UAE With Kids',
    description: 'Activities, days out and family guides',
    icon: '🏖️',
    link: '/uae-with-kids',
    color: 'pink',
  },
  {
    title: 'Food & Dining',
    description: 'Family-friendly restaurants, food discoveries and recipes',
    icon: '🍽️',
    link: '/food',
    color: 'sand',
  },
  {
    title: 'Family Travel',
    description: 'Trips, itineraries and practical travel',
    icon: '✈️',
    link: '/travel',
    color: 'teal',
  },
  {
    title: 'Brands We Love',
    description: 'Curated family essentials, kids gear and mum favorites',
    icon: '✨',
    link: '/brands-we-love',
    color: 'burgundy',
  },
  {
    title: 'UAE Deals',
    description: 'Exclusive family discounts, seasonal passes and promo codes',
    icon: '🏷️',
    link: '/uae-deals',
    color: 'sand',
  },
];
