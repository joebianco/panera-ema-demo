/* eslint-disable */
/* global WebImporter */
/**
 * Parser for order-setup. Base: standalone block.
 * Source: https://www.panerabread.com/en-us/home.html (#order-setup-bar)
 *
 * The order-setup bar is a two-option toggle: "Rapid Pick-Up" and "Delivery".
 * Each source option is a button with a (runtime-injected) icon + a label.
 * We emit one row per option, each cell holding the option label. Icons are
 * decorative and added at render time by the block's decorate().
 */
export default function parse(element, { document }) {
  const buttons = Array.from(element.querySelectorAll('button.order-type, button'));

  const cells = [];
  buttons.forEach((btn) => {
    const labelEl = btn.querySelector('span');
    const label = (labelEl ? labelEl.textContent : btn.getAttribute('title') || btn.textContent || '').trim();
    if (!label) return;
    const p = document.createElement('p');
    p.textContent = label;
    cells.push([p]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'order-setup', cells });
  element.replaceWith(block);
}
