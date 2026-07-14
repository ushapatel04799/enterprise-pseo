# Performance Architecture & Benchmarks

**Version:** 2.0  
**Status:** Approved  
**Ownership:** Architecture & Operations  

---

## 1. Core Objectives

This document establishes the performance goals, budget limits, build strategies, and runtime edge caching rules for the Enterprise Programmatic SEO platform. The ultimate goal is achieving a perfect PageSpeed score and ensuring fast build processing times at scale.

---

## 2. Core Web Vitals (CWVs) Budgets

All pages deployed to production must meet these Core Web Vitals budgets on standard mobile emulation tests (Moto G4, slow 4G network):

| Metric | Target | Method of Enforcement |
|---|---|---|
| **Largest Contentful Paint (LCP)** | &le; 1.8 seconds | Critical CSS inlining, priority image loading, zero render-blocking JavaScript. |
| **Cumulative Layout Shift (CLS)** | &le; 0.05 | Reserve spaces for dynamic content/maps, explicit width/height tags on images. |
| **Interaction to Next Paint (INP)**| &le; 100 milliseconds| Defer non-critical third-party widgets, minimize main-thread execution. |
| **First Contentful Paint (FCP)** | &le; 1.0 seconds | High CDN cache hit ratios, static HTML output. |

---

## 3. Build & Rendering Optimization

To compile thousands of city pages efficiently, the Build Engine implements the following optimizations:

### Incremental Builds
- Calculate MD5 checksums of geographic state/city JSON files and layout template structures.
- Skip content generation and HTML rendering for pages whose source data, config, and templates are unchanged.
- Maintain a stable `/data/derived/build-manifest.json` across runs to track outputs.

### Concurrency & Memory Management
- Utilize batch concurrency limits (`p-limit` or native promise chunks) during node generation.
- Concurrency limit is set dynamically based on available system memory (target: 75% memory threshold).
- Avoid holding all generated page models in-memory. Flush rendered HTML to disk iteratively.

---

## 4. Asset Budget & Delivery Controls

- **CSS:** Standardize on utility CSS compiled via Tailwind/PostCSS. Ensure the total CSS bundle is under **15KB gzip** and is inlined directly in the `<head>` of the HTML to eliminate render-blocking network roundtrips.
- **JavaScript:** Client-side JavaScript must be kept under **10KB gzip**. Defer all script tags.
- **Images:** All images must be lazy-loaded by default, except hero images which must utilize `rel="preload"`. Compress images to WebP/AVIF formats at compile-time.

---

## 5. Edge Caching & CDN Strategy (Cloudflare Pages)

- **Static Cache-Control:** Output pages must be served with strict edge caching headers:
  ```http
  Cache-Control: public, max-age=0, must-revalidate, s-maxage=31536000
  ```
- **Instant Rollbacks:** Cloudflare Pages handles atomic deployments and rollbacks by updating routing pointers at the edge instantly without CDN cache pollution.
- **Mocked Widgets:** Dynamic content (such as weather details) is loaded asynchronously via client-side fetch from lightweight edge microservices or cached API configurations, avoiding main-page blockages.