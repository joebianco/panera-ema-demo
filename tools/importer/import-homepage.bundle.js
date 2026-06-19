/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/order-setup.js
  function parse(element, { document }) {
    const buttons = Array.from(element.querySelectorAll("button.order-type, button"));
    const cells = [];
    buttons.forEach((btn) => {
      const labelEl = btn.querySelector("span");
      const label = (labelEl ? labelEl.textContent : btn.getAttribute("title") || btn.textContent || "").trim();
      if (!label) return;
      const p = document.createElement("p");
      p.textContent = label;
      cells.push([p]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "order-setup", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function parse2(element, { document }) {
    const buttonToLink = (btn) => {
      const label = (btn.textContent || "").trim();
      if (!label) return null;
      const href = btn.getAttribute("href") || btn.querySelector("a") && btn.querySelector("a").getAttribute("href") || "#";
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = label;
      return a;
    };
    let bgImage = element.querySelector(".iw-bc-img-container img.iw-bc-img, .iw-bc-img-container > img");
    if (!bgImage) {
      bgImage = element.querySelector(":scope > img.iw-bc-img, img.iw-bc-img");
    }
    if (!bgImage) {
      bgImage = element.querySelector("img");
    }
    const contentCell = [];
    const headingImg = element.querySelector("img.iw-bc-text-img, .iw-bc-image-content img");
    if (headingImg && headingImg !== bgImage) {
      const rawAlt = (headingImg.getAttribute("alt") || "").trim();
      const shortAlt = rawAlt.split(new RegExp("(?<=[a-z])(?=[A-Z])|[.!?]"))[0].trim() || rawAlt;
      headingImg.setAttribute("alt", shortAlt);
      contentCell.push(headingImg);
    }
    const paragraphs = Array.from(
      element.querySelectorAll(".iw-bc-desc-container > p, .iw-bc-image-content > p, .iw-bc-content p")
    ).filter((p) => (p.textContent || "").trim());
    paragraphs.forEach((p) => contentCell.push(p));
    const ctaButtons = Array.from(
      element.querySelectorAll("silo-button, a.iw-bc-button, a.button")
    ).filter((btn) => !btn.querySelector("silo-button, a.iw-bc-button, a.button"));
    ctaButtons.map(buttonToLink).filter(Boolean).forEach((cta) => {
      const p = document.createElement("p");
      p.append(cta);
      contentCell.push(p);
    });
    if (contentCell.length === 0 && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-product.js
  function parse3(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".pnra-slide, .iw-pcv2-slide"));
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector("img.iw-pgi-img, .iw-pgi-img-container img, img");
      let badgeText = "";
      const badgeContainer = slide.querySelector(".iw-pgi-badges, .iw-pgi-tags, .iw-pgi-img-cover");
      if (badgeContainer) {
        const txt = (badgeContainer.textContent || "").replace(/\s+/g, " ").trim();
        if (/new recipe/i.test(txt)) badgeText = "NEW RECIPE!";
        else if (/new item/i.test(txt)) badgeText = "New Item";
      }
      if (!badgeText) {
        const badgeImg = slide.querySelector(".iw-pgi-img-cover img[alt], .iw-pgi-badges img[alt]");
        if (badgeImg && /new item/i.test(badgeImg.getAttribute("alt") || "")) badgeText = "New Item";
      }
      const titleEl = slide.querySelector(
        "a p.font-subhead--product-title, p.font-subhead--product-title, a[title] p, a[title]"
      );
      const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
      let descriptorText = "";
      const infoParas = Array.from(slide.querySelectorAll("p.iw-pgi-ii-text"));
      infoParas.forEach((p) => {
        const txt = (p.textContent || "").replace(/\s+/g, " ").trim();
        if (/sodium warning/i.test(txt)) return;
        if (/cal\b/i.test(txt) || txt.includes("\xB7")) {
          const calMatch = txt.match(/[\d,]+\s*Cal/i);
          descriptorText = calMatch ? calMatch[0] : txt;
        }
      });
      if (!img && !titleText) return;
      const contentCell = [];
      if (badgeText) {
        const badge = document.createElement("p");
        badge.textContent = badgeText;
        badge.setAttribute("data-badge", badgeText === "New Item" ? "new-item" : "new-recipe");
        contentCell.push(badge);
      }
      if (titleText) {
        const h = document.createElement("h3");
        h.textContent = titleText;
        contentCell.push(h);
      }
      if (descriptorText) {
        const p = document.createElement("p");
        p.textContent = descriptorText;
        contentCell.push(p);
      }
      cells.push([img || "", contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const headingEl = element.querySelector(".iw-pcv2-header, h3");
    const headingText = headingEl ? (headingEl.textContent || "").replace(/\s+/g, " ").trim() : "";
    const tabEls = Array.from(element.querySelectorAll(".iw-pcv2-tablist .pnra-tab, .pds-tablist-item"));
    const tabs = tabEls.map((t) => (t.textContent || "").replace(/\s+/g, " ").trim()).filter(Boolean);
    const ctaEl = element.querySelector(".iw-pcv2-btn-wrapper span.heavy, .iw-pcv2-btn-wrapper silo-button");
    const ctaText = ctaEl ? (ctaEl.textContent || "").replace(/\s+/g, " ").trim() : "";
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-product", cells });
    const before = [];
    if (headingText) {
      const h2 = document.createElement("h2");
      h2.textContent = headingText;
      before.push(h2);
    }
    if (tabs.length || ctaText) {
      const p = document.createElement("p");
      const allLinks = [];
      tabs.forEach((label) => {
        const a = document.createElement("a");
        const slug = label.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        a.setAttribute("href", `/en-us/menu/categories/${slug}.html`);
        a.textContent = label;
        allLinks.push(a);
      });
      if (ctaText) {
        const a = document.createElement("a");
        a.setAttribute("href", "/en-us/menu.html");
        a.textContent = ctaText;
        allLinks.push(a);
      }
      allLinks.forEach((a, idx) => {
        if (idx > 0) p.append(document.createTextNode(" \xB7 "));
        p.append(a);
      });
      before.push(p);
    }
    element.replaceWith(...before, block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse4(element, { document }) {
    const buttonToLink = (btn) => {
      const label = (btn.textContent || "").trim();
      if (!label) return null;
      const href = btn.getAttribute("href") || btn.querySelector("a") && btn.querySelector("a").getAttribute("href") || "#";
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = label;
      return a;
    };
    const cards = Array.from(element.querySelectorAll(".iw-braze-side-by-side-card"));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector(".iw-bsbsc-img-container img, img.iw-bsbsc-img, img");
      const contentCell = [];
      const heading = card.querySelector(".iw-bsbc-main-content-container p.font-subhead, p.font-subhead");
      if (heading) {
        const h = document.createElement("h3");
        h.textContent = (heading.textContent || "").trim();
        contentCell.push(h);
      }
      const description = card.querySelector(".iw-bsbc-main-content-container p.font-body, p.font-body.tight, p.font-body");
      if (description && description !== heading) {
        const p = document.createElement("p");
        p.textContent = (description.textContent || "").replace(/\s+/g, " ").trim();
        contentCell.push(p);
      }
      Array.from(card.querySelectorAll(".iw-bsbsc-cta-container silo-button, silo-button, a.button")).filter((btn) => !btn.querySelector("silo-button, a.button")).map(buttonToLink).filter(Boolean).forEach((cta) => {
        const p = document.createElement("p");
        p.append(cta);
        contentCell.push(p);
      });
      if (!img && contentCell.length === 0) return;
      cells.push([img || "", contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse5(element, { document }) {
    const cards = Array.from(element.querySelectorAll(".iw-bcsa-slide .pnra-card-style, .iw-bcsa-slide"));
    const cardEls = cards.filter((c) => c.querySelector(":scope a[href], a[href]"));
    const seen = /* @__PURE__ */ new Set();
    const uniqueCards = cardEls.filter((c) => {
      const link = c.querySelector("a[href]");
      const key = link ? link.getAttribute("href") : c.textContent.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const cells = [];
    uniqueCards.forEach((card) => {
      const link = card.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : null;
      const img = card.querySelector("img.iw-ca-primary-category-image, img");
      const contentCell = [];
      const labelEl = card.querySelector("span.font-subhead--product-title, .font-subhead--product-title");
      const labelText = labelEl ? (labelEl.textContent || "").replace(/\s+/g, " ").trim() : "";
      if (labelText) {
        const h = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.setAttribute("title", labelText);
          a.textContent = labelText;
          h.append(a);
        } else {
          h.textContent = labelText;
        }
        contentCell.push(h);
      }
      let descriptorText = "";
      const descEls = Array.from(card.querySelectorAll("span.font-body.sm, span.font-body"));
      for (const d of descEls) {
        const txt = (d.textContent || "").replace(/\s+/g, " ").trim();
        if (txt && txt !== labelText) {
          descriptorText = txt;
          break;
        }
      }
      if (descriptorText) {
        const p = document.createElement("p");
        p.textContent = descriptorText;
        contentCell.push(p);
      }
      if (!img && contentCell.length === 0) return;
      cells.push([img || "", contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-benefit.js
  function parse6(element, { document }) {
    let items = Array.from(element.querySelectorAll(".iw-bc-desc-container"));
    if (items.length === 0) {
      items = element.classList.contains("iw-bc-desc-container") ? [element] : [element];
    }
    const cells = [];
    items.forEach((item) => {
      const icon = item.querySelector("img.iw-braze-up-icon, img");
      const contentCell = [];
      const titleEl = item.querySelector("p.font-body.heavy, .text-left p.font-body.heavy");
      const titleText = titleEl ? (titleEl.textContent || "").replace(/\s+/g, " ").trim() : "";
      if (titleText) {
        const h = document.createElement("h3");
        h.textContent = titleText;
        contentCell.push(h);
      }
      let descText = "";
      const descContainer = item.querySelector(".text-left") || item;
      const fullText = (descContainer.textContent || "").replace(/\s+/g, " ").trim();
      if (fullText && titleText && fullText.startsWith(titleText)) {
        descText = fullText.slice(titleText.length).trim();
      } else if (fullText && fullText !== titleText) {
        descText = fullText;
      }
      if (descText && descText !== titleText) {
        const p = document.createElement("p");
        p.textContent = descText;
        contentCell.push(p);
      }
      if (!icon && contentCell.length === 0) return;
      cells.push([icon || "", contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-benefit", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/panera-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // NOTE: the order-setup bar (#order-setup-bar / op3694 swiper-slide) is now
        // migrated as the `order-setup` block, so it is intentionally NOT removed here.
        // Commerce Add / Customize action controls on every product placard
        // (cleaned.html L415, L470, L508, L563, etc.). iw-quick-add wraps the
        // Add (silo-button.iw-pgi-add) and Customize buttons.
        ".iw-quick-add",
        ".iw-pgi-actions",
        // Per-product live size selector (e.g. "Whole ▾") — runtime control
        // (cleaned.html L403, L734, L789).
        ".iw-pgi-select-size",
        // Carousel category live-filter tab controls (cleaned.html L348-L362):
        // Sandwiches / Salads / Soups & Mac / Beverages tab list drives runtime
        // re-filtering of the product grid.
        ".pds-tablist-container",
        "#category-nav",
        // Carousel runtime navigation arrows (cleaned.html L374).
        ".pc-nav-button",
        // Personalization / runtime drawer dialog (cleaned.html L959).
        "#category-action-palette-drawer"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header (handled by nav orchestrator) — cleaned.html L6.
        ".pds-header-container",
        "header.iw-site-header",
        // Footer (handled by footer orchestrator) — cleaned.html L1150.
        "#footer",
        // Sign-in / cart state widgets (cleaned.html L63 iw-up-sign-in,
        // L76 iw-cart-summary/iw-sh-cart, L77 iw-cs-cart-button). These live in the
        // header container above but are listed explicitly for safety.
        ".iw-up-sign-in",
        ".iw-cart-summary",
        ".iw-sh-cart",
        // Personalization overlays / dialogs / snackbars trailing the main content
        // (cleaned.html L1291 iw-overlays, L1292 fullscreen-overlay, L1302 alert
        // base-templates, L1332 snackbars, L972 pds-bg-overlay, L1291 announcer).
        ".iw-overlays",
        ".fullscreen-overlay",
        ".base-templates",
        ".snackbars",
        ".pds-bg-overlay",
        "#announcer",
        // Tracking / pixel iframes and beacons (cleaned.html L1347, L1357, L1359,
        // L1362, L1366).
        "iframe",
        "#batBeacon156435615202",
        // Safe non-authorable element types.
        "link",
        "noscript",
        "script",
        "source"
      ]);
    }
  }

  // tools/importer/transformers/panera-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (sectionEl.nextSibling) {
          sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
        } else {
          sectionEl.parentNode.appendChild(metaBlock);
        }
      }
      if (i > 0 && sectionEl.previousElementSibling) {
        const hr = doc.createElement("hr");
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Panera Bread homepage with header, hero, product carousel, promo cards, menu category grid, and MyPanera rewards sections, plus footer",
    urls: [
      "https://www.panerabread.com/en-us/home.html"
    ],
    blocks: [
      {
        name: "order-setup",
        instances: [
          "#order-setup-bar"
        ]
      },
      {
        name: "hero-promo",
        instances: [
          "#top > section.swiper-slide:nth-of-type(1) div.iw-braze-card",
          "#top > section.swiper-slide:nth-of-type(6) div.iw-bc-img-container"
        ]
      },
      {
        name: "carousel-product",
        instances: [
          "#top > section.swiper-slide:nth-of-type(2) div.iw-product-carousel-v2"
        ]
      },
      {
        name: "cards-promo",
        instances: [
          "#top > section.swiper-slide:nth-of-type(4) div.iw-bsbs-cards-container"
        ]
      },
      {
        name: "cards-category",
        instances: [
          "#top > section.swiper-slide:nth-of-type(5) div.iw-braze-category-section-a"
        ]
      },
      {
        name: "cards-benefit",
        instances: [
          "#top > section.swiper-slide:nth-of-type(6) div.iw-bc-desc-container"
        ]
      }
    ],
    sections: [
      {
        id: "brazeSideBySide",
        name: "Flavor Starts Here",
        selector: "#top > section.swiper-slide:nth-of-type(4)",
        style: "warm-cream",
        blocks: ["cards-promo"],
        defaultContent: ["#top > section.swiper-slide:nth-of-type(4) p.font-head--sm.pds-color-midnight.text-uppercase"]
      },
      {
        id: "userProgram",
        name: "MyPanera Rewards",
        selector: "#top > section.swiper-slide:nth-of-type(6)",
        style: "light",
        blocks: ["hero-promo", "cards-benefit"],
        defaultContent: ["#top > section.swiper-slide:nth-of-type(6) p.font-head--sm.text-uppercase"]
      }
    ]
  };
  var parsers = {
    "order-setup": parse,
    "hero-promo": parse2,
    "carousel-product": parse3,
    "cards-promo": parse4,
    "cards-category": parse5,
    "cards-benefit": parse6
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
