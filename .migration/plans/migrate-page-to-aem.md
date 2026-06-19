# Panera Bread Homepage Migration Plan

## Overview

Migrate the Panera Bread homepage (`https://www.panerabread.com/en-us/home.html`) to AEM Edge Delivery Services. This is a **single-page migration** with full coverage:

- **Page content** — main body sections and blocks
- **Navigation/header** — site header and nav instrumentation
- **Footer** — site footer
- **Design/styling** — design tokens, CSS, and visual fidelity to the original

## Approach

The migration runs in phases. We start by analyzing the source page to understand its structure, then build the import infrastructure (parsers/transformers), generate the EDS content, and finally instrument navigation/footer and apply the design styling. Each phase ends with a verification step against the original.

## Phases

### 1. Project Setup & Discovery
- Confirm project type (doc / da / xwalk) and the Block Library endpoint for available EDS blocks.
- Establish the migration workspace and capture source page assets.

### 2. Page Analysis
- Scrape and analyze the homepage: identify sections, content sequences, and authoring decisions.
- Detect block variants (hero, cards, promos, carousels, etc.) and map them to existing EDS blocks or flag new variants.
- Produce analysis artifacts (structure JSON, screenshots, cleaned HTML).

### 3. Import Infrastructure
- Create the page template and block mappings (DOM selectors per variant).
- Generate block parsers and page transformers (cleanup, sections, any Dynamic Media handling).
- Validate parsers/transformers against the cleaned DOM.

### 4. Content Import
- Bundle and run the import script to generate the EDS page content.
- Verify the imported page renders in preview and matches the original's content structure.

### 5. Navigation / Header
- Instrument the header and navigation (desktop + mobile + any megamenu) from source screenshots.
- Validate nav structure and links against the original.

### 6. Footer
- Migrate the footer (desktop + mobile), mapping sections, links, and behaviors.
- Validate footer appearance and content.

### 7. Design & Styling
- Extract design tokens (colors, typography, spacing) from the source.
- Apply CSS to blocks and site-level styles to match the original visual design.

### 8. Visual Critique & Fixes
- Compare the migrated page against the original at block, section, and full-page level.
- Iterate on styling fixes until visual fidelity is acceptable.

## Notes & Open Questions

- Panera's homepage is highly dynamic (location-aware promos, carousels, possible personalization). Some content may render client-side; we'll capture a representative snapshot and note any dynamic regions that can't be fully reproduced statically.
- Header/footer instrumentation requires screenshots of the live site — these will be gathered during analysis.

## Checklist

- [ ] Confirm project type and Block Library endpoint (discovery)
- [ ] Scrape source homepage and capture screenshots/assets
- [ ] Analyze page structure — sections, sequences, block variants
- [ ] Map blocks to existing EDS blocks; create any new variants
- [ ] Create page template and block mappings (DOM selectors)
- [ ] Generate and validate block parsers
- [ ] Generate and validate page transformers (cleanup, sections, DM/Scene7)
- [ ] Bundle and run the import script to produce EDS content
- [ ] Verify imported content renders correctly in preview
- [ ] Instrument header/navigation (desktop, mobile, megamenu) and validate
- [ ] Migrate footer (desktop, mobile) and validate
- [ ] Extract design tokens and apply site + block styling
- [ ] Run visual critique vs. original and apply fixes
- [ ] Final full-page review against the original homepage

> Execution requires Execute mode. Approve this plan to begin, and I'll start with discovery and page analysis.
