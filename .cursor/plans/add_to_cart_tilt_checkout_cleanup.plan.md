# Plan: Add-to-cart redesign, tilt overlay, checkout address enforcement, cleanup

- Redesign product CTAs into a single pill control with embedded +/- and quantity, matching the provided reference (green primary, rounded, compact). Apply to home/category/search/product pages and detail page; keep price/unit info unchanged.
- Replace shop-closed overlay with `public/img/shopclose.png`, add gyroscope-based tilt/parallax (DeviceOrientation/DeviceMotion with CSS fallback), and reduce blur/opacity so UI stays readable; keep cards tappable unless closed.
- Relax browsing gating: allow browsing and adding to cart without location; only require/confirm delivery address at checkout/cart submission (Flipkart/Amazon style). Update cart to block order placement until address is chosen; keep minimal blur.
- Simplify overlays: minimal blur when non-interactive; keep cards clickable unless explicitly “Shop Closed” or missing shop data.
- Cleanup: remove unused imports/duplicate logic/agent logs, ensure `razorpay` dep is installed and build passes; adjust QA notes accordingly; reduce unnecessary blur for readability; remove any accidental telemetry calls.