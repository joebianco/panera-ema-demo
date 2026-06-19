/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-category. Base: cards.
 * Source: https://www.panerabread.com/en-us/home.html
 * Generated: 2026-06-18
 *
 * Cards block: 2 columns, multiple rows.
 *   Row 1: block name (handled by createBlock)
 *   Each subsequent row = one menu category tile:
 *     Cell 1: category image (mandatory)
 *     Cell 2: text content — label as a linked heading + optional descriptor
 *
 * Source tiles are .iw-bcsa-slide containers. Each card (.pnra-card-style) wraps
 * its content in an <a> (the whole tile is clickable). Inside: a category image
 * (img.iw-ca-primary-category-image), a label (span.font-subhead--product-title),
 * and an optional descriptor (span.font-body.sm). The descriptor can appear twice
 * in the source markup — dedupe by keeping the first non-empty value.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.iw-bcsa-slide .pnra-card-style, .iw-bcsa-slide'));
  // Dedupe nested matches: keep only innermost card containers (those holding an anchor).
  const cardEls = cards.filter((c) => c.querySelector(':scope a[href], a[href]'));
  const seen = new Set();
  const uniqueCards = cardEls.filter((c) => {
    const link = c.querySelector('a[href]');
    const key = link ? link.getAttribute('href') : c.textContent.trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const cells = [];

  uniqueCards.forEach((card) => {
    const link = card.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    // --- Image (Cell 1) ---
    const img = card.querySelector('img.iw-ca-primary-category-image, img');

    // --- Label + descriptor (Cell 2) ---
    const contentCell = [];

    const labelEl = card.querySelector('span.font-subhead--product-title, .font-subhead--product-title');
    const labelText = labelEl ? (labelEl.textContent || '').replace(/\s+/g, ' ').trim() : '';

    if (labelText) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.setAttribute('title', labelText);
        a.textContent = labelText;
        h.append(a);
      } else {
        h.textContent = labelText;
      }
      contentCell.push(h);
    }

    // Optional descriptor (e.g. "Choose any two entrees."). May appear twice — keep first.
    let descriptorText = '';
    const descEls = Array.from(card.querySelectorAll('span.font-body.sm, span.font-body'));
    for (const d of descEls) {
      const txt = (d.textContent || '').replace(/\s+/g, ' ').trim();
      if (txt && txt !== labelText) { descriptorText = txt; break; }
    }
    if (descriptorText) {
      const p = document.createElement('p');
      p.textContent = descriptorText;
      contentCell.push(p);
    }

    if (!img && contentCell.length === 0) return;

    cells.push([img || '', contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });

  // --- Section header ("Browse Our Menu" + "Explore Menu" CTA) ---
  // Emitted as default content BEFORE the block (like the carousel header) so the
  // heading and CTA survive the markdown→DA conversion. Heading rendered as <h2>
  // (the source uses an h1, but the page already has its title h1; h2 keeps a
  // single page title). The "Explore Menu" CTA links to the menu landing page.
  const before = [];
  const headingEl = element.querySelector('h1, h2, h3');
  const headingText = headingEl ? (headingEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
  if (headingText) {
    const h2 = document.createElement('h2');
    h2.textContent = headingText;
    before.push(h2);
  }

  const ctaEl = element.querySelector('.iw-bcsa-btn-wrapper span.heavy, .iw-bcsa-btn-wrapper silo-button, silo-button');
  const ctaText = ctaEl ? (ctaEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
  if (ctaText) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', '/en-us/menu.html');
    a.textContent = ctaText;
    p.append(a);
    before.push(p);
  }

  element.replaceWith(...before, block);
}
