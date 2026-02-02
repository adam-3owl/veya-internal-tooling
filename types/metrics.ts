export type MetricCategory =
  | "session"
  | "navigation"
  | "ecommerce"
  | "authentication"
  | "store"
  | "location"
  | "menu"
  | "search"
  | "loyalty"
  | "error"
  | "experiment";

export interface Metric {
  name: string;
  method: string;
  category: MetricCategory;
  description: string;
  parameters?: string;
}

export const metrics: Metric[] = [
  // Session Events
  {
    name: "session_start",
    method: "init()",
    category: "session",
    description: "Automatically tracked when SDK initializes. Captures landing page and referrer.",
  },
  {
    name: "session_end",
    method: "automatic",
    category: "session",
    description: "Automatically tracked on page unload. Includes total session duration.",
  },
  {
    name: "page_hidden",
    method: "automatic",
    category: "session",
    description: "Tracked when page visibility changes to hidden. Includes time spent on page.",
  },
  {
    name: "page_visible",
    method: "automatic",
    category: "session",
    description: "Tracked when page becomes visible again after being hidden.",
  },

  // Navigation Events
  {
    name: "page_view",
    method: "pageView(options)",
    category: "navigation",
    description: "Track page views with optional page type. Menu pages are tagged as funnel step 1.",
    parameters: "pageType?: string",
  },
  {
    name: "scroll_depth",
    method: "automatic",
    category: "navigation",
    description: "Automatically tracked at 25%, 50%, 75%, and 100% scroll milestones.",
  },
  {
    name: "click",
    method: "data-veya-track attribute",
    category: "navigation",
    description: "Tracks clicks on elements with data-veya-track attribute. Use data-veya-props for custom properties.",
  },

  // E-commerce Events
  {
    name: "product_view",
    method: "productView(product)",
    category: "ecommerce",
    description: "Track when a user views a product detail page.",
    parameters: "id, name, category, price",
  },
  {
    name: "product_click",
    method: "productClick(product)",
    category: "ecommerce",
    description: "Track when a user clicks on a product (e.g., from a list).",
    parameters: "id, name, category, price",
  },
  {
    name: "add_to_cart",
    method: "addToCart(product, quantity)",
    category: "ecommerce",
    description: "Track item added to cart. Updates internal cart state. Tagged as funnel step 2.",
    parameters: "id, name, category, price, quantity",
  },
  {
    name: "remove_from_cart",
    method: "removeFromCart(product, quantity)",
    category: "ecommerce",
    description: "Track item removed from cart. Updates internal cart state.",
    parameters: "id, name, price, quantity",
  },
  {
    name: "update_cart_quantity",
    method: "updateCartQuantity(product, oldQty, newQty)",
    category: "ecommerce",
    description: "Track quantity changes for cart items.",
    parameters: "id, name, oldQuantity, newQuantity",
  },
  {
    name: "cart_view",
    method: "viewCart()",
    category: "ecommerce",
    description: "Track when user views their cart. Includes cart value and item count.",
  },
  {
    name: "checkout_start",
    method: "checkoutStart()",
    category: "ecommerce",
    description: "Track checkout initiation. Tagged as funnel step 3 (checkout_info).",
  },
  {
    name: "checkout_step",
    method: "checkoutStep(step)",
    category: "ecommerce",
    description: "Track progression through checkout steps.",
    parameters: "step: string",
  },
  {
    name: "add_payment_info",
    method: "addPaymentInfo(paymentMethod)",
    category: "ecommerce",
    description: "Track payment method selection. Tagged as funnel step 4.",
    parameters: "paymentMethod: string",
  },
  {
    name: "purchase",
    method: "checkoutComplete(order)",
    category: "ecommerce",
    description: "Track completed purchase. Tagged as funnel step 5 (confirmation). Clears cart.",
    parameters: "id, olo_order_id, total, subtotal, tax, tip, orderType, paymentMethod, items",
  },
  {
    name: "quick_add_attempted",
    method: "quickAddAttempted(options)",
    category: "ecommerce",
    description: "Track when user taps quick add button before API call.",
    parameters: "productId, productName, source, modifierCount",
  },
  {
    name: "quick_add_failed",
    method: "quickAddFailed(options)",
    category: "ecommerce",
    description: "Track when quick add API call fails.",
    parameters: "productId, errorType, errorMessage, source",
  },

  // Authentication Events
  {
    name: "login_attempt",
    method: "loginAttempt(method)",
    category: "authentication",
    description: "Track login attempt with method (email, social, etc.).",
    parameters: "method: string",
  },
  {
    name: "login_success",
    method: "loginSuccess(method, customerId)",
    category: "authentication",
    description: "Track successful login. Sets customer ID for future events.",
    parameters: "method: string, customerId: string",
  },
  {
    name: "login_failure",
    method: "loginFailure(method, error)",
    category: "authentication",
    description: "Track failed login attempt with error message.",
    parameters: "method: string, error: string",
  },
  {
    name: "logout",
    method: "logout()",
    category: "authentication",
    description: "Track user logout. Clears customer ID.",
  },
  {
    name: "identify",
    method: "identify(customerId, traits)",
    category: "authentication",
    description: "Associate visitor with customer ID and optional traits.",
    parameters: "customerId: string, traits?: object",
  },

  // Store Events
  {
    name: "store_selected",
    method: "setStore(store)",
    category: "store",
    description: "Track initial store selection. Sets store context for all future events.",
    parameters: "id, name, orderType, address?",
  },
  {
    name: "store_changed",
    method: "setStore(store)",
    category: "store",
    description: "Track when user changes to a different store. Includes previous store info.",
    parameters: "id, name, orderType, address?",
  },
  {
    name: "order_type_changed",
    method: "setOrderType(orderType)",
    category: "store",
    description: "Track when user switches between pickup and delivery.",
    parameters: "orderType: 'pickup' | 'delivery'",
  },

  // Location Selection Events
  {
    name: "location_modal_opened",
    method: "locationModalOpened(options)",
    category: "location",
    description: "Track when location selection modal opens.",
    parameters: "trigger?, hasRecentLocations?",
  },
  {
    name: "fulfillment_method_selected",
    method: "fulfillmentMethodSelected(options)",
    category: "location",
    description: "Track when user selects fulfillment method (pickup/delivery).",
    parameters: "method, previousMethod?",
  },
  {
    name: "location_permission_requested",
    method: "locationPermissionRequested()",
    category: "location",
    description: "Track when location permission is requested from browser.",
  },
  {
    name: "location_permission_granted",
    method: "locationPermissionResponse(true)",
    category: "location",
    description: "Track when user grants location permission.",
  },
  {
    name: "location_permission_denied",
    method: "locationPermissionResponse(false)",
    category: "location",
    description: "Track when user denies location permission.",
  },
  {
    name: "location_search_started",
    method: "locationSearchStarted()",
    category: "location",
    description: "Track when user starts typing in location search.",
  },
  {
    name: "location_search_results",
    method: "locationSearchResults(options)",
    category: "location",
    description: "Track location search results returned.",
    parameters: "query, resultCount, searchType?",
  },
  {
    name: "location_selected",
    method: "locationSelected(options)",
    category: "location",
    description: "Track when user selects a location.",
    parameters: "locationId, locationName, fulfillmentMethod, resultPosition?, selectionSource?, distance?",
  },
  {
    name: "location_view_toggled",
    method: "locationViewToggled(view)",
    category: "location",
    description: "Track when user toggles between list and map view.",
    parameters: "view: 'list' | 'map'",
  },
  {
    name: "recent_location_used",
    method: "recentLocationUsed(options)",
    category: "location",
    description: "Track when returning customer uses a recent location.",
    parameters: "locationId, locationName, position, lastOrderDate?",
  },
  {
    name: "location_search_no_results",
    method: "locationSearchNoResults(options)",
    category: "location",
    description: "Track when location search returns no results.",
    parameters: "query, searchType?",
  },
  {
    name: "location_search_error",
    method: "locationSearchError(options)",
    category: "location",
    description: "Track location search error.",
    parameters: "errorType, errorMessage?, query?",
  },
  {
    name: "delivery_unavailable",
    method: "deliveryUnavailable(options)",
    category: "location",
    description: "Track when delivery is unavailable for an address.",
    parameters: "address, reason?, nearestLocationId?, nearestDistance?",
  },
  {
    name: "location_services_disabled",
    method: "locationServicesDisabled()",
    category: "location",
    description: "Track when user has location services disabled.",
  },
  {
    name: "delivery_address_entered",
    method: "deliveryAddressEntered(options)",
    category: "location",
    description: "Track when user enters delivery address.",
    parameters: "addressType?, hasApartment?",
  },
  {
    name: "delivery_address_validated",
    method: "deliveryAddressValidated(options)",
    category: "location",
    description: "Track when delivery address is validated.",
    parameters: "success, validationType?, errorReason?",
  },
  {
    name: "delivery_details_completed",
    method: "deliveryDetailsCompleted(options)",
    category: "location",
    description: "Track when user completes delivery details form.",
    parameters: "hasApartment, hasInstructions, deliveryOption?",
  },
  {
    name: "delivery_fallback_to_pickup",
    method: "deliveryFallbackToPickup(options)",
    category: "location",
    description: "Track when user switches from delivery to pickup after delivery unavailable.",
    parameters: "reason, selectedLocationId?, selectedLocationName?",
  },

  // Menu Events
  {
    name: "menu_loaded",
    method: "menuLoaded(options)",
    category: "menu",
    description: "Track menu load performance and content metrics.",
    parameters: "loadTime, categoryCount, productCount, hasRecentItems, recentItemsCount",
  },
  {
    name: "category_viewed",
    method: "categoryViewed(category)",
    category: "menu",
    description: "Track when a category scrolls into viewport.",
    parameters: "id, name, position, viewDuration?",
  },
  {
    name: "category_clicked",
    method: "categoryClicked(category)",
    category: "menu",
    description: "Track when user taps category tab to navigate.",
    parameters: "id, name, position",
  },
  {
    name: "menu_scroll",
    method: "menuScroll(options)",
    category: "menu",
    description: "Track menu scroll depth milestones (25/50/75/100%).",
    parameters: "scrollDepth, categoryInView, scrollDirection, scrollVelocity",
  },
  {
    name: "category_scroll",
    method: "categoryScroll(options)",
    category: "menu",
    description: "Track horizontal scrolling of category tabs.",
    parameters: "scrollPosition, categoriesVisible, totalCategories, scrollDirection",
  },
  {
    name: "product_impression",
    method: "productImpression(options)",
    category: "menu",
    description: "Track when product is visible in viewport for >2 seconds.",
    parameters: "productId, viewDuration, scrollPosition, categoryContext, hasQuickAdd",
  },
  {
    name: "menu_session_summary",
    method: "menuSessionSummary(options)",
    category: "menu",
    description: "Track overall menu browsing session when user leaves menu.",
    parameters: "sessionDuration, categoriesVisited, productsViewed, searchUsed, quickAddsAttempted, recentItemsEngaged",
  },
  {
    name: "conveyance_interaction",
    method: "conveyanceInteraction(options)",
    category: "menu",
    description: "Track engagement with hero image conveyance.",
    parameters: "conveyanceType, scrollDepth, imageEngagement",
  },
  {
    name: "recent_items_loaded",
    method: "recentItemsLoaded(options)",
    category: "menu",
    description: "Track when recent items section is populated from order history.",
    parameters: "itemCount, oldestOrderDate, newestOrderDate",
  },
  {
    name: "recent_items_empty",
    method: "recentItemsEmpty()",
    category: "menu",
    description: "Track when authenticated user has no order history.",
  },
  {
    name: "recent_item_viewed",
    method: "recentItemViewed(item)",
    category: "menu",
    description: "Track when a recent item appears in viewport.",
    parameters: "productId, lastOrderDate, hasQuickAdd",
  },
  {
    name: "recent_item_clicked",
    method: "recentItemClicked(item)",
    category: "menu",
    description: "Track when user taps on a recent item.",
    parameters: "productId, lastOrderDate, position, action",
  },
  {
    name: "recent_items_scroll",
    method: "recentItemsScroll(options)",
    category: "menu",
    description: "Track horizontal scroll of recent items carousel.",
    parameters: "itemsVisible, totalItems, scrollPosition",
  },

  // Search Events
  {
    name: "search_started",
    method: "searchStarted()",
    category: "search",
    description: "Track when user activates search mode.",
  },
  {
    name: "search",
    method: "search(query, resultCount)",
    category: "search",
    description: "Track search query and result count (legacy method).",
    parameters: "query: string, resultCount: number",
  },
  {
    name: "search_cleared",
    method: "searchCleared(options)",
    category: "search",
    description: "Track when user clears or cancels search.",
    parameters: "query, hadResults, searchDuration",
  },
  {
    name: "search_no_results",
    method: "searchNoResults(options)",
    category: "search",
    description: "Track when search returns no results.",
    parameters: "query, queryLength",
  },
  {
    name: "search_result_clicked",
    method: "searchResultClicked(options)",
    category: "search",
    description: "Track when user clicks a product from search results.",
    parameters: "query, productId, resultPosition, categoryContext",
  },

  // Loyalty Events
  {
    name: "promo_apply",
    method: "promoApply(promo)",
    category: "loyalty",
    description: "Track promo code application attempt.",
    parameters: "code, success, discount, error",
  },
  {
    name: "promo_remove",
    method: "promoRemove(code)",
    category: "loyalty",
    description: "Track promo code removal.",
    parameters: "code: string",
  },
  {
    name: "reward_view",
    method: "rewardView(reward)",
    category: "loyalty",
    description: "Track when user views available rewards.",
    parameters: "reward: object",
  },
  {
    name: "reward_apply",
    method: "rewardApply(reward)",
    category: "loyalty",
    description: "Track when user applies a reward.",
    parameters: "reward: object",
  },
  {
    name: "reward_remove",
    method: "rewardRemove(reward)",
    category: "loyalty",
    description: "Track when user removes an applied reward.",
    parameters: "reward: object",
  },

  // Error Events
  {
    name: "error",
    method: "error(type, message, properties)",
    category: "error",
    description: "Track application errors with type and message.",
    parameters: "type: string, message: string, properties?: object",
  },

  // Experiment Events
  {
    name: "experiment_assigned",
    method: "setExperiment(name, variant)",
    category: "experiment",
    description: "Track A/B test or experiment assignment.",
    parameters: "experimentName: string, variant: string",
  },

  // Custom Events
  {
    name: "custom",
    method: "track(eventName, properties)",
    category: "navigation",
    description: "Track any custom event with arbitrary properties.",
    parameters: "eventName: string, properties?: object",
  },
];

export const categoryLabels: Record<MetricCategory, string> = {
  session: "Session",
  navigation: "Navigation",
  ecommerce: "E-commerce",
  authentication: "Authentication",
  store: "Store",
  location: "Location",
  menu: "Menu",
  search: "Search",
  loyalty: "Loyalty & Promos",
  error: "Error",
  experiment: "Experiments",
};

export const categoryColors: Record<MetricCategory, string> = {
  session: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  navigation: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  ecommerce: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  authentication: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  store: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  location: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  menu: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  search: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  loyalty: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  experiment: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};
