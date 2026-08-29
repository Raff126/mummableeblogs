# MummaBeeBlog — Next.js 14 UAE Family Guide Website

A responsive, high-performance marketing website and family guide publication built for **MummaBeeBlog**, led by Donne, raising two daughters between Dubai and Abu Dhabi.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and data-driven architecture ready for headless CMS migration.

---

## 🎨 Brand System & Visual Foundation

- **Desert Blush** (`#F8EDEF` / `bg-desert-blush`): Main background tint & soft-focus circles
- **Mumma Rose** (`#B75B70` / `text-mumma-rose`): Primary brand accent, category pills & links
- **Date Burgundy** (`#683846` / `bg-date-burgundy`): Header utility bar, dark cards, footer & primary buttons
- **Warm Sand** (`#D7BB91` / `bg-warm-sand`): Restrained accent & badges
- **Charcoal** (`#332D2F` / `text-charcoal`): Editorial body text
- **Typography**: *Cormorant Garamond* (headings) + *Inter* (body & nav)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and `npm`

### Installation & Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Access the site locally at: **`http://localhost:3000`**

---

## 📁 Project Architecture & Data Files

All website content is decoupled from layout components into typed TypeScript data files for seamless CMS migration:

- **`/data/nav.ts`**: Navigation structure, top bar banner text, and social links.
- **`/data/categories.ts`**: Category definitions (`uae-with-kids`, `food`, `travel`, `family-life`, `school-and-activities`) with metadata, color tokens, and icons.
- **`/data/articles.ts`**: Article content, answer-first direct summaries, quick facts, tags, read times, and author details.

---

## 📝 How to Add or Edit Articles

### 1. Adding a New Article

Open `/data/articles.ts` and append a new object to the `ARTICLES` array:

```typescript
{
  id: 'art-7',
  slug: 'new-dubai-family-spot',
  category: 'uae-with-kids',
  subcategory: 'Dubai Activities',
  title: 'My New Article Title',
  excerpt: 'A short compelling summary for article cards.',
  answerSummary: 'The quick answer for busy parents looking for immediate information.',
  content: `
    <h2>First Heading</h2>
    <p>Detailed body content goes here in Donne's practical voice.</p>
  `,
  author: 'Donne',
  publishedAt: '2026-08-25',
  readTime: '4 min read',
  featuredImage: 'https://images.unsplash.com/photo-...',
  imageAlt: 'Descriptive alt text',
  location: 'Dubai',
  ageGroup: 'All Ages',
  indoorOutdoor: 'Indoor',
  budget: 'Free',
  tags: ['Dubai', 'Weekend Ideas'],
  quickFacts: {
    location: 'Venue Location',
    bestFor: 'Ages 2-8',
    timeNeeded: '2 hours',
    budget: 'Free',
  },
  mummaBeeTip: 'Pro tip for parents visiting this venue!',
}
```

### 2. Modifying Navigation or Categories

- Update `/data/nav.ts` to add or rename top-level pages.
- Update `/data/categories.ts` to adjust subcategory chips, SEO descriptions, or category icons.

---

## 🌐 SEO & Technical Features

- **Dynamic Sitemap**: Automatically generated at `/sitemap.xml` (`app/sitemap.ts`).
- **Robots Config**: Configured at `/robots.txt` (`app/robots.ts`).
- **Structured Data**: JSON-LD `Article` and `BreadcrumbList` schemas injected on all article pages.
- **Canonical URLs & Open Graph**: Full metadata configured across every route.
