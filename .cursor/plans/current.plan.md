# Plan: Add-to-cart redesign, tilt overlay, checkout address enforcement, cleanup

- Redesign add-to-cart into a single pill with embedded +/- and quantity (green, rounded). Apply to home/category/search/product detail cards; keep pricing text untouched.
- Replace shop-closed overlay with `public/img/shopclose.png` and add DeviceOrientation tilt/parallax (with CSS fallback). Soften blur/opacity for readability; keep cards tappable unless shop is closed/missing.
- Allow add-to-cart without location; shift gating to checkout: require/confirm delivery address during order placement (cart/checkout) similar to Flipkart/Amazon.
- Simplify overlays: minimal blur when non-interactive; only block when shop is closed or data missing.
- Cleanup and stability: remove unused imports/duplicate logic/telemetry logs, ensure `razorpay` dependency/build works, update QA to match new flow.