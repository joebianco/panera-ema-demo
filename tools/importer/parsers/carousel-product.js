/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-product. Base: carousel.
 * Source: https://www.panerabread.com/en-us/home.html
 *
 * Section structure produced:
 *   1. A default-content heading ("WHAT GUESTS ARE LOVING") inserted before the block.
 *   2. The carousel block: 2 columns, one row per slide.
 *        Cell 1: slide image (mandatory)
 *        Cell 2: text content — optional badge (NEW RECIPE! / New Item),
 *                title (heading) + short calorie descriptor
 *
 * Source slides live in .pnra-slide / .iw-pcv2-slide containers. Interactive
 * ordering UI (Add/Customize/size selectors) and sodium warnings are excluded.
 */
export default function parse(element, { document }) {
  const slides = Array.from(element.querySelectorAll('.pnra-slide, .iw-pcv2-slide'));

  const cells = [];

  slides.forEach((slide) => {
    // --- Image (Cell 1) ---
    const img = slide.querySelector('img.iw-pgi-img, .iw-pgi-img-container img, img');

    // --- Badge (Cell 2, top) — "NEW RECIPE!" or "New Item" ---
    let badgeText = '';
    const badgeContainer = slide.querySelector('.iw-pgi-badges, .iw-pgi-tags, .iw-pgi-img-cover');
    if (badgeContainer) {
      const txt = (badgeContainer.textContent || '').replace(/\s+/g, ' ').trim();
      if (/new recipe/i.test(txt)) badgeText = 'NEW RECIPE!';
      else if (/new item/i.test(txt)) badgeText = 'New Item';
    }
    // "New Item" is rendered as an image alt in the source; check img alts too.
    if (!badgeText) {
      const badgeImg = slide.querySelector('.iw-pgi-img-cover img[alt], .iw-pgi-badges img[alt]');
      if (badgeImg && /new item/i.test(badgeImg.getAttribute('alt') || '')) badgeText = 'New Item';
    }

    // --- Title (Cell 2) ---
    const titleEl = slide.querySelector(
      'a p.font-subhead--product-title, p.font-subhead--product-title, a[title] p, a[title]',
    );
    const titleText = titleEl ? (titleEl.textContent || '').trim() : '';

    // --- Short descriptor text (Cell 2, below title) ---
    let descriptorText = '';
    const infoParas = Array.from(slide.querySelectorAll('p.iw-pgi-ii-text'));
    infoParas.forEach((p) => {
      const txt = (p.textContent || '').replace(/\s+/g, ' ').trim();
      if (/sodium warning/i.test(txt)) return;
      if (/cal\b/i.test(txt) || txt.includes('·')) {
        const calMatch = txt.match(/[\d,]+\s*Cal/i);
        descriptorText = calMatch ? calMatch[0] : txt;
      }
    });

    // Skip empty slides (no image and no title).
    if (!img && !titleText) return;

    const contentCell = [];
    if (badgeText) {
      const badge = document.createElement('p');
      badge.textContent = badgeText;
      // Mark the badge so the block decorator/CSS can style it.
      badge.setAttribute('data-badge', badgeText === 'New Item' ? 'new-item' : 'new-recipe');
      contentCell.push(badge);
    }
    if (titleText) {
      const h = document.createElement('h3');
      h.textContent = titleText;
      contentCell.push(h);
    }
    if (descriptorText) {
      const p = document.createElement('p');
      p.textContent = descriptorText;
      contentCell.push(p);
    }

    cells.push([img || '', contentCell]);
  });

  // Empty-block guard: no usable slides.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- Header row (heading + category tabs + "Explore all" CTA) ---
  // Emitted as the FIRST block row so DA preserves its content (default content
  // outside the block loses list/class structure). The block decorator detects
  // this row (heading present) and renders it as the carousel header, not a slide.
  const headingEl = element.querySelector('.iw-pcv2-header, h3');
  const headingText = headingEl ? (headingEl.textContent || '').replace(/\s+/g, ' ').trim() : '';

  const tabEls = Array.from(element.querySelectorAll('.iw-pcv2-tablist .pnra-tab, .pds-tablist-item'));
  const tabs = tabEls.map((t) => (t.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean);

  const ctaEl = element.querySelector('.iw-pcv2-btn-wrapper span.heavy, .iw-pcv2-btn-wrapper silo-button');
  const ctaText = ctaEl ? (ctaEl.textContent || '').replace(/\s+/g, ' ').trim() : '';

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-product', cells });

  // --- Header emitted as default content BEFORE the block ---
  // The header (heading + category tabs + "Explore all" CTA) is placed outside
  // the block because a block's markdown-table cell can't reliably hold an <h2>
  // plus a multi-link paragraph (GFM table cells are lossy). As regular markdown
  // before the block, a heading and a delimited links paragraph both survive.
  const before = [];

  if (headingText) {
    const h2 = document.createElement('h2');
    h2.textContent = headingText;
    before.push(h2);
  }

  if (tabs.length || ctaText) {
    // Single paragraph holding the category-tab links and the "Explore all" CTA,
    // separated by " · " delimiters (consecutive links with no separating text
    // get merged by md2da). The block decorator splits them into the tab row +
    // CTA. The leading "carousel-product-links" marker is added in the decorator.
    const p = document.createElement('p');
    const allLinks = [];
    tabs.forEach((label) => {
      const a = document.createElement('a');
      const slug = label.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      a.setAttribute('href', `/en-us/menu/categories/${slug}.html`);
      a.textContent = label;
      allLinks.push(a);
    });
    if (ctaText) {
      const a = document.createElement('a');
      a.setAttribute('href', '/en-us/menu.html');
      a.textContent = ctaText;
      allLinks.push(a);
    }
    allLinks.forEach((a, idx) => {
      if (idx > 0) p.append(document.createTextNode(' · '));
      p.append(a);
    });
    before.push(p);
  }

  element.replaceWith(...before, block);
}
