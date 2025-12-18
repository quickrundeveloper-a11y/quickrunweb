"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditAddressPanel({ id, onClose, onSaved }: any) {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    building: "",
    floor: "",
    tower: "",
    landmark: "",
    type: "Home",
    isFavourite: false,

    lat: 28.628,
    lng: 77.3649,
  });

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const mapRef = useRef<any>(null);
  const pinRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // -------------------------------------------------------
  // LOAD EXISTING ADDRESS (TWILIO UID)
  // -------------------------------------------------------
  useEffect(() => {
    const uid = localStorage.getItem("currentUser");
    if (!uid || !id) return;

    const load = async () => {
      try {
        const ref = doc(db, "Customer", uid, "addresses", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const d: any = snap.data();

          setForm((prev) => ({
            ...prev,
            name: d.name || "",
            phone: d.phone || "",
            address: d.address || "",
            building: d.building || "",
            floor: d.floor || "",
            tower: d.tower || "",
            landmark: d.landmark || "",
            type: d.type || "Home",
            isFavourite: d.isFavourite || false,
            lat: d.lat || prev.lat,
            lng: d.lng || prev.lng,
          }));

          setQuery(d.address || "");
        }

        setLoading(false);
      } catch (e) {
        console.log("Load error:", e);
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // -------------------------------------------------------
  // FORMAT ADDRESS
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // INIT MAP
  // -------------------------------------------------------
  const initMap = (lat: number, lng: number) => {
    if (!window.google) return;

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(
        document.getElementById("edit-map")!,
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

        const full = (await fetchAddressFromCoords(lat, lng)) as string;

        setForm((prev) => ({
          ...prev,
          lat: newLat,
          lng: newLng,
          address: full,
        }));

        setQuery(full);
      });
    }
  };

  // -------------------------------------------------------
  // UPDATE MAP LOCATION
  // -------------------------------------------------------
  const updateMapLocation = async (lat: number, lng: number) => {
    mapRef.current?.panTo({ lat, lng });
    pinRef.current?.setPosition({ lat, lng });

    const full = (await fetchAddressFromCoords(lat, lng)) as string;

    setForm((prev) => ({
      ...prev,
      lat,
      lng,
      address: full,
    }));

    setQuery(full);
  };

  // -------------------------------------------------------
  // USE CURRENT LOCATION
  // -------------------------------------------------------
  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      updateMapLocation(pos.coords.latitude, pos.coords.longitude);
    });
  };

  // -------------------------------------------------------
  // SEARCH INPUT
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // SELECT SUGGESTION
  // -------------------------------------------------------
  const handleSelectSuggestion = (placeId: string, desc: string) => {
    setQuery(desc);
    setSuggestions([]);

    geocoderRef.current.geocode(
      { placeId },
      async (results: any, status: any) => {
        if (status === "OK" && results?.length > 0) {
          const loc = results[0].geometry.location;
          updateMapLocation(loc.lat(), loc.lng());
        }
      }
    );
  };

  // -------------------------------------------------------
  // INIT GOOGLE JS
  // -------------------------------------------------------
  useEffect(() => {
    if (loading) return;

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
  }, [loading]);

  // -------------------------------------------------------
  // SAVE (TWILIO AUTH)
  // -------------------------------------------------------
  const save = async () => {
    const uid = localStorage.getItem("currentUser"); // ⭐ No Firebase Auth

    if (!uid) return;

    const ref = doc(db, "Customer", uid, "addresses", id);

    await updateDoc(ref, {
      ...form,
      lat: form.lat,
      lng: form.lng,
    });

    onSaved?.();
    onClose();
  };

  // -------------------------------------------------------
  // LOADING UI
  // -------------------------------------------------------
  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-end bg-black/30 z-[999]">
        <div className="w-[420px] p-6 bg-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />

      <div className="fixed inset-0 flex justify-end bg-black/30 z-[999]">

        <div className="w-[420px] bg-white h-full p-6 shadow-xl animate-slideLeft overflow-y-auto">

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black mb-4"
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-4">Edit Address</h2>

          {/* SEARCH */}
          <input
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Search location..."
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
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
          >
            📍 Use Current Location
          </button>

          {/* MAP */}
          <div id="edit-map" className="w-full h-60 rounded-lg border mt-3" />

          {/* FORM */}
          {renderInput("Full Name", "name", form, setForm)}
          {renderInput("Phone Number", "phone", form, setForm)}
          {renderTextArea("Full Address", "address", form, setForm)}
          {renderInput("Building", "building", form, setForm)}
          {renderInput("Floor", "floor", form, setForm)}
          {renderInput("Tower", "tower", form, setForm)}
          {renderInput("Landmark", "landmark", form, setForm)}

          {/* TYPE */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Address Type</label>
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
            Update Address
          </button>
        </div>
      </div>
    </>
  );
}

/*************** INPUT HELPERS ***************/
const renderInput = (label: string, name: string, form: any, setForm: any) => (
  <div className="mt-3">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      name={name}
      value={form[name]}
      onChange={(e) =>
        setForm((p: any) => ({ ...p, [name]: e.target.value }))
      }
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
      onChange={(e) =>
        setForm((p: any) => ({ ...p, [name]: e.target.value }))
      }
      className="mt-1 p-3 w-full border rounded-lg"
      rows={3}
    />
  </div>
);
