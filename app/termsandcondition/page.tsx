"use client";

export default function TermsPage() {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-800 flex justify-center py-10">
      <div className="w-[92%] max-w-[1100px] bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-10 border border-gray-200 dark:border-gray-700">

        {/* HEADER */}
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          QuickRun – Terms and Conditions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Last Updated: 12/11/25</p>

        <div className="h-px bg-gray-200 dark:bg-gray-600 mb-8"></div>

        {/* CONTENT */}
        <div className="space-y-6 text-gray-800 dark:text-gray-200 leading-relaxed">

          <p>
            Welcome to QuickRun! These Terms and Conditions ("Terms") govern
            your use of the QuickRun mobile application (the "App"), our
            website (www.quickrunfast.com), and all related services
            (collectively, the "Service") provided by QuickRun ("QuickRun,"
            "we," "us," or "our").
          </p>

          <p>
            By creating an account, accessing, or using our Service, you agree
            to be bound by these Terms and our Privacy Policy. If you do not
            agree to these Terms, do not use our Service.
          </p>

          <p className="font-semibold text-red-600 dark:text-red-400">
            PLEASE READ THESE TERMS CAREFULLY. THEY CONTAIN IMPORTANT
            INFORMATION REGARDING YOUR LEGAL RIGHTS, INCLUDING A MANDATORY
            ARBITRATION CLAUSE AND A CLASS ACTION WAIVER.
          </p>

          {/* SECTION 1 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">1. The QuickRun Service</h2>
          <p>
            QuickRun is a technology platform that connects you (“User”) with
            independent third-party restaurants, grocery stores, and other
            retailers (“Partners”), as well as independent delivery contractors
            (“Delivery Partners”).
          </p>

          <p>
            You may order items (“Items”) through the App. QuickRun does not
            prepare food or groceries. All Items are prepared and sold by our
            Partners.
          </p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">
            YOU ACKNOWLEDGE THAT QUICKRUN IS NOT RESPONSIBLE FOR THE QUALITY,
            SAFETY, OR PREPARATION OF ITEMS.
          </p>

          {/* SECTION 2 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">2. User Accounts</h2>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Eligibility:</p>
          <p>You must be at least 18 years old to use the Service.</p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Account Creation:</p>
          <p>You agree to provide accurate and updated information.</p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Account Security:</p>
          <p>You are responsible for all activities under your account.</p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Prohibited Accounts:</p>
          <p>
            You may not create multiple accounts or fraudulent accounts.
            QuickRun may suspend accounts violating its Terms.
          </p>

          {/* SECTION 3 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">3. Orders and Payment</h2>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Placing Orders:</p>
          <p>
            Partners may accept or reject your order. You will receive a
            confirmation once accepted.
          </p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Pricing:</p>
          <p>
            Prices are shown in the App and set by Partners. Prices may vary
            from in-store rates.
          </p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Fees You May Pay:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Item subtotal</li>
            <li>Delivery Fee</li>
            <li>Service/Platform fee</li>
            <li>Taxes</li>
            <li>Optional tips</li>
          </ul>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Payment:</p>
          <p>
            Payments are processed by a secure third-party processor. By
            ordering, you authorize the charge.
          </p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Item Unavailability:</p>
          <p>
            If an item is unavailable, QuickRun may substitute or refund as
            appropriate.
          </p>

          {/* SECTION 4 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">4. Delivery</h2>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Delivery Times:</p>
          <p>Delivery time is an estimate, not a guarantee.</p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Delivery Address:</p>
          <p>You must provide an accurate and complete delivery address.</p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Hand-off:</p>
          <p>
            If you are unavailable, items may be left safely or disposed of.
          </p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Contactless Delivery:</p>
          <p>
            QuickRun is not responsible for theft or damage after drop-off.
          </p>

          {/* SECTION 5 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">5. Cancellations and Refunds</h2>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Your Cancellations:</p>
          <p>You may cancel before the Partner accepts your order.</p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Our Cancellations:</p>
          <p>QuickRun may cancel orders due to fraud, errors, or unavailability.</p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Refunds:</p>
          <p>
            Refunds may be issued for legitimate issues like incorrect or missing items.
          </p>

          {/* SECTION 6 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">6. Age-Restricted Items</h2>
          <p>
            You must be of legal age to order restricted products and provide
            valid ID upon delivery.
          </p>

          {/* SECTION 7 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">7. Disclaimers and Limitation of Liability</h2>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Food Safety:</p>
          <p>
            Partners are responsible for allergen and food safety information.
            QuickRun cannot guarantee allergen-free items.
          </p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Service "As-Is":</p>
          <p>
            QuickRun does not guarantee uninterrupted or error-free service.
          </p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Limitation of Liability:</p>
          <p>
            QuickRun is not liable for indirect or consequential damages. Our
            total liability is limited to fees paid in the past 6 months.
          </p>

          {/* SECTION 8 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">8. Prohibited Conduct</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Illegal use of the Service</li>
            <li>Harassment or fraud</li>
            <li>Fake orders or refunds</li>
            <li>Reverse engineering or hacking</li>
            <li>Reselling purchased items</li>
          </ul>

          {/* SECTION 9 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">9. Intellectual Property</h2>
          <p>
            All trademarks, logos, graphics, and content belong exclusively to
            QuickRun.
          </p>

          {/* SECTION 10 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">10. Dispute Resolution</h2>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Governing Law:</p>
          <p>These Terms are governed by the laws of India (Uttar Pradesh).</p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Mandatory Arbitration:</p>
          <p>All disputes must be resolved through binding arbitration.</p>

          <p className="font-semibold text-gray-900 dark:text-gray-100">Class Action Waiver:</p>
          <p>You agree to individual dispute resolution only.</p>

          {/* SECTION 11 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">11. Changes to These Terms</h2>
          <p>
            QuickRun may modify these Terms. Continued use means acceptance of
            updated terms.
          </p>

          {/* SECTION 12 */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">12. Contact Us</h2>

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
