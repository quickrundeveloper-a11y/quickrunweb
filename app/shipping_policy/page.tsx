"use client";

export default function DeliveryPage() {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-800 flex justify-center py-10">
      <div className="w-[92%] max-w-[1100px] bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-10 border border-gray-200 dark:border-gray-700">

        {/* HEADER */}
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          QuickRun – Delivery Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Last Updated: 12/11/25</p>

        <div className="h-px bg-gray-200 dark:bg-gray-600 mb-8"></div>

        {/* CONTENT */}
        <div className="space-y-6 text-gray-800 dark:text-gray-200 leading-relaxed">

          <p>
            This Delivery Policy explains how QuickRun handles the delivery 
            of your food and grocery orders. This policy is part of our 
            Terms and Conditions.
          </p>

          {/* SECTION 1 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">1. Delivery Areas</h2>
          <p>
            QuickRun provides delivery services within specific zones in 
            Noida and nearby areas. We currently do not deliver outside 
            these regions.
          </p>

          {/* SECTION 2 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">2. Delivery Times</h2>
          <p>
            We strive to deliver your order "in minutes." Actual delivery 
            times depend on factors such as:
          </p>

          <ul className="list-disc ml-6 space-y-1">
            <li>Restaurant/store preparation time</li>
            <li>Traffic and weather conditions</li>
            <li>Order volume</li>
            <li>Delivery Partner availability</li>
          </ul>

          {/* SECTION 3 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">3. Delivery Process</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              <strong className="text-gray-900 dark:text-gray-100">Order Confirmation:</strong> Your order is confirmed 
              once the restaurant or store accepts it.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-100">Pickup:</strong> A Delivery Partner is assigned to 
              pick up your order.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-100">Delivery:</strong> The partner delivers the order to 
              your specified address.
            </li>
          </ul>

          {/* SECTION 4 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">4. Delivery Fees</h2>
          <p>
            Delivery fees vary based on your location, distance, and demand. 
            All applicable fees are displayed before checkout.
          </p>

          {/* SECTION 5 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">5. Order Handover</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong className="text-gray-900 dark:text-gray-100">Direct Delivery:</strong> Handed directly to you.</li>
            <li>
              <strong className="text-gray-900 dark:text-gray-100">Contactless Delivery:</strong> Order can be left at 
              your doorstep upon request.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-100">Age-Restricted Items:</strong> Valid ID is required 
              (e.g., tobacco products).
            </li>
          </ul>

          {/* SECTION 6 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">6. Customer Responsibilities</h2>
          <p>
            You must provide an accurate delivery address and be available to 
            receive the order at the estimated time.
          </p>

          {/* SECTION 7 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">7. Failed Deliveries</h2>
          <p>
            If our Delivery Partner is unable to reach you after multiple 
            attempts, your order may be canceled without refund.
          </p>

          {/* SECTION 8 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">8. Contact Us</h2>
          <ul className="list-disc ml-6">
            <li><strong className="text-gray-900 dark:text-gray-100">Address:</strong> Ithum Heights, Sector 62, Noida</li>
            <li><strong className="text-gray-900 dark:text-gray-100">Email:</strong> runquick113@gmail.com</li>
            <li><strong className="text-gray-900 dark:text-gray-100">Phone:</strong> 09876 87653</li>
          </ul>

        </div>

        {/* BACK BUTTON */}
        <div className="mt-12 flex justify-center">
          <a
            href="/"
            className="
              bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full text-lg font-semibold
              shadow-md transition-all
            "
          >
            ← Back to Home
          </a>
        </div>

      </div>
    </div>
  );
}