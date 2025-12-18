"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

// ⭐ FIXED PROPS TYPE
type EditProps = {
  // Removed uid: string;
  phoneFromProfile?: string;
  onProfileUpdated?: (data: any) => void;
};

export default function EditProfileComponent({
  phoneFromProfile,
  onProfileUpdated,
}: EditProps) {
  const db = getFirestore(app);

  // 1. ADDED USERID STATE AND LOCALSTORAGE LOAD
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    setUserId(localStorage.getItem("currentUser"));
  }, []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(phoneFromProfile || "");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [anniversary, setAnniversary] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Load existing profile data
  // 2. DEPENDS ON userId NOW
  useEffect(() => {
    if (!userId) {
      setLoading(false); // User is logged out
      return;
    }

    async function loadProfile() {
      try {
        // 3. UPDATED FIRESTORE PATH: uid -> userId
        const ref = doc(db, "Customer", userId as string);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          setName(data.name || "");
          setEmail(data.email || "");
          setGender(data.gender || "Male");
          setDob(data.dob || "");
          setAnniversary(data.anniversary || "");
          setPhone(phoneFromProfile || data.phone || "");
        } else {
          setPhone(phoneFromProfile || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setMessage("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId, db, phoneFromProfile]); // 4. UPDATED DEPENDENCY: uid -> userId

  // Sync phone if changed from parent
  useEffect(() => {
    if (phoneFromProfile) setPhone(phoneFromProfile);
  }, [phoneFromProfile]);

  // 🔹 Save Profile
  const handleSave = async () => {
    // 5. UPDATED USER CHECK: uid -> userId
    if (!userId) {
      setMessage("User not found. Please login again.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      // 6. UPDATED FIRESTORE PATH: uid -> userId
      const ref = doc(db, "Customer", userId);

      const payload = {
        name: name.trim(),
        phone,
        email: email.trim(),
        gender,
        dob,
        anniversary,
        updatedAt: new Date(),
      };

      await setDoc(ref, payload, { merge: true });

      setMessage("Profile updated successfully ✅");

      if (onProfileUpdated) {
        onProfileUpdated({
          name: payload.name,
          phone: payload.phone,
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-10 flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  // 7. Added logged out display state
  if (!userId) {
    return (
      <div className="w-full px-6 py-10 flex items-center justify-center">
        <p className="text-red-500 font-semibold">
          You must be logged in to edit your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-10">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Edit Profile
        </h1>

        {/* Avatar */}
        <div className="flex justify-center mb-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00b85c] to-[#7dff9c] flex items-center justify-center shadow-md">
            <span className="text-5xl font-bold text-white">
              {name ? name[0].toUpperCase() : "Q"}
            </span>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name */}
          <div>
            <label className="text-gray-500 text-sm">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-[#00b85c] transition"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="text-gray-500 text-sm">Mobile</label>
            <input
              type="text"
              value={phone}
              disabled
              className="w-full mt-2 p-4 rounded-2xl border border-gray-200 bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-500 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full mt-2 p-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-[#00b85c] transition"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-gray-500 text-sm">Gender</label>

            <div className="mt-2 relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full appearance-none p-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-[#00b85c] transition cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="w-5 h-5 text-gray-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* DOB */}
          <div>
            <label className="text-gray-500 text-sm">Date of Birth</label>
            <div className="mt-2 flex items-center bg-gray-50 p-4 rounded-2xl border border-gray-200 hover:bg-gray-100 transition">
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full outline-none bg-transparent"
              />
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          {/* Anniversary */}
          <div>
            <label className="text-gray-500 text-sm">Anniversary</label>
            <div className="mt-2 flex items-center bg-gray-50 p-4 rounded-2xl border border-gray-200 hover:bg-gray-100 transition">
              <input
                type="date"
                value={anniversary}
                onChange={(e) => setAnniversary(e.target.value)}
                className="w-full outline-none bg-transparent"
              />
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex flex-col items-center mt-12 gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="
              w-full md:w-64 
              bg-[#00b85c] text-white 
              text-lg font-semibold 
              py-4 rounded-full 
              shadow-md 
              hover:bg-[#009e4e] 
              transition
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {saving ? "Saving..." : "Save Data"}
          </button>

          {message && (
            <p className="text-sm text-gray-600 text-center">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}