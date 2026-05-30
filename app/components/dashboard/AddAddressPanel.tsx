"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function AddAddressPanel({ onClose }: any) {
  console.log("AddAddressPanel mounted!");
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    building: "",
    floor: "",
    tower: "",
    landmark: "",
    type: "Home",

    lat: 28.628,
    lng: 77.3649,
  });

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const mapRef = useRef<any>(null);
  const pinRef = useRef<any>(null);

  const autocompleteServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [open, setOpen] = useState(true);
  console.log("AddAddressPanel open state initial:", open);

useEffect(() => {
  console.log("AddAddressPanel useEffect: setting open to true");
  setOpen(true);
}, []);

useEffect(() => {
  console.log("AddAddressPanel open state changed to:", open);
}, [open]);


  // --------------------------
  // LOAD GOOGLE SERVICES
  // --------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.google?.maps) {
        autocompleteServiceRef.current =
          new window.google.maps.places.AutocompleteService();

        geocoderRef.current = new window.google.maps.Geocoder();

        initMap(form.lat, form.lng);
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // --------------------------
  // FETCH FULL ADDRESS
  // --------------------------
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    return new Promise((resolve) => {
      if (!geocoderRef.current) return resolve("");

      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results: any, status: any) => {
          if (status !== "OK" || !results?.length) return resolve("");

          let raw = results[0].formatted_address;

          raw = raw
            .replace(/\b[A-Z]-\d+\b/gi, "")
            .replace(/Block\s+[A-Z0-9]+/gi, "")
            .replace(/Tower\s+[A-Z0-9]+/gi, "")
            .trim();

          resolve(raw);
        }
      );
    });
  };

  const handleClose = () => {
  setOpen(false);           // slide-out
  setTimeout(() => {
    if (onClose) {
      onClose();              // actual close after animation
    }
  }, 300);
};


  // --------------------------
  // INIT MAP
  // --------------------------
  const initMap = (lat: number, lng: number) => {
    if (typeof window === "undefined" || !window.google) return;

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(
        document.getElementById("address-map")!,
        {
          center: { lat, lng },
          zoom: 16,
          disableDefaultUI: true,
        }
      );
    }

    if (!pinRef.current) {
      pinRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        draggable: true,
      });

      pinRef.current.addListener("dragend", async () => {
        const pos = pinRef.current.getPosition();
        const newLat = pos.lat();
        const newLng = pos.lng();

        const full = (await fetchAddressFromCoords(newLat, newLng)) as string;


        setForm((prev) => ({
          ...prev,
          lat: newLat,
          lng: newLng,
          address: full,
        }));
      });
    }
  };

  // --------------------------
  // UPDATE MAP LOCATION
  // --------------------------
  const updateMapLocation = async (lat: number, lng: number) => {
    if (!mapRef.current) return;

    mapRef.current.panTo({ lat, lng });
    pinRef.current.setPosition({ lat, lng });
    

    const full = (await fetchAddressFromCoords(lat, lng)) as string;


    setForm((prev) => ({
      ...prev,
      lat,
      lng,
      address: full,
    }));
  };

  // --------------------------
  // CURRENT LOCATION
  // --------------------------
  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      updateMapLocation(lat, lng);
    });
  };

  // --------------------------
  // SEARCH CHANGE
  // --------------------------
  const onSearchChange = (value: string) => {
    setQuery(value);

    if (!value || !autocompleteServiceRef.current) {
      setSuggestions([]);
      return;
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: "in" },
      },
      (preds: any[]) => {
        setSuggestions(preds || []);
      }
    );
  };

  // --------------------------
  // SELECT SUGGESTION
  // --------------------------
  const handleSelectSuggestion = (placeId: string, description: string) => {
    setQuery(description);
    setSuggestions([]);

    geocoderRef.current.geocode({ placeId }, async (results: any, status: any) => {
      if (status === "OK" && results?.length > 0) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();

        await updateMapLocation(lat, lng);
      }
    });
  };

  // --------------------------
  // SAVE IN FIRESTORE (TWILIO)
  // --------------------------
  const save = async () => {
    const uid = localStorage.getItem("currentUser"); // ⭐ Twilio Based Auth

    if (!uid) return;

    // ⭐ Validate required fields
    if (!form.name || !form.phone || !form.address) {
      alert("Please fill in Full Name, Phone Number, and Full Address!");
      return;
    }

    await addDoc(
      collection(db, "Customer", uid, "addresses"),
      {
        ...form,
        isFavourite: false,
        createdAt: serverTimestamp(),
      }
    );

    handleClose();
  };

  // --------------------------
  // UI
  // --------------------------
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />

      <div
  className={`fixed inset-0 flex justify-end z-[100010] transition-opacity duration-300 
  ${open ? "bg-black/30 opacity-100" : "bg-black/0 opacity-0"}`}
>


        <div
  className={`w-[420px] bg-white h-full p-6 shadow-xl overflow-y-auto
  transform transition-transform duration-300 
  ${open ? "translate-x-0" : "translate-x-full"}`}
>


<button
  onClick={handleClose}
  className="text-2xl text-gray-500 hover:text-black mb-4"
>
  ✕
</button>


          <h2 className="text-2xl font-semibold mb-4">Add New Address</h2>

          {/* SEARCH */}
          <input
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Search your location..."
          />

          {suggestions.length > 0 && (
            <div className="border rounded-lg max-h-56 overflow-auto mt-1 bg-white shadow">
              {suggestions.map((s) => (
                <div
                  key={s.place_id}
                  className="p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectSuggestion(s.place_id, s.description)}
                >
                  📍 {s.description}
                </div>
              ))}
            </div>
          )}

          {/* CURRENT LOCATION */}
          <button
            onClick={useCurrentLocation}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            📍 Use Current Location
          </button>

          {/* MAP */}
          <div id="address-map" className="w-full h-60 rounded-lg border mt-3" />

          {/* FORM FIELDS */}
          {renderInput("Full Name", "name", form, setForm)}
          {renderInput("Phone Number", "phone", form, setForm)}
          {renderTextArea("Full Address", "address", form, setForm)}
          {renderInput("Building", "building", form, setForm)}
          {renderInput("Floor", "floor", form, setForm)}
          {renderInput("Tower", "tower", form, setForm)}
          {renderInput("Landmark", "landmark", form, setForm)}

          {/* TYPE */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">
              Address Type
            </label>

            <div className="flex gap-4 mt-2">
              {["Home", "Office", "Hotel"].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={form.type === t}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value }))
                    }
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SAVE */}
<button
  onClick={save}
  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-medium"
>
  Save Address
</button>


        </div>
      </div>
    </>
  );
}

// --------------------------
// INPUT HELPERS
// --------------------------
const renderInput = (label: string, name: string, form: any, setForm: any) => (
  <div className="mt-3">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      name={name}
      value={form[name]}
      onChange={(e) => setForm((p: any) => ({ ...p, [name]: e.target.value }))}
      className="mt-1 p-3 w-full border rounded-lg"
    />
  </div>
);

const renderTextArea = (label: string, name: string, form: any, setForm: any) => (
  <div className="mt-3">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      value={form[name]}
      onChange={(e) => setForm((p: any) => ({ ...p, [name]: e.target.value }))}
      className="mt-1 p-3 w-full border rounded-lg"
      rows={3}
    />
  </div>
);
