/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-benefit. Base: cards.
 * Source: https://www.panerabread.com/en-us/home.html
 * Generated: 2026-06-18
 *
 * Cards block: 2 columns, multiple rows.
 *   Row 1: block name (handled by createBlock)
 *   Each subsequent row = one benefit item:
 *     Cell 1: icon image (mandatory)
 *     Cell 2: text content — title (heading) + description
 *
 * Source benefit items are .iw-bc-desc-container cards. Each holds an icon
 * (img.iw-braze-up-icon), a title (p.font-body.heavy), and a description
 * (p.font-body.sm). The page-templates selector matches the .iw-bc-desc-container
 * directly, so this parser handles either a wrapping container (multiple items)
 * or a single benefit card (the matched element itself).
 */
export default function parse(element, { document }) {
  // Find benefit cards within the element; if the element IS a single card, use it directly.
  let items = Array.from(element.querySelectorAll('.iw-bc-desc-container'));
  if (items.length === 0) {
    items = element.classList.contains('iw-bc-desc-container') ? [element] : [element];
  }

  const cells = [];

  items.forEach((item) => {
    // --- Icon image (Cell 1) ---
    const icon = item.querySelector('img.iw-braze-up-icon, img');

    // --- Title + description (Cell 2) ---
    const contentCell = [];

    const titleEl = item.querySelector('p.font-body.heavy, .text-left p.font-body.heavy');
    const titleText = titleEl ? (titleEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
    if (titleText) {
      const h = document.createElement('h3');
      h.textContent = titleText;
      contentCell.push(h);
    }

    // Description: the source markup nests a <div><span> INSIDE the <p.font-body.sm>,
    // which is invalid HTML — parsers auto-close the <p>, leaving it empty and the
    // text orphaned in sibling nodes. So read the description from the whole text
    // container (.text-left) and strip the title text rather than the empty <p>.
    let descText = '';
    const descContainer = item.querySelector('.text-left') || item;
    const fullText = (descContainer.textContent || '').replace(/\s+/g, ' ').trim();
    if (fullText && titleText && fullText.startsWith(titleText)) {
      descText = fullText.slice(titleText.length).trim();
    } else if (fullText && fullText !== titleText) {
      descText = fullText;
    }
    if (descText && descText !== titleText) {
      const p = document.createElement('p');
      p.textContent = descText;
      contentCell.push(p);
    }

    if (!icon && contentCell.length === 0) return;

    cells.push([icon || '', contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-benefit', cells });
  element.replaceWith(block);
}
