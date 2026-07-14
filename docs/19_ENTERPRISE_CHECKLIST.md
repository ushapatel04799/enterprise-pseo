# Enterprise Release Readiness Checklist

**Version:** 2.0  
**Status:** Approved  
**Ownership:** Quality Assurance & Operations  

---

## 1. Purpose

This checklist defines the mandatory checks that must pass before any programmatic build is promoted to the production edge deployment on Cloudflare Pages. Every item must be validated either automatically by the build engine or verified manually.

---

## 2. Pre-Release Verification Gates

### 1. Data Foundation & Schema Integrity (Automated)
- [ ] **State & City Data Schemas:** All active JSON files in `data/source/locations/` pass validation against standard JSON schemas.
- [ ] **No Duplicate Slugs:** Slugs for states and cities are globally unique across the build register.
- [ ] **No Duplicate ZIP Codes:** No zip code is mapped to multiple distinct city entities.
- [ ] **Service & FAQ Mapping:** All referenced niches, services, and FAQs exist and are valid.

### 2. Security & Secret Protection (Automated)
- [ ] **No API Keys Committed:** Codebase scan shows zero hardcoded credentials or API keys (e.g. OpenAI, Gemini, Maps, Weather).
- [ ] **Sanitized Output:** Error loggers redact private system paths and detailed DB/API configurations.
- [ ] **Secure Dependencies:** Dependency audit (`npm audit`) shows no active vulnerabilities with high/critical severity.

### 3. Factual Integrity & AI Policy (Automated & Manual Sampling)
- [ ] ** Factual Alignment:** All generated numbers (phone, pop, coordinates) match immutable source datasets exactly.
- [ ] **Plagiarism & Duplication Check:** No duplicate text blocks exceeding 200 consecutive characters exist across separate city pages.
- [ ] **No Urgency Abuse:** Page CTA content contains no clickbait, fake countdowns, or misleading guarantees.

### 4. Search Engine Optimization (SEO) & Schema (Automated)
- [ ] **Unique Metadata:** Every page has a unique `<title>` and `<meta name="description">` that contains the local city and service name.
- [ ] **Canonical URL:** Deterministic canonical headers are set to the correct Cloudflare production domain.
- [ ] **Structured Data:** JSON-LD schema blocks (`LocalBusiness`, `Service`, `BreadcrumbList`) pass validation.
- [ ] **Clean Linking Structure:** Crawl depth does not exceed 3 levels from the root, and there are no orphan pages.

### 5. Web Accessibility & Performance (Automated)
- [ ] **Semantic Elements:** Page structure uses single `<h1>`, proper nested heading tags (`<h2>`, `<h3>`), and semantic containers.
- [ ] **Alt Text Check:** Every image tag contains descriptive `alt` text.
- [ ] **Bundle Budget Compliance:** Total CSS inlined weight remains under 15KB; total JavaScript under 10KB.
- [ ] **Core Web Vitals Verification:** LCP under 2.5s and CLS under 0.1 verified on preview builds.

### 6. Operations & Deployment (Automated & Manual)
- [ ] **Rollback Capability:** Rollback pointer can restore the last stable deployment manifest in under 60 seconds.
- [ ] **Health Checks Active:** Edge functions and endpoint check routines return 200 OK.