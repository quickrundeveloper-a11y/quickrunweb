"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CoordsType {
  lat: number | null;
  lng: number | null;
}

interface AddressType {
  full: string;
  short: string;
}

interface LocationContextType {
  coords: CoordsType;
  setCoords: (value: CoordsType) => void;
  address: AddressType;
  setAddress: (value: AddressType) => void;
  hasLocation: boolean;
  setHasLocation: (value: boolean) => void;
  loadingLocation: boolean;
  detectAndSetLocation: () => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<CoordsType>({
    lat: null,
    lng: null,
  });

  const [address, setAddress] = useState<AddressType>({
    full: "",
    short: "",
  });

  const [hasLocation, setHasLocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // LOAD SAVED LOCATION ONCE
  useEffect(() => {
    const saved = localStorage.getItem("qr_saved_location");
    if (saved) {
      const loc = JSON.parse(saved);

      console.log("📌 (Provider) Loaded saved:", loc);

      setCoords({ lat: loc.lat, lng: loc.lng });
      setAddress({ short: loc.short, full: loc.full });
      setHasLocation(Boolean(loc.lat && loc.lng));
    }
  }, []);

  useEffect(() => {
    if (coords.lat && coords.lng) {
      setHasLocation(true);
    }
  }, [coords.lat, coords.lng]);

  function detectAndSetLocation() {
    if (!navigator.geolocation) {
      setLoadingLocation(false);
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        setCoords({ lat: latitude, lng: longitude });

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        )
          .then((res) => res.json())
          .then((data) => {
            const place =
              data?.address?.suburb ||
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              data?.display_name ||
              "Unknown Location";

            const full = data?.display_name || "";

            localStorage.setItem(
              "qr_saved_location",
              JSON.stringify({ lat: latitude, lng: longitude, short: place, full })
            );

            setAddress({ short: place, full });
            setHasLocation(true);
          })
          .catch(() => {})
          .finally(() => {
            setLoadingLocation(false);
          });
      },
      () => {
        console.warn("Unable to fetch location");
        setLoadingLocation(false);
      }
    );
  }

  return (
    <LocationContext.Provider
      value={{
        coords,
        setCoords,
        address,
        setAddress,
        hasLocation,
        setHasLocation,
        loadingLocation,
        detectAndSetLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationData() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocationData must be used inside LocationProvider");
  }
  return ctx;
}
