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

  return (
    <LocationContext.Provider
      value={{
        coords,
        setCoords,
        address,
        setAddress,
        hasLocation,
        setHasLocation,
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
