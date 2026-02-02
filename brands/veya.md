## 1) What Veya is

**Veya** is a **multi-tenant, white-label, first-party ordering platform for restaurants**. It powers:
- **Web ordering** (brand.com / order.brand.com)
- **Native/hybrid mobile apps** (iOS + Android; brand-specific builds)
- **CMS-driven content + layouts** (page builder, marketing pages, experience modules)
- **Integrations** with ordering and loyalty providers (commonly **Olo** for ordering; **SpendGo** and/or **Punchh** for loyalty)

Core outcomes:
- A brand can launch an ordering experience that feels fully native to their identity (fonts, colors, UI patterns, content tone).
- Multi-location complexity (10–100 locations) is handled as a first-class paradigm: location selection, hours, menus, fulfillment, fees, throttling, availability, etc.
- The same product primitives power both web and mobile while allowing platform-specific UX.

---

## 2) Mental model: the platform “layers”

Think of Veya as four layers:

1) **Brand & Tenant Layer (Multi-tenancy)**
- A “brand” (tenant) has theming, content, configuration, and integrations.
- A brand has many **locations** (stores).
- A brand may have multiple **channels** (web, iOS, Android) that share configuration but differ in UI affordances.

2) **Experience Layer (Web + App UI Kit)**
- Token-driven design system (no hard-coded values).
- Reusable components in a Web UI Kit (Storybook) + mobile component library.
- Experience modules: hero, promos, category grids, PLP-ish menu browsing, basket & checkout, loyalty surfaces.

3) **Commerce Layer (Ordering API)**
- Normalizes provider differences.
- Exposes a consistent set of endpoints/SDK functions to the front-end.
- Owns basket state, pricing calculations, availability, and checkout orchestration.

4) **Content & Ops Layer (CMS + Admin)**
- Marketing pages and experience content are CMS-driven.
- Configuration surfaces exist for operational rules (location enablement, throttling, dayparting, 86’d items, etc.) depending on integration/provider constraints.

---

## 3) Core entities (shared vocabulary)

Use these terms consistently in docs and tickets.

- **Tenant / Brand**: A white-label client brand (e.g., Earthbar, Naya).
- **Location / Store**: A physical unit. Has address, geo, hours, fulfillment capabilities.
- **Fulfillment Method**: Pickup, Delivery, Catering, etc.
- **Menu**: Provider-fed catalog (categories, products, modifiers).
- **Product**: A sellable item. Has modifier groups/options.
- **Basket / Cart**: Current order state (items, fees, discounts, tips, totals).
- **Checkout**: Identity → fulfillment details → payment → submission.
- **Order**: Submitted transaction + status.
- **Loyalty Account**: Provider identity + balances, points, rewards.
- **Experience Module**: CMS-defined block that renders into UI.
- **Theme Tokens**: Design tokens for typography, color, spacing, radius, elevation, etc.

---

## 4) Ordering API: how it works (conceptual)

Veya typically integrates with a provider like **Olo** for ordering. The key goal is: **front-ends talk to Veya’s normalized API** rather than directly to the provider, so the UI stays consistent across brands and providers.

### 4.1 Ordering flow (high level)
1) **Initialize session**
   - Establish brand context, device context, locale, and (optionally) user identity.
2) **Select location**
   - Resolve location either by user choice, geolocation, search, “favorite store,” or last used.
3) **Fetch menu**
   - Fetch the menu for the chosen location + fulfillment method + time context.
4) **Build basket**
   - Add items (with modifiers), update quantities, apply coupons/rewards, compute totals.
5) **Checkout**
   - Collect fulfillment details, contact info, delivery address if needed, tip, payment method.
6) **Submit order**
   - Provider submission, receive confirmation, order tracking.

### 4.2 Key API responsibilities
- **Normalization**: present stable data models even if providers differ.
- **Validation**: enforce required modifier selections, item availability, quantity limits.
- **Pricing**: ensure totals/fees/tax match provider calculations (avoid UI mismatches).
- **State**: basket is authoritative server-side or synchronized client/server (implementation-dependent).
- **Resilience**: provider timeouts, partial failures, retries, idempotency keys.

### 4.3 Common endpoints/functions (pseudo)
- `GET /brand` (theme, configuration, enabled providers)
- `GET /locations?query=&lat=&lng=` (search + distance)
- `GET /locations/{id}/availability` (hours, fulfillment, lead times)
- `GET /menu?locationId=&fulfillment=` (menu tree + item details)
- `POST /basket` (create)
- `GET /basket/{id}` (read)
- `POST /basket/{id}/items` (add item)
- `PATCH /basket/{id}/items/{itemId}` (qty, modifiers)
- `POST /basket/{id}/apply-coupon`
- `POST /basket/{id}/apply-reward`
- `POST /checkout/validate` (final validation before submit)
- `POST /orders` (submit)
- `GET /orders/{id}` (status)

### 4.4 Data constraints that matter for UX
- **Dayparting**: breakfast/lunch/dinner menus and scheduled availability.
- **Item 86 / out-of-stock**: items may disappear or be unorderable.
- **Modifier rules**: min/max selections, nested modifiers.
- **Lead times**: can change by location load and fulfillment method.
- **Fees & taxes**: often location- and fulfillment-dependent.
- **Delivery radius**: address eligibility must be validated.

---

## 5) Web app: how it works

The web app is a **token-driven UI** that renders a brand’s ordering + marketing experience.

### 5.1 Architecture expectations
- **Theme tokens** drive all styling (colors, spacing, typography, radii).
- **CMS content** drives page structure and merchandising.
- **Ordering API** drives live commerce state (menu/basket/checkout).

### 5.2 Key web UX surfaces
- Location selection gate (modal or full page)
- Menu browsing (categories, search, dietary tags, promos)
- Product detail / modifier builder (customization UI)
- Basket drawer / basket page
- Checkout flow (identity → fulfillment → payment)
- Loyalty sign-in/join surfaces (if enabled)
- Order confirmation + order status (if supported)

### 5.3 Web-specific paradigms
- **Persistent basket** (sticky basket drawer/summary)
- **Modals** for PDP and/or location gates (common pattern)
- **Deep linking** (links to specific category/product; shareable URLs)
- **SEO/marketing pages** that still route cleanly into ordering

---

## 6) Mobile app: how it works

Veya mobile is a react native app offered on both ios and android, but UX should feel native regardless.

### 6.1 Mobile principles
- **Fast path to reorder** and **fast location selection**
- Navigation is typically bottom-tab: Home, Menu/Order, Rewards, Account (brand-specific)
- Onboarding should be lightweight; ordering should not require account creation (unless brand mandates)

### 6.2 Mobile ordering UX
- Location selection triggered from:
  - first launch
  - tapping “Menu/Order”
  - tapping “Order now” CTAs
- Pickup is typically the default fulfillment method unless the brand emphasizes delivery
- Basket is accessible from a floating CTA or nav badge

### 6.3 Mobile-specific paradigms
- **OS permission handling** (location, notifications)
- **Universal links / deep links** into menu/category/product
- **Provider-auth flows** for loyalty (may require external browser or in-app session depending on provider constraints)
- **Brand-specific builds** (multi-tenant builds with shared code, different configs/themes)

---

## 7) CMS: how it works

The CMS is responsible for **content, merchandising, and experience composition**, not the transactional truth of ordering.

### 7.1 CMS responsibilities
- Pages: home, about, locations, promos, legal, help
- Experience modules: hero, promo rail, featured categories, banners, editorial blocks
- Location content overlays: store photos, local promos, store notes (if supported)
- Global config: app store links, support contact, analytics keys, feature flags

### 7.2 What the CMS should NOT own
- Provider menu truth (items/modifiers/pricing)
- Real-time availability (86s, throttling) unless explicitly managed as a layer on top
- Payment configuration (handled via provider/payment systems)

### 7.3 Page builder mental model
- A page is a list of **modules**.
- Modules have **fields** (copy, images, links, targeting rules).
- Modules can be targeted by:
  - brand
  - channel (web vs mobile)
  - location (optional)
  - time window (promo start/end)

---

## 8) Multi-unit restaurant paradigms (10–100 locations)

These paradigms should drive default UX and documentation decisions.

### 8.1 Location selection is a first-class “gate”
Users must reliably end up with the correct location because it affects:
- menu availability
- pricing, taxes, fees
- fulfillment options and lead times
- delivery eligibility

**Standard approach:**
- Ask for location early, but don’t block casual browsing unless necessary.
- Provide fast paths:
  - “Use my location” (geo)
  - “Search city/zip”
  - “Recent locations”
  - “Favorite location” (signed-in)

### 8.2 Pickup vs delivery defaults
- Pickup default is common because it’s operationally simpler.
- Delivery requires address validation and often has more failure modes.

**Pattern:**
- Let users toggle fulfillment method early (segmented control).
- If delivery selected, immediately request address and validate.

### 8.3 Menu complexity increases with scale
With 10–100 locations you’ll see:
- location-only items
- regional pricing differences
- varied hours/dayparts
- location promos

**Pattern:**
- Make “location context” visible and easy to change.
- Avoid assumptions that a product exists everywhere.

### 8.4 Operational exceptions are normal, not edge cases
Examples:
- a store is temporarily closed
- delivery turned off due to staffing
- items 86’d mid-session
- lead time spikes

**Pattern:**
- UI should gracefully recover:
  - show clear reasons
  - offer alternatives (switch to pickup, change store)
  - preserve basket where possible

### 8.5 Loyalty must be optional and non-blocking
- Loyalty is high value, but ordering should not collapse if loyalty is down.

**Pattern:**
- Progressive enhancement:
  - allow guest ordering
  - surface loyalty benefits contextually (rewards apply step, points earn summary)

### 8.6 Reorder and “favorites” matter more than browsing
At scale, returning users drive volume.

**Pattern:**
- Home screen includes reorder, recent items, saved orders.
- Account includes favorites and preferred location.

---

## 9) Standard user journeys (reference for docs)

When interpreting Figma flows, map them to one of these journeys.

1) **First-time user → pickup order**
2) **First-time user → delivery order**
3) **Returning user → reorder**
4) **User changes location mid-browse**
5) **User attempts delivery outside radius**
6) **User signs in to loyalty, applies reward**
7) **Item becomes unavailable after being added**
8) **Store closes before scheduled pickup time**
9) **User switches from pickup to delivery with an existing basket**
10) **Checkout failure (payment/provider) with recovery**

---

## 10) Non-negotiables (how we build)

- **Token-driven UI**: no hard-coded visual values in components.
- **Multi-tenant correctness**: every request and render must be brand-scoped.
- **Provider-safe**: do not assume provider availability; design fallback states.
- **Accessibility**: keyboard nav (web), screen reader labeling, tappable targets.
- **Observability**: events for critical funnel steps (location set, add-to-basket, checkout start, order placed).

---

## 11) How to write tickets/docs from Figma (instructions for the doc app)

When generating docs:
- Always state **Brand**, **Channel** (web/iOS/android), and **Location context** assumptions.
- Identify the journey(s) from section 9 that the design supports.
- Extract:
  - screens and states
  - empty/error/loading states
  - entry/exit points (deep links, navigation)
  - API dependencies (menu, basket, checkout, loyalty)
- Call out ambiguities as **Open Questions**, especially around:
  - location gating rules
  - fulfillment toggles
  - modifier constraints
  - reward application rules
  - guest vs signed-in requirements

---

## 12) Glossary (quick)
- **DRP**: Digital Retailing Platform (not Veya-specific; avoid unless defined per project)
- **PDP**: Product details page (or modal)
- **86’d**: out-of-stock/unavailable item
- **Daypart**: time-based menu (breakfast/lunch/dinner)
- **Idempotency**: safe retry of order submission without duplicates

---

## 13) Known integration notes (keep high-level unless the project specifies)
- Ordering commonly integrates with **Olo**.
- Loyalty commonly integrates with **SpendGo**, sometimes **Punchh**.
- Loyalty auth may involve **universal links** and/or **callback URLs** depending on provider requirements; document the chosen approach per brand.
- Maps and location services commonly integrates with **Radar**, sometimes **Mapbox**
- Delivery commonly integrates with **Olo Dispatch**



