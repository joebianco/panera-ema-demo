/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Panera Bread section breaks and section metadata.
 *
 * Driven entirely by payload.template.sections (page-templates.json). For each
 * configured section it:
 *   - inserts a <hr> section break before the section element (for every section
 *     except the first one that has content before it), and
 *   - appends a "Section Metadata" block (with the section's `style`) after the
 *     section element when a style is defined.
 *
 * Runs in afterTransform only — block parsers have already produced their tables,
 * so we operate on the final authorable DOM.
 *
 * Section selectors come from the template (verified against migration-work/
 * cleaned.html):
 *   - #top > section.swiper-slide:nth-of-type(4)  (Flavor Starts Here, warm-cream)
 *   - #top > section.swiper-slide:nth-of-type(6)  (MyPanera Rewards, light)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = payload && payload.template;
  const sections = template && template.sections;
  if (!sections || sections.length < 2) return;

  const doc = element.ownerDocument;

  // Process in reverse so inserted nodes do not shift the positions of
  // sections we have not handled yet.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl) continue;

    // Section Metadata block after the section, when a style is configured.
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (sectionEl.nextSibling) {
        sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
      } else {
        sectionEl.parentNode.appendChild(metaBlock);
      }
    }

    // Section break (<hr>) before every non-first section that has preceding content.
    if (i > 0 && sectionEl.previousElementSibling) {
      const hr = doc.createElement('hr');
      sectionEl.parentNode.insertBefore(hr, sectionEl);
    }
  }
}
