# Requirements Document

## Introduction

This document specifies the requirements for a Next.js (App Router) client-side Google Maps live order tracking page that provides real-time driver movement visualization, exactly like Blinkit/Zomato admin tracking systems. The system will use Google Maps JavaScript API with Firebase Firestore real-time listeners to create a production-grade tracking experience with animated custom driver icons, route trimming, and synchronized polylines.

## Glossary

- **Driver_Overlay**: Custom Google Maps OverlayView implementation for driver icon rendering
- **Route_Trimmer**: System component that progressively trims route polylines based on driver position
- **GPS_Snapper**: Component that snaps raw GPS coordinates to roads using Google Roads API
- **Firestore_Listener**: Real-time database listener for driver location updates
- **Polyline_Synchronizer**: System that ensures driver icon and route polylines remain synchronized
- **ETA_Calculator**: Component that calculates estimated time of arrival based on route legs
- **Map_Theme**: Custom Google Maps styling configuration
- **Animation_Engine**: System that handles smooth driver movement with easing functions

## Requirements

### Requirement 1: Google Maps Initialization and Styling

**User Story:** As a customer, I want to see a beautifully styled map interface, so that I can easily track my order in a visually appealing environment.

#### Acceptance Criteria

1. WHEN the tracking page loads, THE Map_Theme SHALL apply custom styling with water, roads, landscape, POI, and disabled label icons
2. THE Google_Maps_API SHALL be initialized with places and geometry libraries
3. THE Map_Instance SHALL use custom theme configuration for consistent branding
4. THE Map_Container SHALL be responsive and properly sized within the page layout

### Requirement 2: Real-time Driver Location Tracking

**User Story:** As a customer, I want to see my driver's live location updates, so that I can track the real-time progress of my delivery.

#### Acceptance Criteria

1. WHEN a driver is assigned, THE Firestore_Listener SHALL listen to Customer/{customerId}/current_order/{orderId}
2. WHEN driver location updates occur, THE System SHALL read acceptedDriverDetails.driverLatLng for coordinates
3. THE GPS_Snapper SHALL snap raw GPS coordinates to roads using Google Roads API before processing
4. THE System SHALL throttle location updates to prevent excessive API calls
5. WHEN location data is received, THE System SHALL validate coordinates before processing

### Requirement 3: Custom Driver Icon Implementation

**User Story:** As a customer, I want to see a custom driver icon that rotates and moves smoothly, so that I can easily identify my driver's position and direction.

#### Acceptance Criteria

1. THE Driver_Overlay SHALL be implemented using Google Maps OverlayView, not default markers
2. THE Driver_Icon SHALL use driver_icon2.png as the visual representation
3. WHEN driver moves, THE Driver_Icon SHALL rotate based on heading calculated from route direction
4. THE Animation_Engine SHALL use requestAnimationFrame for smooth movement, not CSS transitions
5. THE Driver_Overlay SHALL prevent jitter during zoom operations using throttled draw at maximum 60fps
6. THE Driver_Icon SHALL maintain stable rotation and position during map zoom operations
7. THE Driver_Overlay SHALL have higher z-index than polylines to ensure visibility

### Requirement 4: Route Generation and Management

**User Story:** As a customer, I want to see the optimal route my driver will take, so that I can understand the delivery path and estimated timing.

#### Acceptance Criteria

1. WHEN driver location is available, THE System SHALL generate route using Google DirectionsService
2. THE Route_Generator SHALL set origin as driver location and destination as customer address
3. THE System SHALL fetch multiple restaurant locations from Firestore as waypoints
4. THE DirectionsService SHALL use optimizeWaypoints: true for efficient routing
5. THE Route_Options SHALL enable traffic model with "bestguess" for accurate timing
6. THE System SHALL store overview_path in routePathRef for animation logic
7. THE System SHALL throttle full route regeneration to every 30 seconds maximum

### Requirement 5: Route Projection and Trimming

**User Story:** As a customer, I want to see the remaining route ahead of my driver, so that I can visualize the upcoming delivery path.

#### Acceptance Criteria

1. WHEN driver location updates, THE Route_Trimmer SHALL project driver's GPS location onto nearest point on route polyline
2. THE System SHALL compute heading using google.maps.geometry.spherical.computeHeading
3. THE Route_Trimmer SHALL progressively trim route from driver's projected point forward
4. THE System SHALL redraw only remaining polyline segments after trimming
5. THE Polyline_Synchronizer SHALL ensure polyline always starts exactly from driver's current position
6. THE Driver_Icon SHALL always move forward along the route, never backward

### Requirement 6: Synchronized Animation System

**User Story:** As a customer, I want the driver icon and route to stay perfectly synchronized, so that the tracking appears accurate and professional.

#### Acceptance Criteria

1. WHEN updating driver position, THE System SHALL first redraw trimmed polylines
2. WHEN polylines are updated, THE System SHALL then move/animate driver overlay to the same projected point
3. THE Driver_Icon and polyline SHALL never desync during updates
4. THE Animation_Engine SHALL use easing (easeInOutCubic) for smooth interpolation
5. THE System SHALL interpolate lat/lng coordinates manually for precise control
6. THE Rotation_Handler SHALL handle 360° rotation wrap-around correctly to prevent spinning

### Requirement 7: Order State Management

**User Story:** As a customer, I want to see different map displays based on my order status, so that I receive appropriate information for each delivery stage.

#### Acceptance Criteria

1. WHEN order status is "grocerry_accepted", THE System SHALL show only store to customer straight polyline
2. WHEN driver is assigned, THE System SHALL show animated route with ETA calculation
3. THE System SHALL display appropriate markers for stores, customer location, and driver
4. THE UI_Controller SHALL show relevant status messages based on order state

### Requirement 8: ETA Calculation and Display

**User Story:** As a customer, I want to see accurate delivery time estimates, so that I can plan accordingly for my order arrival.

#### Acceptance Criteria

1. WHEN route is calculated, THE ETA_Calculator SHALL sum all legs[].duration.value
2. THE System SHALL convert total seconds to minutes and display in human-readable format
3. THE ETA_Display SHALL update when route changes or traffic conditions update
4. THE System SHALL show minimum 1 minute ETA even for very short distances

### Requirement 9: UI Overlays and Controls

**User Story:** As a customer, I want intuitive map controls and information displays, so that I can easily interact with the tracking interface.

#### Acceptance Criteria

1. THE Header_Display SHALL show order ID and customer name
2. THE Driver_Panel SHALL display driver details including name and phone number
3. THE System SHALL show "last location update time" for transparency
4. THE Re_Center_Button SHALL fit bounds to include both driver and customer locations
5. THE UI_Elements SHALL be positioned as floating overlays on the map

### Requirement 10: Memory Management and Performance

**User Story:** As a system administrator, I want the tracking page to run efficiently without memory leaks, so that users have a smooth experience during long tracking sessions.

#### Acceptance Criteria

1. THE System SHALL use useRef heavily to avoid unnecessary re-renders
2. THE Cleanup_Handler SHALL properly dispose of Firestore listeners on component unmount
3. THE Memory_Manager SHALL clean up map instances and overlays when no longer needed
4. THE System SHALL be TypeScript safe with proper type definitions
5. THE Component SHALL use Next.js "use client" directive for client-side rendering

### Requirement 11: Error Handling and Resilience

**User Story:** As a customer, I want the tracking system to handle errors gracefully, so that I can continue tracking even when issues occur.

#### Acceptance Criteria

1. WHEN Google Maps API fails to load, THE System SHALL display appropriate error message
2. WHEN Firestore connection is lost, THE System SHALL attempt reconnection
3. WHEN GPS coordinates are invalid, THE System SHALL use fallback positioning
4. WHEN route calculation fails, THE System SHALL retry with simplified parameters
5. THE Error_Handler SHALL log errors for debugging while maintaining user experience

### Requirement 12: Traffic-Aware Route Visualization

**User Story:** As a customer, I want to see traffic conditions on my delivery route, so that I can understand potential delays.

#### Acceptance Criteria

1. WHEN drawing route segments, THE System SHALL color-code polylines based on traffic speed
2. THE Traffic_Visualizer SHALL use red color for slow traffic (speed < 2)
3. THE Traffic_Visualizer SHALL use orange color for moderate traffic (speed < 4)
4. THE Traffic_Visualizer SHALL use blue color for normal traffic conditions
5. THE System SHALL update traffic colors when route is recalculated