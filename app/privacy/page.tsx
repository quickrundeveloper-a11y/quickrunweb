"use client";

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-screen bg-[#f5f7fa] flex justify-center py-10">
      <div className="w-[92%] max-w-[1100px] bg-white rounded-3xl shadow-lg p-10 border border-gray-200">

        {/* HEADER */}
        <h1 className="text-3xl font-extrabold text-gray-900">
          QuickRun – Privacy Policy
        </h1>
        <p className="text-gray-600 mb-6">Last Updated: 12/11/25</p>

        <div className="h-px bg-gray-200 mb-8"></div>

        {/* CONTENT */}
        <div className="space-y-6 text-gray-800 leading-relaxed">

          <p>
            Welcome to QuickRun. This Privacy Policy explains how QuickRun
            ("we," "us," or "our") collects, uses, shares, and protects
            information about you when you use our mobile application (the
            “App”), website (www.quickrunfast.com), and all related services
            (collectively, the “Service”).
          </p>

          <p>
            By using our Service, you agree to the collection and use of your
            information in accordance with this policy. This Privacy Policy is
            incorporated into our Terms and Conditions.
          </p>

          {/* 1. Information We Collect */}
          <h2 className="text-xl font-bold">1. Information We Collect</h2>
          <p>
            We collect several types of information to provide and improve our
            Service.
          </p>

          <h3 className="text-lg font-semibold mt-4">A. Information You Provide to Us</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              <strong>Account Information:</strong> Your name, email, phone
              number, and delivery address.
            </li>
            <li>
              <strong>Order Information:</strong> Details of items purchased,
              order history, and payment method.
            </li>
            <li>
              <strong>Communications:</strong> Any messages or support queries
              you send us.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4">B. Information We Collect Automatically</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              <strong>Location Data:</strong> GPS, Wi-Fi, and IP-based
              location for delivery and partner matching.
            </li>
            <li>
              <strong>Usage Information:</strong> Your actions, searches, and
              pages viewed.
            </li>
            <li>
              <strong>Device Information:</strong> Model, OS, identifiers, and
              network details.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4">C. Information from Third Parties</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              <strong>Payment Information:</strong> Handled securely by our
              payment processor; we receive only confirmation data.
            </li>
          </ul>

          {/* 2. How We Use Your Information */}
          <h2 className="text-xl font-bold mt-6">2. How We Use Your Information</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>To create and manage your account.</li>
            <li>To process and deliver your orders.</li>
            <li>To communicate updates and customer support.</li>
            <li>To improve features, performance, and user experience.</li>
            <li>To prevent fraud and comply with legal rules.</li>
          </ul>

          {/* 3. Sharing */}
          <h2 className="text-xl font-bold mt-6">3. How We Share Your Information</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              With restaurant/store Partners and Delivery Partners for order
              fulfillment.
            </li>
            <li>
              With third-party services (payments, analytics, hosting).
            </li>
            <li>
              With authorities if required by law.
            </li>
          </ul>

          {/* 4. Security */}
          <h2 className="text-xl font-bold mt-6">4. Data Security</h2>
          <p>
            We use appropriate security measures to protect your data. However,
            no online service can guarantee absolute security.
          </p>

          {/* 5. Rights */}
          <h2 className="text-xl font-bold mt-6">5. Your Rights and Choices</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Update account information anytime in the App.</li>
            <li>Enable/disable location access in device settings.</li>
            <li>Opt out of marketing using the “unsubscribe” option.</li>
          </ul>

          {/* 6. Children */}
          <h2 className="text-xl font-bold mt-6">6. Children's Privacy</h2>
          <p>
            QuickRun is not intended for users under 18. We do not knowingly
            collect data from minors. If found, it will be deleted immediately.
          </p>

          {/* 7. Changes */}
          <h2 className="text-xl font-bold mt-6">7. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically. The new “Last
            Updated” date will reflect the changes.
          </p>

          {/* 8. Contact */}
          <h2 className="text-xl font-bold mt-6">8. Contact Us</h2>
          <ul className="list-disc ml-6">
            <li><strong>Address:</strong> Ithum Heights, Sector 62, Noida</li>
            <li><strong>Email:</strong> runquick113@gmail.com</li>
            <li><strong>Phone:</strong> 09876 87653</li>
          </ul>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-12 flex justify-center">
          <a
            href="/"
            className="
              bg-[#00b85c] text-white px-6 py-3 rounded-full text-lg font-semibold
              shadow-md hover:bg-[#009a4e] transition-all
            "
          >
            ← Back to Home
          </a>
        </div>

      </div>
    </div>
  );
}
