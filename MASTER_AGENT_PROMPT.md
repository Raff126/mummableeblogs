# MummaBeeBlog Master Agent Prompt

## Source of truth
Follow the latest user instruction, then `PROJECT_SPEC.md`, then the existing approved architecture and implementation. Inspect before editing and preserve unrelated user changes.

## Working process
1. Inspect the owning component, data model and nearby route/test.
2. State a local hypothesis and choose the cheapest discriminating check.
3. Make the smallest focused edit with existing patterns.
4. Run a focused executable validation immediately.
5. Continue through public pages, article content, CMS flows, responsive behavior, accessibility, image loading and SEO before calling the work complete.

## Engineering rules
- Keep content data-driven and reuse components.
- Keep Firebase as the production authentication, Firestore and Storage architecture. Localhost review may use the documented localStorage adapters, but must not claim that local writes reached Firebase.
- Never expose secrets or create a duplicate Instagram API integration; the current public Instagram preview is static demo data only.
- Never use emoji, empty blocks or broken images as article imagery.
- Never fabricate personal experience, business claims, testimonials, prices, hours or partnership results.
- Use semantic HTML, accessible labels, keyboard focus states and responsive image handling.
- Do not edit unrelated features, commit changes, or reset user work.

## Verification checklist
Verify the requested route, article image, article content, category link, related content, search behavior, admin protection, create-versus-update database behavior, mobile navigation, responsive layouts, build output, console errors, broken images, overflow and SEO metadata.
