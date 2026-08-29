# MummaBeeBlog Project Specification

## Product
MummaBeeBlog is a warm, editorial UAE family publication for parents and families looking for useful ideas about kids, food, travel, family life, school and activities.

## Public routes
- `/`
- `/uae-with-kids`
- `/family-life`
- `/food`
- `/travel`
- `/school-and-activities`
- `/about`
- `/work-with-us`
- `/search`
- `/:category/:slug` for article detail pages

## Article contract
Articles are data-driven and include an id, title, slug, category, location, topic/tags, excerpt, featured image, content, author, publication date, status and SEO fields. Article cards must link to the matching category/slug URL and must render a real image with alt text. Demo articles currently use the bundled family photograph until CMS-managed editorial assets are supplied.

## Content rules
- Content is UAE-specific and editorial.
- Do not invent personal experiences, testimonials, partnerships, statistics or unverified venue information.
- Every published article needs meaningful content and a relevant featured image.

## CMS and integrations
Firebase authentication, Firestore and Storage remain the production backend architecture and Firebase Hosting project. For localhost review, the admin article and settings adapters use browser localStorage so create, edit, publish and delete flows can be tested without network access. Admin routes remain protected by the local demo login in this mode. Creating an article creates a new local record; editing updates only its record. The public Instagram section uses static demo data and must not connect a second/live Instagram API.

## Experience requirements
The public site needs working navigation, mobile navigation, category discovery, featured guides, latest family finds, search, article pages, related articles, About, Work With Us, Instagram demo content, newsletter states, responsive images, accessible forms and SEO metadata. The homepage order is hero, discovery, featured guides, latest family finds, Donne, Instagram preview, newsletter and footer. Validate desktop and mobile layouts and check for broken images and horizontal overflow.

## Current implementation note
The launch data and routes exist. Demo articles receive varied category-appropriate image assets, including the bundled family photograph and remote editorial image URLs. Replace demo assignments with verified article-specific CMS/media-library assets before production publication. The homepage includes a responsive static Instagram preview linking to the real profile; live API fetching remains disabled.
