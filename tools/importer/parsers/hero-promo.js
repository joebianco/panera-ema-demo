/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-promo. Base: hero.
 * Source: https://www.panerabread.com/en-us/home.html
 * Generated: 2026-06-18
 *
 * Hero block: 1 column, 3 rows.
 *   Row 1: block name (handled by createBlock)
 *   Row 2: background image (optional)
 *   Row 3: content cell — title (heading), subheading text, CTA(s)
 *
 * Handles two source shapes:
 *   A) Promo banner: image + text-image headline + paragraph + 1 CTA
 *      (.iw-bc-content with sibling .iw-bc-img-container background image)
 *   B) MyPanera join panel: background image + overlay heading image + paragraph + 2 CTAs
 *      (.iw-bc-img-container with .iw-bc-image-content overlay)
 */
export default function parse(element, { document }) {
  // Convert Panera <silo-button> custom elements into anchors so CTAs are preserved as links.
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

  // --- Background image (Row 2) ---
  // Shape A: dedicated .iw-bc-img-container sibling holds the main banner image.
  // Shape B: the element itself is the .iw-bc-img-container; its direct .iw-bc-img is the background.
  let bgImage = element.querySelector('.iw-bc-img-container img.iw-bc-img, .iw-bc-img-container > img');
  if (!bgImage) {
    bgImage = element.querySelector(':scope > img.iw-bc-img, img.iw-bc-img');
  }
  if (!bgImage) {
    bgImage = element.querySelector('img');
  }

  // --- Content (Row 3) ---
  const contentCell = [];

  // Heading: Panera renders the headline as a stylized text-image (the "GREENS
  // GLOW-UP" graphic). Preserve it as an actual image so the brand treatment is
  // kept. Shape A uses .iw-bc-text-img; Shape B uses the overlay image inside
  // .iw-bc-image-content. Trim the alt to the short brand phrase (the source alt
  // repeats the full descriptive sentence, which would duplicate the paragraph).
  const headingImg = element.querySelector('img.iw-bc-text-img, .iw-bc-image-content img');
  if (headingImg && headingImg !== bgImage) {
    const rawAlt = (headingImg.getAttribute('alt') || '').trim();
    // Keep only the leading brand phrase (text before the first sentence break).
    const shortAlt = rawAlt.split(/(?<=[a-z])(?=[A-Z])|[.!?]/)[0].trim() || rawAlt;
    headingImg.setAttribute('alt', shortAlt);
    contentCell.push(headingImg);
  }

  // Subheading / supporting paragraph.
  const paragraphs = Array.from(
    element.querySelectorAll('.iw-bc-desc-container > p, .iw-bc-image-content > p, .iw-bc-content p'),
  ).filter((p) => (p.textContent || '').trim());
  paragraphs.forEach((p) => contentCell.push(p));

  // CTAs: one or more silo-buttons (promo = 1, join panel = 2).
  // Only take leaf silo-buttons (those that do NOT contain a nested silo-button)
  // so wrapper elements don't merge multiple labels into a single link.
  // Wrap each CTA in its own paragraph so adjacent links don't collapse into one.
  const ctaButtons = Array.from(
    element.querySelectorAll('silo-button, a.iw-bc-button, a.button'),
  ).filter((btn) => !btn.querySelector('silo-button, a.iw-bc-button, a.button'));
  ctaButtons
    .map(buttonToLink)
    .filter(Boolean)
    .forEach((cta) => {
      const p = document.createElement('p');
      p.append(cta);
      contentCell.push(p);
    });

  // Empty-block guard.
  if (contentCell.length === 0 && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImage) cells.push([bgImage]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
