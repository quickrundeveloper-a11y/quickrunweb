"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function AddressesComponent({ onAdd, onEdit }: any) {

  const [user, setUser] = useState<string | null>(null);
  const [favAddresses, setFavAddresses] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ⭐ LOAD USER FROM TWILIO AUTH (localStorage)
  useEffect(() => {
    const userId = localStorage.getItem("currentUser");
    setUser(userId);
  }, []);

  // ⭐ FETCH ADDRESS LIST
  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "Customer", user, "addresses");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setFavAddresses(list.filter((a: any) => a.isFavourite === true));
      setSavedAddresses(list.filter((a: any) => !a.isFavourite));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // ⭐ SET FAVOURITE ADDRESS (ONLY ONE CAN BE TRUE)
  const setFavourite = async (id: string) => {
    if (!user) return;

    const all = [...favAddresses, ...savedAddresses];

    for (let addr of all) {
      const ref = doc(db, "Customer", user, "addresses", addr.id);
      await updateDoc(ref, { isFavourite: addr.id === id });
    }
  };

  return (
    <div className="w-full px-6 py-4">

      <div className="w-full">


        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Select Delivery Location
          </h1>

          <button
            onClick={onAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-xl"
          >
            + Add
          </button>
        </div>

        {/* LOGIN CHECK */}
        {!user && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
            Please login to view saved addresses.
          </div>
        )}

        {/* LOADING */}
        {loading && user && (
          <div className="bg-white p-6 rounded-2xl border text-center">
            Loading addresses...
          </div>
        )}

        {/* ⭐ FAVOURITE SECTION */}
        {user && favAddresses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              ⭐ Favourite Addresses
            </h2>

            <div className="flex flex-col gap-4">
              {favAddresses.map((address: any) => (
                <div
                  key={address.id}
                  className="bg-[#f6fff7] border border-green-300 rounded-2xl p-5 flex gap-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">
                    🏠
                  </div>

                  <div className="flex-1">

                    {/* TOP BAR */}
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold text-gray-800">
                        {address.type || "Home"}
                      </div>

                      {/* EDIT BUTTON */}
                      <button
                        onClick={() => onEdit(address.id)}
                        className="text-blue-600 text-sm"
                      >
                        Edit
                      </button>
                    </div>

                    {/* ADDRESS LINES */}
                    <p className="text-gray-600 mt-1">{address.address}</p>
                    <p className="text-gray-500 text-sm">
                      Phone: {address.phone || "N/A"}
                    </p>

                    {/* SET AS FAVOURITE */}
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="radio"
                        name="favourite"
                        checked={address.isFavourite}
                        onChange={() => setFavourite(address.id)}
                      />
                      <span>Favourite</span>
                    </label>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⭐ SAVED ADDRESSES */}
        {user && savedAddresses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Your Saved Addresses
            </h2>

            <div className="flex flex-col gap-4">
              {savedAddresses.map((address: any) => (
                <div
                  key={address.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="w-12 h-12 bg-gray-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">
                    🏠
                  </div>

                  <div className="flex-1">

                    {/* TOP BAR */}
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold text-gray-800">
                        {address.type || "Home"}
                      </div>

                      <button
                        onClick={() => onEdit(address.id)}
                        className="text-blue-600 text-sm"
                      >
                        Edit
                      </button>
                    </div>

                    {/* ADDRESS */}
                    <p className="text-gray-600 mt-1">{address.address}</p>
                    <p className="text-gray-500 text-sm">
                      Phone: {address.phone}
                    </p>

                    {/* SET FAVOURITE */}
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="radio"
                        name="favourite"
                        checked={address.isFavourite}
                        onChange={() => setFavourite(address.id)}
                      />
                      <span>Set Favourite</span>
                    </label>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {user &&
          !loading &&
          favAddresses.length === 0 &&
          savedAddresses.length === 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border text-center mt-5">
              No saved addresses found.
            </div>
          )}
      </div>
    </div>
  );
}
