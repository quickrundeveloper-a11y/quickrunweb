"use client";

export default function ReturnPolicyPage() {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-800 flex justify-center py-10">
      <div className="w-[92%] max-w-[1100px] bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-10 border border-gray-200 dark:border-gray-700">

        {/* HEADER */}
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          QuickRun – Return & Refund Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Last Updated: 12/11/25</p>

        <div className="h-px bg-gray-200 dark:bg-gray-600 mb-8"></div>

        {/* CONTENT */}
        <div className="space-y-6 text-gray-800 dark:text-gray-200 leading-relaxed">
          
          <p>
            This Return and Refund Policy explains how QuickRun handles order 
            issues, including requests for refunds, credits, or re-deliveries. 
            This policy is part of our Terms and Conditions.
          </p>

          {/* SECTION 1 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">1. Our Policy on Returns</h2>
          <p>
            Due to the perishable nature of food and grocery items, we do not 
            accept returns once items have been delivered. Please do not attempt 
            to return items to the Delivery Partner. Instead, refer to the refund 
            process below.
          </p>

          {/* SECTION 2 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">2. Refund Eligibility</h2>
          <p>You may be eligible for a refund if:</p>

          <ul className="list-disc ml-6 space-y-1">
            <li><strong className="text-gray-900 dark:text-gray-100">Order Not Delivered:</strong> You paid for an order that never arrived.</li>
            <li><strong className="text-gray-900 dark:text-gray-100">Incorrect Items:</strong> Items received differ significantly from what was ordered.</li>
            <li><strong className="text-gray-900 dark:text-gray-100">Damaged or Spoiled Items:</strong> Items arrived spoiled, damaged, or expired.</li>
            <li><strong className="text-gray-900 dark:text-gray-100">Missing Items:</strong> Certain items from your order are missing.</li>
          </ul>

          <p className="font-semibold text-gray-700 dark:text-gray-300">
            Note: Refunds are not given for personal taste preferences.
          </p>

          {/* SECTION 3 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">3. How to Request a Refund</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Go to the "Help" section in the QuickRun App.</li>
            <li>Submit your complaint within 24 hours of delivery.</li>
            <li>Provide your order number and clear photos of the issue.</li>
          </ul>

          {/* SECTION 4 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">4. Refund Processing</h2>
          <p>Refund process steps:</p>

          <ul className="list-disc ml-6 space-y-1">
            <li><strong className="text-gray-900 dark:text-gray-100">Review:</strong> We'll verify your request and supporting evidence.</li>
            <li>
              <strong className="text-gray-900 dark:text-gray-100">Processing:</strong> Approved refunds will be issued either:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>As a credit to your original payment method, or</li>
                <li>As QuickRun wallet credit for a future order.</li>
              </ul>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-100">Timeline:</strong>  
              <br />• 5–10 business days for bank/card refunds  
              <br />• Instant for QuickRun wallet credits
            </li>
          </ul>

          {/* SECTION 5 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">5. Contact Us</h2>
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