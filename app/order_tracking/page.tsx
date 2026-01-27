"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { MdMyLocation } from "react-icons/md";

// ⭐ TS FIX: declare window extras
declare global {
  interface Window {
    google: any;
    customPolylines?: any[];
  }
}

// ⭐ CUSTOM GOOGLE MAP THEME
const mapTheme = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#addfff" }, { lightness: 17 }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#F1F2F7" }, { lightness: 20 }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }, { lightness: 17 }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }, { lightness: 18 }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }, { lightness: 16 }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }, { lightness: 21 }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#80ef80" }, { lightness: 21 }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      { saturation: 36 },
      { color: "#333333" },
      { lightness: 40 },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#f2f2f2" }, { lightness: 19 }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#fefefe" }, { lightness: 20 }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#fefefe" }, { lightness: 17 }, { weight: 1.2 }],
  },
];

export default function BlinkitOrderTracking() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<any>(null)
  const storeMarkerRef = useRef<any>(null)
  const customerMarkerRef = useRef<any>(null)
  const driverMarkerRef = useRef<any>(null)
  const routeDrawnRef = useRef(false)
  const driverOverlayRef = useRef<any>(null)
  const DriverOverlayClassRef = useRef<any>(null)

  // ⭐ Animation system refs for synchronized movement
  const animationFrameRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number>(0);
  const animationDurationRef = useRef<number>(2000);
  const fromPositionRef = useRef<any>(null);
  const toPositionRef = useRef<any>(null);
  const fromRotationRef = useRef<number>(0);
  const toRotationRef = useRef<number>(0);
  const routePathRef = useRef<any[]>([]);

  // ⭐ Real-time tracking refs
  const lastDriverUpdateRef = useRef<string>('');
  const routeGenerationTimeRef = useRef<number>(0);
  const restaurantStopsRef = useRef<{ lat: number; lng: number }[]>([]);
  const ROUTE_REGENERATION_THROTTLE = 30000; // 30 seconds

  // 2. ADDED USERID STATE
  const [userId, setUserId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [eta, setEta] = useState<string | null>(null);

  // ⭐ Store name for header (loaded from Restaurent_shop)
  const [storeName, setStoreName] = useState<string | null>(null);
  const [restaurantNames, setRestaurantNames] = useState<Record<string, string>>({});
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // ⭐ Enhanced easing function for smooth interpolation
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // ⭐ Manual lat/lng coordinate interpolation for precise control
  const interpolateLatLng = (from: any, to: any, progress: number): any => {
    if (!from || !to) return from || to;
    
    const lat = from.lat() + (to.lat() - from.lat()) * progress;
    const lng = from.lng() + (to.lng() - from.lng()) * progress;
    
    return new window.google.maps.LatLng(lat, lng);
  };

  // ⭐ 360° rotation wrap-around handling to prevent spinning
  const interpolateRotation = (from: number, to: number, progress: number): number => {
    // Normalize angles to 0-360
    const normalizedFrom = ((from % 360) + 360) % 360;
    const normalizedTo = ((to % 360) + 360) % 360;
    
    // Calculate the shortest rotation path
    let diff = normalizedTo - normalizedFrom;
    
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }
    
    const result = normalizedFrom + (diff * progress);
    return ((result % 360) + 360) % 360;
  };

  // ⭐ Enhanced route projection system
  const getNearestPointOnPath = (path: any[], pos: any) => {
    let nearest = path[0];
    let minDist = Infinity;
    let routeIndex = 0;

    path.forEach((p: any, index: number) => {
      const d = window.google.maps.geometry.spherical.computeDistanceBetween(p, pos);
      if (d < minDist) {
        minDist = d;
        nearest = p;
        routeIndex = index;
      }
    });

    // Calculate heading to next point for direction
    const nextPoint = path[routeIndex + 1] || path[routeIndex];
    let heading = window.google.maps.geometry.spherical.computeHeading(nearest, nextPoint);
    if (isNaN(heading)) heading = 0;

    return {
      nearestPoint: nearest,
      heading: (heading + 360) % 360,
      distanceFromRoute: minDist,
      routeIndex: routeIndex
    };
  };

  // ⭐ Route trimming from driver's projected point forward
  const trimRouteFromDriverPosition = (routePath: any[], driverPosition: any): any[] => {
    if (typeof window === "undefined" || !window.google) return routePath;
    if (!routePath || routePath.length === 0) {
      return [];
    }

    const projection = getNearestPointOnPath(routePath, driverPosition);
    
    // Get remaining route segments from driver's position forward
    const remainingPath = routePath.slice(projection.routeIndex);
    
    // Ensure polyline starts exactly from driver's current position
    if (remainingPath.length > 0) {
      remainingPath[0] = projection.nearestPoint;
    }

    return remainingPath;
  };

  // ⭐ Synchronized polyline update function
  const updatePolylinesSync = (trimmedRoute: any[]) => {
    if (!window.customPolylines || !trimmedRoute || trimmedRoute.length < 2) {
      return;
    }

    // Clear existing polylines
    window.customPolylines.forEach((pl) => pl.setMap(null));
    window.customPolylines = [];

    // Redraw polylines with traffic colors
    for (let i = 0; i < trimmedRoute.length - 1; i++) {
      const p1 = trimmedRoute[i];
      const p2 = trimmedRoute[i + 1];

      const dist = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
      const speed = dist / 5;

      let color = "#48BBDB";
      if (speed < 2) color = "#ff0000";
      else if (speed < 4) color = "#ffa500";

      const seg = new window.google.maps.Polyline({
        path: [p1, p2],
        strokeColor: color,
        strokeWeight: 5,
        map: mapInstance.current,
      });

      window.customPolylines.push(seg);
    }
  };

  // ⭐ Animation engine using requestAnimationFrame (not CSS transitions)
  const animateDriverMovement = (
    fromPos: any, 
    toPos: any, 
    fromRotation: number, 
    toRotation: number,
    duration: number = 2000
  ) => {
    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Set up animation parameters
    fromPositionRef.current = fromPos;
    toPositionRef.current = toPos;
    fromRotationRef.current = fromRotation;
    toRotationRef.current = toRotation;
    animationDurationRef.current = duration;
    animationStartTimeRef.current = performance.now();

    // Start animation loop
    const animate = (currentTime: number) => {
      const elapsed = currentTime - animationStartTimeRef.current;
      const progress = Math.min(elapsed / animationDurationRef.current, 1);
      
      // Apply easing function
      const easedProgress = easeInOutCubic(progress);
      
      // Interpolate position
      const currentPosition = interpolateLatLng(
        fromPositionRef.current,
        toPositionRef.current,
        easedProgress
      );
      
      // Interpolate rotation with wrap-around handling
      const currentRotation = interpolateRotation(
        fromRotationRef.current,
        toRotationRef.current,
        easedProgress
      );

      // ⭐ Synchronized update: First update polylines, then driver overlay
      if (currentPosition && driverOverlayRef.current) {
        // Update trimmed polylines first
        const trimmedRoute = trimRouteFromDriverPosition(routePathRef.current, currentPosition);
        updatePolylinesSync(trimmedRoute);
        
        // Then update driver overlay to maintain synchronization
        driverOverlayRef.current.setPosition(currentPosition);
        driverOverlayRef.current.setRotation(currentRotation);
      }

      // Continue animation if not complete
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const createDriverOverlayClass = () => {
    return class DriverOverlay extends window.google.maps.OverlayView {
      position: any;
      div: HTMLDivElement | null = null;
      rotation = 0;
      private animationFrameId: number | null = null;

      constructor(position: any) {
        super()
        this.position = position
      }

      onAdd() {
        this.div = document.createElement("div")
        this.div.style.position = "absolute"
        this.div.style.width = "40px"
        this.div.style.height = "40px"
        this.div.style.transformOrigin = "50% 50%"
        this.div.style.willChange = "transform"
        this.div.style.pointerEvents = "none"
        this.div.style.zIndex = "9999" // always above polylines
        this.div.style.transition = "none" // No CSS transitions as per requirements

        const img = document.createElement("img")
        img.src = "/img/driver_icon2.png"
        img.style.width = "100%"
        img.style.height = "100%"
        img.style.pointerEvents = "none"

        this.div.appendChild(img)
        this.getPanes().overlayLayer.appendChild(this.div)
      }

      draw() {
        // Enhanced throttle with requestAnimationFrame for smooth 60fps
        if (this.animationFrameId) {
          return; // Already scheduled
        }

        this.animationFrameId = requestAnimationFrame(() => {
          this.animationFrameId = null;
          this.performDraw();
        });
      }

      private performDraw() {
        const projection = this.getProjection()
        if (!projection || !this.div) return

        const point = projection.fromLatLngToDivPixel(this.position)
        if (!point) return

        // Batch DOM updates for performance
        const transform = `translate(${point.x - 20}px, ${point.y - 20}px) rotate(${this.rotation}deg)`;
        this.div.style.transform = transform;
      }

      setPosition(pos: any) {
        this.position = pos
        this.draw()
      }

      setRotation(deg: number) {
        // Enhanced 360° wrap-around handling to prevent spinning
        const normalizedDeg = ((deg % 360) + 360) % 360;
        
        // Prevent unnecessary updates
        if (Math.abs(this.rotation - normalizedDeg) < 1) {
          return;
        }
        
        this.rotation = normalizedDeg;
        this.draw()
      }

      getPosition() {
        return this.position;
      }

      getRotation() {
        return this.rotation;
      }

      onRemove() {
        // Enhanced cleanup
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
        
        if (this.div) this.div.remove()
        this.div = null
      }
    }
  }

  const snapDriverToRoad = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://roads.googleapis.com/v1/snapToRoads?path=${lat},${lng}&interpolate=false&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      const data = await res.json()
      if (data?.snappedPoints?.length > 0) {
        return {
          lat: data.snappedPoints[0].location.latitude,
          lng: data.snappedPoints[0].location.longitude,
        }
      }
    } catch (e) {}
    return { lat, lng } // fallback
  }

  useEffect(() => {
    if (!userId) return;

    const db = getFirestore();
    const userRef = doc(db, "Customer", userId);

    getDoc(userRef).then(snap => {
      if (snap.exists()) {
        setUserProfile(snap.data());
      }
    });
  }, [userId]);

  // 3. LOAD USER ID FROM LOCALSTORAGE
  useEffect(() => {
    setUserId(localStorage.getItem("currentUser"));
  }, []);

  // 4. REFACTORED DATA FETCHING (Depends on userId, no Auth)
  useEffect(() => {
    if (!userId) return;

    const db = getFirestore();

    try {
      // Updated path: Customer/{userId}/current_order
      const colRef = collection(db, "Customer", userId, "current_order");

      const unsubscribeSnapshot = onSnapshot(
        colRef,
        async (snap) => {
          if (!snap.empty) {
            const latest = snap.docs[snap.docs.length - 1];
            setOrderId(latest.id);
            const orderData = latest.data();
            setOrderData(orderData);

            // Fetch restaurant names for all items
            if (orderData?.items && Array.isArray(orderData.items)) {
              setLoadingRestaurants(true);

              const restaurantIds = [
                ...new Set(
                  orderData.items
                    .filter((item: any) => item.restaurentId)
                    .map((item: any) => item.restaurentId)
                ),
              ];

              if (restaurantIds.length > 0) {
                const namePromises = restaurantIds.map(async (restaurantId: string) => {
                  try {
                    const restaurantRef = doc(db, "Restaurent_shop", restaurantId);
                    const restaurantSnap = await getDoc(restaurantRef);

                    if (restaurantSnap.exists()) {
                      const data = restaurantSnap.data();
                      const name = data?.name || data?.storeName || data?.shopName || `Restaurant ${restaurantId}`;
                      return { id: restaurantId, name };
                    }
                    return { id: restaurantId, name: `Restaurant ${restaurantId}` };
                  } catch (error) {
                    console.error(`Error fetching restaurant ${restaurantId}:`, error);
                    return { id: restaurantId, name: `Restaurant ${restaurantId}` };
                  }
                });

                try {
                  const restaurantData = await Promise.all(namePromises);
                  const nameMap = restaurantData.reduce((acc, { id, name }) => {
                    acc[id] = name;
                    return acc;
                  }, {} as Record<string, string>);

                  setRestaurantNames(nameMap);

                  // Set the first restaurant name as the main store name for the header
                  if (restaurantData.length > 0) {
                    setStoreName(restaurantData[0].name);
                  }
                } catch (error) {
                  console.error("Error fetching restaurant names:", error);
                } finally {
                  setLoadingRestaurants(false);
                }
              } else {
                setLoadingRestaurants(false);
              }
            }
          } else {
            setOrderId(null);
            setOrderData(null);
            setRestaurantNames({});
            setStoreName(null);
          }
        },
        (err) => {
          console.log("current_order snapshot error:", err);
        }
      );

      // cleanup snapshot when userId changes / unmount
      return () => unsubscribeSnapshot();
    } catch (error) {
      console.log("Order fetch error:", error);
    }
  }, [userId]);

  // ⭐ Enhanced real-time driver location tracking with throttling
  const updateDriverOnExistingRoute = async (driverLat: number, driverLng: number) => {
    if (typeof window === "undefined" || !window.google) return;

    if (!routePathRef.current || routePathRef.current.length === 0) {
      console.log('No existing route to update driver position on');
      return;
    }

    const snapped = await snapDriverToRoad(driverLat, driverLng);
    const driverPos = new window.google.maps.LatLng(snapped.lat, snapped.lng);
    
    // Project driver position onto route
    const projection = getNearestPointOnPath(routePathRef.current, driverPos);
    
    // Get current driver position for animation
    const currentPosition = driverOverlayRef.current?.getPosition();
    const currentRotation = driverOverlayRef.current?.getRotation() || 0;

    if (currentPosition && driverOverlayRef.current) {
      // Use synchronized animation system for smooth updates
      animateDriverMovement(
        currentPosition,
        projection.nearestPoint,
        currentRotation,
        projection.heading,
        1500 // 1.5 second animation
      );
    } else if (driverOverlayRef.current) {
      // First time positioning - no animation needed
      const trimmedRoute = trimRouteFromDriverPosition(routePathRef.current, driverPos);
      updatePolylinesSync(trimmedRoute);
      
      driverOverlayRef.current.setPosition(projection.nearestPoint);
      driverOverlayRef.current.setRotation(projection.heading);
    }

    console.log('Driver position updated:', {
      original: { lat: driverLat, lng: driverLng },
      snapped: { lat: snapped.lat, lng: snapped.lng },
      projected: projection.nearestPoint,
      heading: projection.heading
    });
  };

  // ⭐ Function to generate new route with throttling
  const generateNewRoute = async (driverLat: number, driverLng: number, userLat: number, userLng: number) => {
    const now = Date.now();
    
    // Check if we should throttle route generation (30 seconds)
    if (now - routeGenerationTimeRef.current < ROUTE_REGENERATION_THROTTLE) {
      console.log('Route generation throttled, updating driver on existing route');
      await updateDriverOnExistingRoute(driverLat, driverLng);
      return;
    }

    console.log('Generating new route...');
    routeGenerationTimeRef.current = now;

    const snapped = await snapDriverToRoad(driverLat, driverLng);
    const driverLatNum = snapped.lat;
    const driverLngNum = snapped.lng;

    const directionsService = new window.google.maps.DirectionsService();

    const routeOptions = {
      origin: { lat: driverLatNum, lng: driverLngNum },
      destination: { lat: userLat, lng: userLng },
      waypoints: restaurantStopsRef.current.map((p) => ({
        location: new window.google.maps.LatLng(p.lat, p.lng),
        stopover: true,
      })),
      optimizeWaypoints: true,
      travelMode: window.google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: "bestguess",
      },
    } as any;

    directionsService.route(routeOptions, (result: any, status: any) => {
      if (status === "OK" && result) {
        const overviewPath = result.routes[0].overview_path;
        
        // ⭐ Store overview_path in routePathRef for animation logic
        routePathRef.current = overviewPath;

        // Clear existing polylines
        if (window.customPolylines) {
          window.customPolylines.forEach((pl) => pl.setMap(null));
        }
        window.customPolylines = [];

        // Draw new route with traffic colors
        for (let i = 0; i < overviewPath.length - 1; i++) {
          const p1 = overviewPath[i];
          const p2 = overviewPath[i + 1];

          const dist = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
          const speed = dist / 5;

          let color = "#48BBDB";
          if (speed < 2) color = "#ff0000";
          else if (speed < 4) color = "#ffa500";

          const seg = new window.google.maps.Polyline({
            path: [p1, p2],
            strokeColor: color,
            strokeWeight: 5,
            map: mapInstance.current,
          });

          window.customPolylines.push(seg);
        }

        // Update ETA
        const legs = result.routes[0].legs || [];
        if (legs.length > 0) {
          const totalSeconds = legs.reduce((sum: number, l: any) => sum + (l?.duration?.value ?? 0), 0);
          const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
          setEta(`${totalMinutes} mins`);
        }

        // Position driver on new route
        const driverPos = new window.google.maps.LatLng(driverLatNum, driverLngNum);
        const projection = getNearestPointOnPath(overviewPath, driverPos);

        if (!driverOverlayRef.current) {
          const DriverOverlay = DriverOverlayClassRef.current;
          driverOverlayRef.current = new DriverOverlay(projection.nearestPoint);
          driverOverlayRef.current.setMap(mapInstance.current);
        } else {
          driverOverlayRef.current.setPosition(projection.nearestPoint);
        }
        
        driverOverlayRef.current.setRotation(projection.heading);

        console.log('New route generated successfully');
      } else {
        console.error("Route generation failed:", status);
        // Fallback to updating on existing route
        updateDriverOnExistingRoute(driverLat, driverLng);
      }
    });
  };

  useEffect(() => {
    if (!orderData) return;

    const waitForGoogle = setInterval(async () => {
      if (window.google && mapRef.current) {
        clearInterval(waitForGoogle);

        const defaultLat = 28.628;
        const defaultLng = 77.3649;

        if (!mapInstance.current) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: {
              lat: Number(orderData.address?.lat) || defaultLat,
              lng: Number(orderData.address?.lng) || defaultLng,
            },
            zoom: 15,
            disableDefaultUI: true,
            gestureHandling: "greedy",
            styles: mapTheme,
          });

          // 🔥 OVERLAY CLASS INIT (MUST)
          if (!DriverOverlayClassRef.current) {
            DriverOverlayClassRef.current = createDriverOverlayClass()
          }
        }

        const map = mapInstance.current;

        const storeLat = Number(orderData.storeLat) || defaultLat;
        const storeLng = Number(orderData.storeLng) || defaultLng;

        // store marker (always)
        if (!storeMarkerRef.current) {
          storeMarkerRef.current = new window.google.maps.Marker({
            position: { lat: storeLat, lng: storeLng },
            map,
            icon: {
              url: "/img/store-pin.png",
              scaledSize: new window.google.maps.Size(30, 30),
            },
          });
        } else {
          storeMarkerRef.current.setPosition({
            lat: storeLat,
            lng: storeLng,
          });
        }

        // ⭐ FETCH ALL RESTAURANT STOPS IN ORDER (only once)
        if (restaurantStopsRef.current.length === 0) {
          const fetchAllRestaurantStops = async () => {
            const db = getFirestore();
            const stops: { lat: number; lng: number }[] = [];

            if (!orderData?.items) return stops;

            const tasks = orderData.items
              .filter((it: any) => it.restaurentId)
              .map(async (it: any) => {
                try {
                  const resRef = doc(db, "Restaurent_shop", it.restaurentId);
                  const resSnap = await getDoc(resRef);

                  if (!resSnap.exists()) return;

                  const data = resSnap.data();
                  const loc = data?.location;
                  if (!loc?.lat || !loc?.lng) return;

                  const originalLat = Number(loc.lat);
                  const originalLng = Number(loc.lng);

                  const snapRes = await fetch(
                    `https://roads.googleapis.com/v1/snapToRoads?path=${originalLat},${originalLng}&interpolate=false&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                  );
                  const snapData = await snapRes.json();

                  let finalLat = originalLat;
                  let finalLng = originalLng;

                  if (snapData?.snappedPoints?.length > 0) {
                    finalLat = snapData.snappedPoints[0].location.latitude;
                    finalLng = snapData.snappedPoints[0].location.longitude;
                  }

                  stops.push({ lat: finalLat, lng: finalLng });

                  new window.google.maps.Marker({
                    position: { lat: finalLat, lng: finalLng },
                    map,
                    zIndex: 999,
                    icon: {
                      url: "/img/store.png",
                      scaledSize: new window.google.maps.Size(28, 28),
                    },
                  });
                } catch (err) {
                  console.log("Restaurant fetch error:", err);
                }
              });

            await Promise.all(tasks);
            return stops;
          };

          restaurantStopsRef.current = await fetchAllRestaurantStops();
        }

        // If status is grocerry_accepted -> show the user pointer only
        if (orderData.status === "grocerry_accepted") {
          if (orderData?.address?.lat && orderData?.address?.lng) {
            const userLatNum = Number(orderData.address.lat);
            const userLngNum = Number(orderData.address.lng);

            if (!customerMarkerRef.current) {
              customerMarkerRef.current = new window.google.maps.Marker({
                position: { lat: userLatNum, lng: userLngNum },
                map,
                icon: {
                  url: "/img/customer_pin.png",
                  scaledSize: new window.google.maps.Size(30, 30),
                },
              });
            } else {
              customerMarkerRef.current.setPosition({
                lat: userLatNum,
                lng: userLngNum,
              });
            }

            // center map on user
            map.panTo({ lat: userLatNum, lng: userLngNum });
          }

          // ⭐ DRAW SIMPLE LINE FROM STORE → USER WHEN NO DRIVER ASSIGNED
          const storeLatNum = Number(orderData.storeLat);
          const storeLngNum = Number(orderData.storeLng);
          const userLatNum = Number(orderData.address?.lat);
          const userLngNum = Number(orderData.address?.lng);

          if (
            !isNaN(storeLatNum) &&
            !isNaN(storeLngNum) &&
            !isNaN(userLatNum) &&
            !isNaN(userLngNum)
          ) {
            new window.google.maps.Polyline({
              path: [
                { lat: storeLatNum, lng: storeLngNum },
                { lat: userLatNum, lng: userLngNum },
              ],
              strokeColor: "#48BBDB",
              strokeWeight: 5,
              map: map,
            });
          }
        }

        // ⭐ REAL-TIME DRIVER LOCATION HANDLING
        const driverLat = orderData?.acceptedDriverDetails?.driverLatLng?.lat;
        const driverLng = orderData?.acceptedDriverDetails?.driverLatLng?.lng;

        if (driverLat && driverLng && orderData?.address?.lat && orderData?.address?.lng) {
          const userLatNum = Number(orderData.address.lat);
          const userLngNum = Number(orderData.address.lng);

          // Add customer marker for driver-assigned orders
          if (!customerMarkerRef.current) {
            customerMarkerRef.current = new window.google.maps.Marker({
              position: { lat: userLatNum, lng: userLngNum },
              map,
              zIndex: 999,
              icon: {
                url: "/img/customer_pin.png",
                scaledSize: new window.google.maps.Size(25, 25),
              },
            });
          }

          // Create unique key for driver location to detect changes
          const driverLocationKey = `${driverLat}-${driverLng}`;
          
          // Only update if driver location actually changed
          if (lastDriverUpdateRef.current !== driverLocationKey) {
            console.log('Driver location changed, updating...', { lat: driverLat, lng: driverLng });
            lastDriverUpdateRef.current = driverLocationKey;
            
            // Generate new route or update existing one
            await generateNewRoute(
              Number(driverLat),
              Number(driverLng),
              userLatNum,
              userLngNum
            );
          } else {
            console.log('Driver location unchanged, skipping update');
          }
        }
      }
    }, 200);

    return () => clearInterval(waitForGoogle);
  }, [orderData]);

  if (!userId) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Please log in to track your order.</p>
      </div>
    );
  }

  //new code notification
  const sendOrderToRestaurant = async () => {
    if (!userId || !orderId) {
      console.error("Missing userId or orderId", { userId, orderId })
      return
    }

    try {
      const res = await fetch("/api/notify-restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: userId, // ✅ FIX HERE
          orderId: orderId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("NOTIFY_FAIL", data)
        alert("Failed to notify restaurant")
        return
      }

      console.log("RESTAURANT_NOTIFIED")
    } catch (err) {
      console.error("CLIENT_ERROR", err)
    }
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-800 pb-20">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
        strategy="afterInteractive"
      />

      <div className="w-full max-w-3xl mx-auto pt-6 sm:pt-12 px-4 sm:px-6">
        {/* MAP + HEADER CARD */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-9 text-center">
            <h1 className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">Order is confirmed</h1>

            {orderId && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1"></p>}
            {orderData?.status === "grocerry_accepted" ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                We'll assign a delivery partner as soon as your order is packed
              </p>
            ) : eta ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                Your order is arriving in {eta}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 mb-4 sm:mb-6 overflow-hidden shadow-sm relative">
            <div ref={mapRef} className="w-full h-64 sm:h-80 lg:h-120" />

            <button
              onClick={() => {
                if (!mapInstance.current) return;

                const driverLat =
                  orderData?.acceptedDriverDetails?.driverLatLng?.lat;
                const driverLng =
                  orderData?.acceptedDriverDetails?.driverLatLng?.lng;
                const userLat = orderData?.address?.lat;
                const userLng = orderData?.address?.lng;

                if (driverLat && driverLng && userLat && userLng) {
                  const bounds = new window.google.maps.LatLngBounds();
                  bounds.extend(
                    new window.google.maps.LatLng(
                      Number(driverLat),
                      Number(driverLng)
                    )
                  );
                  bounds.extend(
                    new window.google.maps.LatLng(
                      Number(userLat),
                      Number(userLng)
                    )
                  );

                  mapInstance.current.fitBounds(bounds, 100);
                  return;
                }

                if (userLat && userLng) {
                  mapInstance.current.panTo({
                    lat: Number(userLat),
                    lng: Number(userLng),
                  });
                }
              }}
              className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white dark:bg-gray-700 shadow-lg p-2 sm:p-3 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <MdMyLocation className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* LOWER SECTIONS */}
        <div className="mt-4 sm:mt-8 space-y-3 sm:space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 text-2xl sm:text-3xl">🛵</span>
              {orderData?.status === "grocerry_accepted" ? (
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                  We'll assign a delivery partner as soon as your order is
                  packed
                </p>
              ) : eta ? (
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                  Your order is arriving in {eta}
                </p>
              ) : (
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                  We'll assign a delivery partner as soon as your order is
                  packed
                </p>
              )}
            </div>
            {orderData?.acceptedDriverDetails && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 sm:py-4 shadow-sm">

                <p className="font-semibold text-gray-800 dark:text-gray-200 text-base sm:text-lg mb-3">
                  Delivery Partner
                </p>

                <div className="flex items-center justify-between flex-wrap gap-2">

                  {/* LEFT SIDE: NAME */}
                  <div className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
                    {orderData.acceptedDriverDetails.driverName}
                  </div>

                  {/* RIGHT SIDE: NUMBER + CALL BUTTON */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base">
                      {orderData.acceptedDriverDetails.driverPhone}
                    </span>

                    {/* CALL BUTTON */}
                    <a
                      href={`tel:${orderData.acceptedDriverDetails.driverPhone}`}
                      className="text-white p-1.5 sm:p-2 rounded-full shadow hover:bg-blue-300 active:scale-95 transition text-sm sm:text-base"
                    >
                      📞
                    </a>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-2">
              <span>🛡</span>
              Your order is nearby seller's store
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow p-4 sm:p-6">
            <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">Your delivery details</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              Details of your current order
            </p>

            <div className="space-y-3 sm:space-y-4 mt-4">
              <div className="flex gap-3">
                <span className="text-lg">📍</span>
                <p className="text-gray-700 dark:text-gray-300 leading-5 text-sm sm:text-base">
                  {orderData?.address?.address || "No address available"}
                </p>
              </div>

              <div className="flex gap-3">
                <span className="text-lg">📞</span>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {userProfile?.name || "No Name"}, {userProfile?.phone || "No Phone"}
                </p>
              </div>
            </div>

          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <div>
              <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">Need help?</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Chat with us for help</p>
            </div>
            <span className="text-xl text-gray-400 dark:text-gray-500">›</span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow p-4 sm:p-6">
            <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
              {loadingRestaurants ? "Loading restaurant..." : (storeName || "Super Store UP-NCR Noida Sector 63A")}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              Packing{" "}
              {orderData?.items?.length
                ? `${orderData.items.length} item${
                    orderData.items.length > 1 ? "s" : ""
                  }`
                : "items"}
              {Object.keys(restaurantNames).length > 1 && (
                <span className="ml-1">from {Object.keys(restaurantNames).length} restaurants</span>
              )}
            </p>

            {orderData?.items ? (
              <>
                {orderData.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4 border border-gray-200 dark:border-gray-600 p-2 sm:p-3 rounded-lg sm:rounded-xl"
                  >
                    <img
                      src={item.image}
                      className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {item.multiple} × {item.unit} • Qty {item.quantity}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">₹{item.price}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
                        MRP ₹{item.mrp}
                      </p>
                      {item.restaurentId && restaurantNames[item.restaurentId] && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          From: {restaurantNames[item.restaurentId]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-center py-6 text-sm sm:text-base">
                Loading your items...
              </p>
            )}

            <p
              onClick={() => setShowSummary(!showSummary)}
              className="mt-4 text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold text-center cursor-pointer"
            >
              {showSummary ? "Hide order summary" : "View order summary"}
            </p>

            {showSummary && orderData?.items && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 p-3 sm:p-4">
                <h2 className="font-bold text-base sm:text-lg mb-2 text-gray-900 dark:text-gray-100">Order Summary</h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="py-2 text-left font-medium text-gray-900 dark:text-gray-100">Product</th>
                        <th className="py-2 text-center font-medium text-gray-900 dark:text-gray-100">Qty</th>
                        <th className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.items.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-600">
                          <td className="py-2 sm:py-3 text-gray-800 dark:text-gray-200 truncate max-w-0">{item.name}</td>
                          <td className="text-center text-gray-800 dark:text-gray-200">{item.quantity}</td>
                          <td className="text-right text-gray-800 dark:text-gray-200">₹{item.price}</td>
                        </tr>
                      ))}

                      <tr>
                        <td className="py-2 sm:py-3 font-bold text-sm sm:text-lg text-gray-900 dark:text-gray-100">Total Bill</td>
                        <td></td>
                        <td className="text-right font-bold text-sm sm:text-lg text-gray-900 dark:text-gray-100">
                          ₹
                          {orderData.items.reduce(
                            (sum: number, it: any) =>
                              sum + it.price * it.quantity,
                            0
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}