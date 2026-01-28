"use client";



import AddAddressPanel from "@/app/components/dashboard/AddAddressPanel";
import EditAddressPanel from "@/app/components/dashboard/EditAddressPanel";


import Image from "next/image";
// REMOVED: import { getAuth, signOut } from "firebase/auth";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { openDB } from "idb";

/* COMPONENTS */
import OrdersComponent from "@/app/components/dashboard/order_history";
import AddressesComponent from "@/app/components/dashboard/addresses";
import EditProfileComponent from "@/app/components/dashboard/edit_profile";
import ReferralComponent from "@/app/components/dashboard/referrals";
import SupportComponent from "@/app/components/dashboard/support";


export default function ProfilePage() {
  const router = useRouter();
  // REMOVED: const auth = getAuth(app);
  const dbRef = getFirestore(app);

  const [uid, setUid] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const [activePage, setActivePage] = useState("orders");

//sheet
const [showAddPanel, setShowAddPanel] = useState(false);
const [editAddressId, setEditAddressId] = useState<string | null>(null);

const [toastMsg, setToastMsg] = useState("");
const [showToast, setShowToast] = useState(false);

const showSnack = (msg: string) => {
  setToastMsg(msg);
  setShowToast(true);

  setTimeout(() => setShowToast(false), 2500);
};


  useEffect(() => {
    const load = async () => {
      const idb = await openDB("QuickRunDB", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("user")) {
            db.createObjectStore("user");
          }
        },
      });

      // User ID loading logic remains, relying on idb/localStorage setup elsewhere
      const savedUid = await idb.get("user", "uid");
      const savedPhone = await idb.get("user", "phone");

      if (!savedUid) {
        router.push("/login");
        return;
      }

      setUid(savedUid);
      setProfilePhone(savedPhone || "");

      const snap = await getDoc(doc(dbRef, "Customer", savedUid));
      if (snap.exists()) {
        setProfileName(snap.data()?.name || "");
      }
    };

    load();
  }, []);

  // REFACTORED LOGOUT: Removed signOut(auth)
  const handleLogout = async () => {
    try {
      // 1. Clear session storage
      localStorage.clear();

      // 2. Clear IndexedDB
      const idb = await openDB("QuickRunDB", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("user")) {
            db.createObjectStore("user");
          }
        },
      });
      await idb.clear("user");

      // 3. Redirect (Simulating the end of session)
      router.push("/");
      setTimeout(() => (window.location.href = "/"), 300);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "orders":
        return <OrdersComponent />;
      case "support":
        return <SupportComponent />;
      case "referrals":
        return <ReferralComponent />;
case "addresses":
  return (
    <AddressesComponent
      onAdd={() => setShowAddPanel(true)}
      onEdit={(id: string) => setEditAddressId(id)}
    />
  );

      case "profile":
        return (
          <EditProfileComponent
            phoneFromProfile={profilePhone}
            onProfileUpdated={(updated: any) => {
              if (updated.name) setProfileName(updated.name);
              if (updated.phone) setProfilePhone(updated.phone);
            }}
          />
        );

      default:
        return <OrdersComponent />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-800 flex justify-center py-5 md:py-10 relative">
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[90%] max-w-[360px]">
            <p className="font-semibold text-lg text-center text-gray-900 dark:text-gray-100">
              Are you sure you want to logout?
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="flex-1 py-2 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full md:w-[92%] max-w-[1300px] bg-white dark:bg-gray-800 rounded-none md:rounded-3xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-[350px] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-6 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-2xl font-bold text-white shadow-md">
              {profileName ? profileName[0].toUpperCase() : "U"}
            </div>

            <div>
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{profileName || "User"}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profilePhone || "---"}</p>
            </div>
          </div>

          {/* MOBILE NAV TABS */}
          <div className="flex md:hidden overflow-x-auto gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700">
            {[
              { key: "orders", label: "Orders", icon: "🧾" },
              { key: "support", label: "Support", icon: "🎧" },
              { key: "referrals", label: "Referrals", icon: "🎁" },
              { key: "addresses", label: "Addresses", icon: "📍" },
              { key: "profile", label: "Profile", icon: "👤" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap text-sm ${
                  activePage === item.key
                    ? "bg-green-600 text-white"
                    : "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-2 hidden md:block">
            <SidebarItem
              label="Orders"
              icon="🧾"
              onClick={() => setActivePage("orders")}
            />
            <SidebarItem
              label="Customer Support"
              icon="🎧"
              onClick={() => setActivePage("support")}
            />
            <SidebarItem
              label="Manage Referrals"
              icon="🎁"
              onClick={() => setActivePage("referrals")}
            />
            <SidebarItem
              label="Addresses"
              icon="📍"
              onClick={() => setActivePage("addresses")}
            />
            <SidebarItem
              label="Profile"
              icon="👤"
              onClick={() => setActivePage("profile")}
            />
          </div>

          <div className="mt-8 px-6 hidden md:block">
            <button
              onClick={() => setShowLogoutPopup(true)}
              className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 py-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              ⏏ Log Out
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 md:p-0 flex justify-start items-start">

          {renderPage()}
          {showAddPanel && (
  <AddAddressPanel
    onClose={() => setShowAddPanel(false)}
    onSaved={() => showSnack("Address Saved Successfully")}
  />
)}

{editAddressId && (
  <EditAddressPanel
    id={editAddressId}
    onClose={() => setEditAddressId(null)}
    onSaved={() => showSnack("Address Updated Successfully")}
  />
)}
    {showToast && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-[9999]">
        {toastMsg}
      </div>
    )}
        </div>
      </div>
    </div>
  );
}

/* SIDEBAR ITEM */
function SidebarItem({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full px-5 py-3 flex items-center justify-between text-sm text-gray-800 dark:text-gray-200
        rounded-2xl mx-4 relative overflow-hidden transition-all
      "
    >
      <span className="absolute inset-0 bg-green-50 dark:bg-green-900/20 opacity-0 hover:opacity-100 transition"></span>
      <span className="absolute inset-0 rounded-2xl transition pointer-events-none"></span>

      <div className="flex items-center gap-3 relative z-10">
        <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-base">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>

      <span className="text-gray-400 dark:text-gray-500 text-xs relative z-10">›</span>
    </button>
  );
}