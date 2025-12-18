"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
// 1. REMOVED: import { getAuth } from "firebase/auth";
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





  // 2. ADDED USERID STATE
  const [userId, setUserId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [eta, setEta] = useState<string | null>(null);

  // ⭐ Store name for header (loaded from Restaurent_shop)
  const [storeName, setStoreName] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<any>(null);  
const createDriverOverlayClass = () => {
  return class DriverOverlay extends window.google.maps.OverlayView {
    position: any;
    div: HTMLDivElement | null = null;
    rotation = 0;

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

      const img = document.createElement("img")
      img.src = "/img/driver_icon2.png"
      img.style.width = "100%"
      img.style.height = "100%"
      img.style.pointerEvents = "none"

      this.div.appendChild(img)
      this.getPanes().overlayLayer.appendChild(this.div)
    }

    draw() {
      const projection = this.getProjection()
      if (!projection) return

      const point = projection.fromLatLngToDivPixel(this.position)

      if (!point || !this.div) return

      this.div.style.left = `${point.x - 20}px`
      this.div.style.top = `${point.y - 20}px`

      // 🔥 ROTATION ALWAYS INSIDE DRAW
      this.div.style.transform = `rotate(${this.rotation}deg)`
    }

    setPosition(pos: any) {
      this.position = pos
      this.draw()
    }

    setRotation(deg: number) {
      this.rotation = deg
      this.draw()
    }

    onRemove() {
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
        (snap) => {
          if (!snap.empty) {
            const latest = snap.docs[snap.docs.length - 1];
            setOrderId(latest.id);
            setOrderData(latest.data());

          } else {
            setOrderId(null);
            setOrderData(null);
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

  const getNearestPointOnPath = (path: any[], pos: any) => {
    let nearest = path[0]
    let minDist = Infinity

    path.forEach((p: any) => {
      const d =
        window.google.maps.geometry.spherical.computeDistanceBetween(p, pos)
      if (d < minDist) {
        minDist = d
        nearest = p
      }
    })

    return nearest
  }


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





        // ⭐ NEW — FETCH ALL RESTAURANT STOPS IN ORDER
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

                // ⭐ Capture store name once for header
                if (!storeName) {
                  const nameFromDoc =
                    (data?.name as string | undefined) ||
                    (data?.storeName as string | undefined) ||
                    (data?.shopName as string | undefined) ||
                    null;
                  if (nameFromDoc) {
                    setStoreName(nameFromDoc);
                  }
                }

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
        }

        // ⭐ DRAW SIMPLE LINE FROM STORE → USER WHEN NO DRIVER ASSIGNED
        if (orderData.status === "grocerry_accepted") {
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

        // If driver location is available (order accepted and driver assigned)
        const driverLat = orderData?.acceptedDriverDetails?.driverLatLng?.lat;
        const driverLng = orderData?.acceptedDriverDetails?.driverLatLng?.lng;

        if (
          driverLat &&
          driverLng &&
          orderData?.address?.lat &&
          orderData?.address?.lng
        ) {
          const snapped = await snapDriverToRoad(
  Number(driverLat),
  Number(driverLng)
)

const driverLatNum = snapped.lat
const driverLngNum = snapped.lng

          const userLatNum = Number(orderData.address.lat);
          const userLngNum = Number(orderData.address.lng);

          // ⭐ ROAD-BASED POLYLINE USING GOOGLE DIRECTIONS API
          const directionsService = new window.google.maps.DirectionsService();
          

          (async () => {
            const restaurantStops = await fetchAllRestaurantStops();

            const routeOptions = {
              origin: { lat: driverLatNum, lng: driverLngNum },
              destination: { lat: userLatNum, lng: userLngNum },
              waypoints: restaurantStops.map((p) => ({
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




            const handleRoute = (result: any, status: any) => {
              if (status === "OK" && result) {
                const overviewPath = result.routes[0].overview_path;

                if (!window.customPolylines) window.customPolylines = [];
                window.customPolylines.forEach((pl) => pl.setMap(null));
                window.customPolylines = [];

                for (let i = 0; i < overviewPath.length - 1; i++) {
                  const p1 = overviewPath[i];
                  const p2 = overviewPath[i + 1];

                  const dist =
                    window.google.maps.geometry.spherical.computeDistanceBetween(
                      p1,
                      p2
                    );
                  const speed = dist / 5;

                  let color = "#48BBDB";
                  if (speed < 2) color = "#ff0000";
                  else if (speed < 4) color = "#ffa500";

                  const seg = new window.google.maps.Polyline({
                    path: [p1, p2],
                    strokeColor: color,
                    strokeWeight: 5,
                    map: map,
                  });

                  window.customPolylines.push(seg);
                }

                // ⭐ Compute FULL ETA: driver → all waypoints → customer
                const legs = result.routes[0].legs || [];
                if (legs.length > 0) {
                  const totalSeconds = legs.reduce(
                    (sum: number, l: any) =>
                      sum + (l?.duration?.value ?? 0),
                    0
                  );

                  // Convert to human‑readable minutes (rounded)
                  const totalMinutes = Math.max(
                    1,
                    Math.round(totalSeconds / 60)
                  );
                  setEta(`${totalMinutes} mins`);
                }

                if (orderData?.address?.lat && orderData?.address?.lng) {
                  const destLat = Number(orderData.address.lat);
                  const destLng = Number(orderData.address.lng);

                  new window.google.maps.Marker({
                    position: { lat: destLat, lng: destLng },
                    map,
                    zIndex: 999,
                    icon: {
                      url: "/img/customer_pin.png",
                      scaledSize: new window.google.maps.Size(25, 25),
                    },
                  });
                }

                const routeObj = result.routes[0];
                const polylinePath = routeObj.overview_path;

if (polylinePath && polylinePath.length > 1) {
  // 1️⃣ snap driver position to road
  const snappedPos = new window.google.maps.LatLng(
    driverLatNum,
    driverLngNum
  )

  // 2️⃣ nearest point on polyline
  const nearestPoint = getNearestPointOnPath(
    polylinePath,
    snappedPos
  )

  // 3️⃣ find index safely
  let currentIndex = polylinePath.findIndex(
    (p: any) =>
      Math.abs(p.lat() - nearestPoint.lat()) < 0.000001 &&
      Math.abs(p.lng() - nearestPoint.lng()) < 0.000001
  )

  if (currentIndex === -1) currentIndex = 0

  // 4️⃣ next point (direction)
  const nextPoint =
    polylinePath[currentIndex + 1] || polylinePath[currentIndex]

  // 5️⃣ heading calculation
  let heading =
    window.google.maps.geometry.spherical.computeHeading(
      nearestPoint,
      nextPoint
    )

  if (isNaN(heading)) heading = 0

  // 🔧 IMAGE OFFSET: base PNG points north, so rotate by +90°
  const IMAGE_OFFSET = 0
  const finalHeading = (heading + IMAGE_OFFSET + 360) % 360

  // 6️⃣ CREATE / UPDATE OVERLAY
  if (!driverOverlayRef.current) {
    const DriverOverlay = DriverOverlayClassRef.current
    driverOverlayRef.current = new DriverOverlay(nearestPoint)
    driverOverlayRef.current.setMap(map)
  } else {
    driverOverlayRef.current.setPosition(nearestPoint)
  }

  // 7️⃣ rotate PNG exactly along the route direction
  driverOverlayRef.current.setRotation(finalHeading)

}




              } else {
                console.log("Directions request failed:", status);
              }
            };

            // initial draw
            if (!routeDrawnRef.current) {
  routeDrawnRef.current = true
  directionsService.route(routeOptions, handleRoute)
}

          })();
        }
      }
    }, 200);

    return () => clearInterval(waitForGoogle);
  }, [orderData]);

  if (!userId) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please log in to track your order.</p>
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
    <div className="w-full min-h-screen bg-[#fafafa] pb-20">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
        strategy="afterInteractive"
      />

      <div className="max-w-3xl mx-auto pt-12">
        {/* MAP + HEADER CARD */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="px-6 pt-6 pb-9 text-center">
            <h1 className="text-2xl font-bold mt-1">Order is confirmed</h1>

 

            {orderId && <p className="text-gray-500 text-xs mt-1"></p>}
            {orderData?.status === "grocerry_accepted" ? (
              <p className="text-gray-600 text-sm mt-1">
                We'll assign a delivery partner as soon as your order is packed
              </p>
            ) : eta ? (
              <p className="text-gray-600 text-sm mt-1">
                Your order is arriving in {eta}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl mx-4 mb-6 overflow-hidden shadow-sm relative">
            <div ref={mapRef} className="w-full h-120" />

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
              className="absolute bottom-4 right-4 bg-white shadow-lg p-3 rounded-full border hover:bg-gray-100"
            >
              <MdMyLocation className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* LOWER SECTIONS */}
        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 text-3xl">🛵</span>
              {orderData?.status === "grocerry_accepted" ? (
                <p className="font-medium text-gray-800">
                  We'll assign a delivery partner as soon as your order is
                  packed
                </p>
              ) : eta ? (
                <p className="font-medium text-gray-800">
                  Your order is arriving in {eta}
                </p>
              ) : (
                <p className="font-medium text-gray-800">
                  We'll assign a delivery partner as soon as your order is
                  packed
                </p>
              )}
            </div>
{orderData?.acceptedDriverDetails && (
  <div className="mt-4 bg-white rounded-2xl px-4 py-4 shadow-sm">

    <p className="font-semibold text-gray-800 text-lg mb-3">
      Delivery Partner
    </p>

    <div className="flex items-center justify-between">

      {/* LEFT SIDE: NAME */}
      <div className="text-gray-700 font-medium text-base">
        {orderData.acceptedDriverDetails.driverName}
      </div>

      {/* RIGHT SIDE: NUMBER + CALL BUTTON */}
      <div className="flex items-center gap-3">
        <span className="text-gray-800 font-medium">
          {orderData.acceptedDriverDetails.driverPhone}
        </span>

        {/* CALL BUTTON */}
        <a
          href={`tel:${orderData.acceptedDriverDetails.driverPhone}`}
          className=" text-white p-2 rounded-full shadow hover:bg-blue-300 active:scale-95 transition"
        >
          📞
        </a>
      </div>
    </div>
  </div>
)}




            <p className="mt-4 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
              <span>🛡</span>
              Your order is nearby seller's store
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="font-semibold text-lg">Your delivery details</p>
            <p className="text-gray-500 text-sm">
              Details of your current order
            </p>

<div className="space-y-4 mt-4">
  <div className="flex gap-3">
    <span>📍</span>
    <p className="text-gray-700 leading-5">
      {orderData?.address?.address || "No address available"}
    </p>
  </div>

  <div className="flex gap-3">
    <span>📞</span>
    <p className="text-gray-700">
      {userProfile?.name || "No Name"}, {userProfile?.phone || "No Phone"}
    </p>
  </div>
</div>


          </div>

          <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-semibold text-lg">Need help?</p>
              <p className="text-gray-500 text-sm">Chat with us for help</p>
            </div>
            <span className="text-xl">›</span>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="font-semibold text-lg">
              {storeName || "Super Store UP-NCR Noida Sector 63A"}
            </p>
            <p className="text-gray-500 text-sm">
              Packing{" "}
              {orderData?.items?.length
                ? `${orderData.items.length} item${
                    orderData.items.length > 1 ? "s" : ""
                  }`
                : "items"}
            </p>

            {orderData?.items ? (
              <>
                {orderData.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="mt-4 flex items-center gap-4 border p-3 rounded-xl"
                  >
                    <img
                      src={item.image}
                      className="h-16 w-16 object-cover rounded-lg bg-gray-100"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.multiple} × {item.unit} • Qty {item.quantity}
                      </p>
                      <p className="text-sm text-gray-800">₹{item.price}</p>
                      <p className="text-xs text-gray-500 line-through">
                        MRP ₹{item.mrp}
                      </p>
                      {item.restaurentId && (
                        <p className="text-xs text-gray-600 mt-1"></p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-400 text-center py-6">
                Loading your items...
              </p>
            )}

            <p
              onClick={() => setShowSummary(!showSummary)}
              className="mt-4 text-green-600 text-sm font-semibold text-center cursor-pointer"
            >
              {showSummary ? "Hide order summary" : "View order summary"}
            </p>

            {showSummary && orderData?.items && (
              <div className="mt-4 bg-white rounded-xl border p-4">
                <h2 className="font-bold text-lg mb-2">Order Summary</h2>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Product</th>
                      <th className="py-2 text-center font-medium">Qty</th>
                      <th className="py-2 text-right font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.items.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{item.name}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-right">₹{item.price}</td>
                      </tr>
                    ))}

                    <tr>
                      <td className="py-3 font-bold text-lg">Total Bill</td>
                      <td></td>
                      <td className="text-right font-bold text-lg">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}