# QA Checklist – Location gating & Razorpay

- Pre-location: load home without saved location; all products visible but cards/hero/cart buttons disabled with “Select location to order”.
- Detect CTA: click “Detect my location” in header; ensure geolocation prompt appears only on click and state persists on refresh.
- Manual location: search & pick an address; cards become interactive only after selection.
- Out of range (>5 km): select location far from a shop; cards show “Delivery is not available in your area” overlay, pages stay scrollable, add-to-cart blocked.
- Shop closed: mark a `Restaurent_shop.activeShop=false`; cards show “Shop Closed” image overlay; product page and cart interactions blocked.
- Missing shop location/ID: products with invalid shop show “Shop unavailable/location unavailable” overlay and cannot be clicked/added.
- Cart gating: opening cart without location blocks qty controls and place order with reason banner; out-of-range/closed shop blocks actions too.
- Razorpay success: place online order with valid keys; order is created, verify route returns success, cart clears, navigate to tracking.
- Razorpay failure: trigger payment.failed; UI shows alert and processing resets; no order is created.
- COD flow: within deliverable range, COD order writes to `Customer/{uid}/current_order` and clears cart.

