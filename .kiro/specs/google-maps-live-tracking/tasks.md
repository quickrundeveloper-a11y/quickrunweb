# Implementation Plan: Google Maps Live Order Tracking

## Overview

This implementation plan transforms the Google Maps live tracking design into a series of incremental coding tasks. Each task builds upon previous work to create a production-grade real-time tracking system with custom driver overlays, route trimming, and synchronized animations. The implementation focuses on TypeScript safety, performance optimization through useRef usage, and comprehensive error handling.

## Tasks

- [x] 1. Set up core TypeScript interfaces and Google Maps integration
  - Create TypeScript interfaces for OrderData, DriverDetails, and RouteVisualization
  - Set up Google Maps API loading with places and geometry libraries
  - Implement basic map initialization with custom theme styling
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 1.1 Write property test for map theme configuration
  - **Property 1: Map Theme Configuration**
  - **Validates: Requirements 1.1, 1.3**

- [ ]* 1.2 Write property test for API library loading
  - **Property 2: API Library Loading**
  - **Validates: Requirements 1.2**

- [x] 2. Implement Firebase Firestore real-time listener system
  - Set up Firestore listener for Customer/{customerId}/current_order/{orderId} path
  - Implement driver location data extraction from acceptedDriverDetails.driverLatLng
  - Add coordinate validation and error handling for invalid GPS data
  - Implement location update throttling to prevent excessive API calls
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ]* 2.1 Write property test for Firestore listener path
  - **Property 3: Firestore Listener Path**
  - **Validates: Requirements 2.1**

- [ ]* 2.2 Write property test for driver location extraction
  - **Property 4: Driver Location Extraction**
  - **Validates: Requirements 2.2**

- [ ]* 2.3 Write property test for coordinate validation
  - **Property 7: Coordinate Validation**
  - **Validates: Requirements 2.5**

- [x] 3. Implement Google Roads API GPS coordinate snapping
  - Create snapDriverToRoad function using Google Roads API
  - Add fallback behavior for API failures
  - Implement coordinate validation before and after snapping
  - _Requirements: 2.3_

- [ ]* 3.1 Write property test for GPS coordinate snapping
  - **Property 5: GPS Coordinate Snapping**
  - **Validates: Requirements 2.3**

- [x] 4. Create custom Driver Overlay using Google Maps OverlayView
  - Implement DriverOverlay class extending google.maps.OverlayView
  - Add driver_icon2.png image with proper positioning and z-index
  - Implement rotation functionality based on route heading
  - Add throttled draw method for 60fps performance during zoom
  - Ensure stable position and rotation during map operations
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7_

- [ ]* 4.1 Write property test for driver overlay implementation
  - **Property 8: Driver Overlay Implementation**
  - **Validates: Requirements 3.1**

- [ ]* 4.2 Write property test for driver icon source
  - **Property 9: Driver Icon Source**
  - **Validates: Requirements 3.2**

- [ ]* 4.3 Write property test for overlay stability during zoom
  - **Property 12: Overlay Stability During Zoom**
  - **Validates: Requirements 3.5, 3.6**

- [x] 5. Implement route generation using Google DirectionsService
  - Create route generation with driver origin and customer destination
  - Fetch restaurant locations from Firestore as optimized waypoints
  - Configure DirectionsService with optimizeWaypoints: true and traffic model "bestguess"
  - Store overview_path in routePathRef for animation logic
  - Implement 30-second throttling for full route regeneration
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]* 5.1 Write property test for route generation trigger
  - **Property 14: Route Generation Trigger**
  - **Validates: Requirements 4.1**

- [ ]* 5.2 Write property test for route configuration
  - **Property 15: Route Configuration**
  - **Validates: Requirements 4.2, 4.4, 4.5**

- [ ]* 5.3 Write property test for waypoint collection
  - **Property 16: Waypoint Collection**
  - **Validates: Requirements 4.3**

- [x] 6. Checkpoint - Ensure basic tracking functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement route projection and trimming system
  - Create getNearestPointOnPath function for driver position projection
  - Implement progressive route trimming from driver's projected point forward
  - Add heading calculation using google.maps.geometry.spherical.computeHeading
  - Ensure polylines always start exactly from driver's current position
  - Implement forward-only movement constraint for driver icon
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 7.1 Write property test for driver position projection
  - **Property 19: Driver Position Projection**
  - **Validates: Requirements 5.1**

- [ ]* 7.2 Write property test for route trimming logic
  - **Property 20: Route Trimming Logic**
  - **Validates: Requirements 5.3, 5.4, 5.5**

- [ ]* 7.3 Write property test for forward movement constraint
  - **Property 21: Forward Movement Constraint**
  - **Validates: Requirements 5.6**

- [x] 8. Implement synchronized animation system
  - Create animation engine using requestAnimationFrame (not CSS transitions)
  - Implement easeInOutCubic easing function for smooth interpolation
  - Add manual lat/lng coordinate interpolation for precise control
  - Implement 360° rotation wrap-around handling to prevent spinning
  - Ensure polyline updates occur before driver overlay movement
  - Maintain perfect synchronization between driver icon and polylines
  - _Requirements: 3.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 8.1 Write property test for animation frame usage
  - **Property 11: Animation Frame Usage**
  - **Validates: Requirements 3.4**

- [ ]* 8.2 Write property test for update synchronization sequence
  - **Property 22: Update Synchronization Sequence**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ]* 8.3 Write property test for animation easing
  - **Property 23: Animation Easing**
  - **Validates: Requirements 6.4, 6.5**

- [ ] 9. Implement order state management and conditional rendering
  - Add conditional rendering for "grocerry_accepted" status (straight polyline only)
  - Implement animated route display when driver is assigned
  - Create appropriate markers for stores, customer location, and driver
  - Add status message display based on order state
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 9.1 Write property test for order status conditional rendering
  - **Property 25: Order Status Conditional Rendering**
  - **Validates: Requirements 7.1, 7.2**

- [ ]* 9.2 Write property test for marker display completeness
  - **Property 26: Marker Display Completeness**
  - **Validates: Requirements 7.3**

- [ ] 10. Implement ETA calculation and display system
  - Create ETA calculator that sums all legs[].duration.value
  - Convert total seconds to human-readable minutes format
  - Implement minimum 1-minute ETA constraint
  - Add reactive ETA updates when route or traffic conditions change
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 10.1 Write property test for ETA calculation accuracy
  - **Property 27: ETA Calculation Accuracy**
  - **Validates: Requirements 8.1, 8.2, 8.4**

- [ ]* 10.2 Write property test for ETA reactive updates
  - **Property 28: ETA Reactive Updates**
  - **Validates: Requirements 8.3**

- [ ] 11. Implement traffic-aware route visualization
  - Create traffic speed calculation for route segments
  - Implement color-coded polylines: red (speed < 2), orange (speed < 4), blue (normal)
  - Add traffic color updates when route is recalculated
  - Ensure proper polyline rendering with traffic visualization
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 11.1 Write property test for traffic color visualization
  - **Property 34: Traffic Color Visualization**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

- [ ] 12. Implement UI overlays and controls
  - Add header display with order ID and customer name
  - Create driver panel with name, phone number, and call functionality
  - Implement "last location update time" display for transparency
  - Add floating re-center button that fits bounds to driver and customer
  - Position all UI elements as floating overlays on the map
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 12.1 Write property test for UI information display
  - **Property 29: UI Information Display**
  - **Validates: Requirements 9.1, 9.2**

- [ ]* 12.2 Write property test for map bounds fitting
  - **Property 30: Map Bounds Fitting**
  - **Validates: Requirements 9.4**

- [ ] 13. Checkpoint - Ensure complete UI functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement performance optimization and memory management
  - Convert critical state to useRef for mapInstance, overlays, and route data
  - Implement proper cleanup of Firestore listeners on component unmount
  - Add memory management for map instances and overlays
  - Ensure TypeScript safety with proper type definitions
  - Add "use client" directive for Next.js client-side rendering
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 14.1 Write property test for ref-based state management
  - **Property 31: Ref-Based State Management**
  - **Validates: Requirements 10.1**

- [ ]* 14.2 Write property test for resource cleanup
  - **Property 32: Resource Cleanup**
  - **Validates: Requirements 10.2, 10.3**

- [ ] 15. Implement comprehensive error handling and resilience
  - Add Google Maps API loading failure handling with retry logic
  - Implement Firestore connection loss recovery with exponential backoff
  - Add GPS coordinate validation with fallback positioning
  - Implement route calculation failure retry with simplified parameters
  - Add error logging that maintains user experience
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 15.1 Write property test for error handling resilience
  - **Property 33: Error Handling Resilience**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

- [ ] 16. Integration and final optimization
  - Wire all components together in the main tracking component
  - Optimize performance for smooth 60fps animations
  - Add final error boundary and fallback UI components
  - Implement production-ready logging and monitoring
  - _Requirements: All requirements integration_

- [ ]* 16.1 Write integration tests for complete tracking flow
  - Test end-to-end order tracking from assignment to delivery
  - Test driver movement along complex multi-waypoint routes
  - Test network disconnection and reconnection scenarios

- [ ] 17. Final checkpoint - Ensure production readiness
  - Ensure all tests pass, ask the user if questions arise.
  - Verify performance meets 60fps animation requirements
  - Confirm memory usage is optimized for long tracking sessions
  - Validate cross-browser compatibility

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation of complex functionality
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- The implementation prioritizes performance through useRef usage and throttled operations
- Error handling is built into each component for production resilience