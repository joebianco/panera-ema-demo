/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards.
 * Source: https://www.panerabread.com/en-us/home.html
 * Generated: 2026-06-18
 *
 * Cards block: 2 columns, multiple rows.
 *   Row 1: block name (handled by createBlock)
 *   Each subsequent row = one card:
 *     Cell 1: image (mandatory)
 *     Cell 2: text content — title (heading) + description + CTA
 *
 * Source cards are .iw-braze-side-by-side-card. Each has a copy container
 * (.iw-bsbsc-copy-container) with a heading (p.font-subhead) and description
 * (p.font-body), a CTA (silo-button), and an image (.iw-bsbsc-img-container img).
 */
export default function parse(element, { document }) {
  // Convert Panera <silo-button> into an anchor so the CTA is preserved as a link.
  const buttonToLink = (btn) => {
    const label = (btn.textContent || '').trim();
    if (!label) return null;
    const href = btn.getAttribute('href')
      || (btn.querySelector('a') && btn.querySelector('a').getAttribute('href'))
      || '#';
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = label;
    return a;
  };

  const cards = Array.from(element.querySelectorAll('.iw-braze-side-by-side-card'));

  const cells = [];

  cards.forEach((card) => {
    // --- Image (Cell 1) ---
    const img = card.querySelector('.iw-bsbsc-img-container img, img.iw-bsbsc-img, img');

    // --- Text content (Cell 2) ---
    const contentCell = [];

    const heading = card.querySelector('.iw-bsbc-main-content-container p.font-subhead, p.font-subhead');
    if (heading) {
      const h = document.createElement('h3');
      h.textContent = (heading.textContent || '').trim();
      contentCell.push(h);
    }

    const description = card.querySelector('.iw-bsbc-main-content-container p.font-body, p.font-body.tight, p.font-body');
    if (description && description !== heading) {
      const p = document.createElement('p');
      p.textContent = (description.textContent || '').replace(/\s+/g, ' ').trim();
      contentCell.push(p);
    }

    // CTA (leaf silo-buttons only).
    Array.from(card.querySelectorAll('.iw-bsbsc-cta-container silo-button, silo-button, a.button'))
      .filter((btn) => !btn.querySelector('silo-button, a.button'))
      .map(buttonToLink)
      .filter(Boolean)
      .forEach((cta) => {
        const p = document.createElement('p');
        p.append(cta);
        contentCell.push(p);
      });

    // Skip empty cards.
    if (!img && contentCell.length === 0) return;

    cells.push([img || '', contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
