/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import orderSetupParser from './parsers/order-setup.js';
import heroPromoParser from './parsers/hero-promo.js';
import carouselProductParser from './parsers/carousel-product.js';
import cardsPromoParser from './parsers/cards-promo.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsBenefitParser from './parsers/cards-benefit.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/panera-cleanup.js';
import sectionsTransformer from './transformers/panera-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Panera Bread homepage with header, hero, product carousel, promo cards, menu category grid, and MyPanera rewards sections, plus footer',
  urls: [
    'https://www.panerabread.com/en-us/home.html',
  ],
  blocks: [
    {
      name: 'order-setup',
      instances: [
        '#order-setup-bar',
      ],
    },
    {
      name: 'hero-promo',
      instances: [
        '#top > section.swiper-slide:nth-of-type(1) div.iw-braze-card',
        '#top > section.swiper-slide:nth-of-type(6) div.iw-bc-img-container',
      ],
    },
    {
      name: 'carousel-product',
      instances: [
        '#top > section.swiper-slide:nth-of-type(2) div.iw-product-carousel-v2',
      ],
    },
    {
      name: 'cards-promo',
      instances: [
        '#top > section.swiper-slide:nth-of-type(4) div.iw-bsbs-cards-container',
      ],
    },
    {
      name: 'cards-category',
      instances: [
        '#top > section.swiper-slide:nth-of-type(5) div.iw-braze-category-section-a',
      ],
    },
    {
      name: 'cards-benefit',
      instances: [
        '#top > section.swiper-slide:nth-of-type(6) div.iw-bc-desc-container',
      ],
    },
  ],
  sections: [
    {
      id: 'brazeSideBySide',
      name: 'Flavor Starts Here',
      selector: '#top > section.swiper-slide:nth-of-type(4)',
      style: 'warm-cream',
      blocks: ['cards-promo'],
      defaultContent: ['#top > section.swiper-slide:nth-of-type(4) p.font-head--sm.pds-color-midnight.text-uppercase'],
    },
    {
      id: 'userProgram',
      name: 'MyPanera Rewards',
      selector: '#top > section.swiper-slide:nth-of-type(6)',
      style: 'light',
      blocks: ['hero-promo', 'cards-benefit'],
      defaultContent: ['#top > section.swiper-slide:nth-of-type(6) p.font-head--sm.text-uppercase'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'order-setup': orderSetupParser,
  'hero-promo': heroPromoParser,
  'carousel-product': carouselProductParser,
  'cards-promo': cardsPromoParser,
  'cards-category': cardsCategoryParser,
  'cards-benefit': cardsBenefitParser,
};

// TRANSFORMER REGISTRY - cleanup runs first, section transformer after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
