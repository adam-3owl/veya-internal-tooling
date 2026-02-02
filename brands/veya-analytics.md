# Veya Analytics SDK Reference

This document describes the Veya Analytics platform and SDK for tracking user behavior. When generating tickets, reference this for analytics implementation requirements.

---

## Overview

Veya Analytics is a lightweight analytics platform for tracking user behavior on restaurant ordering websites and apps. It includes:
- JavaScript SDK for client-side tracking
- API that ingests events into Snowflake
- Automatic session, page visibility, and scroll tracking

**SDK Endpoint:** `https://analytics.builtonveya.com/sdk.js`
**API Endpoint:** `https://analytics.builtonveya.com/v1/events`

---

## SDK Initialization

```javascript
veya.init({
  tenantId: 'your-tenant-id',    // Required: unique tenant identifier
  storeId: 'default-store',      // Optional: default store ID
  debug: false,                  // Optional: enable console logging
  batchSize: 10,                 // Optional: events per batch (default: 10)
  flushInterval: 5000,           // Optional: ms between flushes (default: 5000)
  sessionTimeout: 1800000,       // Optional: session timeout in ms (default: 30 min)
  onEvent: function(event) {}    // Optional: callback for each event
});
```

---

## Automatic Tracking

The SDK automatically tracks these events without any code:

| Event | Description |
|-------|-------------|
| `session_start` | New session begins |
| `session_end` | User leaves page |
| `page_hidden` | Tab becomes hidden |
| `page_visible` | Tab becomes visible |
| `scroll_depth` | User scrolls to 25%, 50%, 75%, 100% |
| `click` | Clicks on `[data-veya-track]` elements |

---

## Store Tracking

For multi-location restaurants, track which store the user is ordering from.

### `veya.setStore(store)`
Set the current store when the user selects a location.

```javascript
veya.setStore({
  id: '12345',                           // Olo location ID (for webhook matching)
  name: 'Palo Alto - California Ave',    // Human-readable name (for dashboards)
  orderType: 'pickup'                    // 'pickup' or 'delivery'
});
```

**Events Triggered:**
- `store_selected` - First store selection
- `store_changed` - User switches to a different store (includes previous store info)

### `veya.setOrderType(orderType)`
Update just the order type without changing the store.

```javascript
veya.setOrderType('delivery');
```

---

## Page Tracking

### `veya.pageView(options)`
Track page views with optional metadata. Triggers funnel tracking for specific page types.

```javascript
// Basic page view
veya.pageView();

// With page type (triggers funnel tracking)
veya.pageView({ pageType: 'menu' });

// With custom properties
veya.pageView({
  pageType: 'product',
  category: 'Burgers',
  productId: 'burger-123'
});
```

**Funnel Steps (mapped from pageType):**
| Page Type | Funnel Step |
|-----------|-------------|
| `menu` | Step 1 |
| `cart` | Step 2 |
| `checkout_info` | Step 3 |
| `checkout_payment` | Step 4 |
| `confirmation` | Step 5 |

---

## Product Tracking

### `veya.productView(product)`
Track when a user views a product detail.

```javascript
veya.productView({
  id: 'burger-123',
  name: 'Classic Burger',
  category: 'Burgers',
  price: 12.99
});
```

### `veya.productClick(product)`
Track when a user clicks on a product.

```javascript
veya.productClick({
  id: 'burger-123',
  name: 'Classic Burger',
  category: 'Burgers',
  price: 12.99
});
```

---

## Cart Tracking

### `veya.addToCart(product, quantity)`
Track items added to cart. Automatically updates funnel to Step 2.

```javascript
veya.addToCart({
  id: 'burger-123',
  name: 'Classic Burger',
  category: 'Burgers',
  price: 12.99
}, 2);  // quantity (default: 1)
```

### `veya.removeFromCart(product, quantity)`
Track items removed from cart.

```javascript
veya.removeFromCart({
  id: 'burger-123',
  name: 'Classic Burger',
  price: 12.99
}, 1);
```

### `veya.updateCartQuantity(product, oldQuantity, newQuantity)`
Track quantity changes.

```javascript
veya.updateCartQuantity({
  id: 'burger-123',
  name: 'Classic Burger',
  price: 12.99
}, 1, 3);
```

### `veya.viewCart()`
Track when user views their cart.

### `veya.setCart(cart)`
Sync SDK cart state with your app's cart (useful on page load).

```javascript
veya.setCart({
  items: [
    { id: 'burger-123', name: 'Classic Burger', price: 12.99, quantity: 2 }
  ],
  itemCount: 2,
  total: 25.98
});
```

---

## Checkout Tracking

### `veya.checkoutStart()`
Track checkout initiation. Funnel Step 3.

### `veya.addPaymentInfo(paymentMethod)`
Track when payment info is added. Funnel Step 4.

```javascript
veya.addPaymentInfo('credit_card');
```

### `veya.checkoutComplete(order)`
Track completed purchase. Funnel Step 5.

```javascript
veya.checkoutComplete({
  id: 'order-456',
  olo_order_id: 'OLO-789',      // Olo order ID for webhook matching
  total: 28.47,
  subtotal: 25.98,
  tax: 2.49,
  tip: 0,
  orderType: 'pickup',
  paymentMethod: 'credit_card',
  items: [
    { id: 'burger-123', name: 'Classic Burger', price: 12.99, quantity: 2 }
  ]
});
```

---

## User Authentication

### `veya.loginAttempt(method)`
Track login attempts.

```javascript
veya.loginAttempt('email');
veya.loginAttempt('google');
```

### `veya.loginSuccess(method, customerId)`
Track successful login and associate user.

```javascript
veya.loginSuccess('email', 'customer-123');
```

### `veya.loginFailure(method, error)`
Track failed login.

```javascript
veya.loginFailure('email', 'Invalid password');
```

### `veya.logout()`
Track logout.

### `veya.identify(customerId, traits)`
Identify a user (useful for logged-in users on page load).

```javascript
veya.identify('customer-123', {
  email: 'user@example.com',
  name: 'John Doe',
  loyaltyTier: 'gold'
});
```

---

## Search Tracking

### `veya.search(query, resultCount)`
Track search queries.

```javascript
veya.search('burger', 5);
```

---

## Promo & Loyalty Tracking

### `veya.promoApply(promo)`
Track promo code application.

```javascript
veya.promoApply({
  code: 'SAVE10',
  success: true,
  discount: 2.50
});

// Failed promo
veya.promoApply({
  code: 'INVALID',
  success: false,
  error: 'Code expired'
});
```

### `veya.promoRemove(code)`
Track promo code removal.

### `veya.rewardView(reward)` / `veya.rewardApply(reward)` / `veya.rewardRemove(reward)`
Track loyalty reward interactions.

```javascript
veya.rewardApply({
  id: 'reward-123',
  name: 'Free Fries',
  pointsCost: 500
});
```

---

## Error Tracking

### `veya.error(type, message, properties)`
Track errors.

```javascript
veya.error('payment', 'Card declined', {
  card_type: 'visa',
  error_code: 'insufficient_funds'
});

veya.error('api', 'Failed to load menu', {
  endpoint: '/api/menu',
  status: 500
});
```

---

## A/B Testing

### `veya.setExperiment(experimentName, variant)`
Track experiment assignments.

```javascript
veya.setExperiment('checkout_flow', 'variant_b');
```

---

## Custom Events

### `veya.track(eventName, properties)`
Track any custom event.

```javascript
veya.track('menu_filter', {
  filter_type: 'category',
  filter_value: 'vegetarian'
});

veya.track('upsell_shown', {
  product_id: 'fries-456',
  location: 'cart_page'
});

veya.track('upsell_accepted', {
  product_id: 'fries-456'
});
```

---

## Declarative Tracking (HTML Attributes)

Add `data-veya-track` attributes to HTML elements for automatic click tracking.

```html
<button data-veya-track="add_to_cart" data-veya-props='{"product_id": "123"}'>
  Add to Cart
</button>

<a href="/menu" data-veya-track="nav_menu">
  View Menu
</a>
```

---

## Utility Methods

```javascript
veya.getSessionId();    // Get current session ID
veya.getVisitorId();    // Get visitor ID (persists across sessions)
veya.getCustomerId();   // Get customer ID (if logged in)
veya.getCart();         // Get current cart state
veya.flush();           // Force send all queued events
```

---

## Standard Event Taxonomy for Tickets

When writing analytics requirements in tickets, use these standard events:

### Core Funnel Events
| Event | SDK Method | When to Fire |
|-------|------------|--------------|
| `page_view` | `veya.pageView()` | Every screen/page load |
| `store_selected` | `veya.setStore()` | User selects location |
| `product_viewed` | `veya.productView()` | Product detail opened |
| `add_to_cart` | `veya.addToCart()` | Item added to cart |
| `remove_from_cart` | `veya.removeFromCart()` | Item removed from cart |
| `view_cart` | `veya.viewCart()` | Cart page/drawer opened |
| `checkout_started` | `veya.checkoutStart()` | Checkout initiated |
| `payment_info_added` | `veya.addPaymentInfo()` | Payment entered |
| `purchase` | `veya.checkoutComplete()` | Order submitted |

### User Events
| Event | SDK Method | When to Fire |
|-------|------------|--------------|
| `login_attempt` | `veya.loginAttempt()` | Login started |
| `login_success` | `veya.loginSuccess()` | Login succeeded |
| `login_failure` | `veya.loginFailure()` | Login failed |
| `logout` | `veya.logout()` | User logged out |

### Engagement Events
| Event | SDK Method | When to Fire |
|-------|------------|--------------|
| `search` | `veya.search()` | Search performed |
| `promo_applied` | `veya.promoApply()` | Promo code used |
| `reward_applied` | `veya.rewardApply()` | Loyalty reward used |
| `error_displayed` | `veya.error()` | Error shown to user |

### Standard Properties (Include on All Events)
- `tenantId` - Brand/tenant identifier
- `platform` - 'ios' | 'android' | 'web'
- `userId` - Customer ID (if authenticated)
- `sessionId` - Session identifier
- `storeId` - Current store ID (if set)
- `orderType` - 'pickup' | 'delivery' (if set)

---

## Writing Analytics Requirements in Tickets

When specifying analytics in tickets, use this format:

### Analytics

| Event | SDK Call | Trigger | Properties |
|-------|----------|---------|------------|
| `page_view` | `veya.pageView({ pageType: 'menu' })` | Screen loads | `pageType`, `category` |
| `product_viewed` | `veya.productView(product)` | PDP opens | `id`, `name`, `category`, `price` |
| `add_to_cart` | `veya.addToCart(product, qty)` | Add button tapped | `id`, `name`, `price`, `quantity` |

**Implementation Notes:**
- Initialize SDK with `tenantId` on app launch
- Call `veya.setStore()` after location selection
- Use `veya.identify()` after successful login
- Ensure `veya.flush()` is called before app backgrounding (mobile)
