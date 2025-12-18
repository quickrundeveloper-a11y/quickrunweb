"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const statesOfIndia = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
];
// app/page.js
import { Inter, Playfair_Display, Libre_Baskerville } from 'next/font/google';
import { FaSearch, FaWhatsapp, FaChevronDown, FaPhone, FaArrowRight, FaCheck, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaChartLine } from 'react-icons/fa';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic']
});
const libre = Libre_Baskerville({ 
  subsets: ['latin'],
  weight: ['400', '700']
});

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [enqName, setEnqName] = useState("");
  const [enqPhone, setEnqPhone] = useState("");
  const [enqState, setEnqState] = useState("");

  const submitEnquiry = async () => {
    if (!enqName || !enqPhone || !enqState) {
      alert("Please fill all fields");
      return;
    }

    await addDoc(collection(db, "franchiseEnquiries"), {
      name: enqName,
      phone: enqPhone,
      state: enqState,
      createdAt: new Date(),
    });

    alert("Submitted successfully!");
    setShowModal(false);
    setEnqName("");
    setEnqPhone("");
    setEnqState("");
  };
  return (
    <>
      {/* ENQUIRY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">

            <h2 className="text-2xl font-black mb-6 text-center">Franchise Enquiry</h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Full Name"
                value={enqName}
                onChange={(e) => setEnqName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
              />

              <input
                type="number"
                placeholder="Phone Number"
                value={enqPhone}
                onChange={(e) => setEnqPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
              />

              <select
                value={enqState}
                onChange={(e) => setEnqState(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
              >
                <option>Select Your State</option>
                {statesOfIndia.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <button
                onClick={submitEnquiry}
                className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-900 transition-all"
              >
                Submit Enquiry
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 left-6 z-50 bg-black text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group cursor-pointer">
        <FaWhatsapp size={24} className="group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat with us
        </div>
      </div>

      {/* Hero Section */}
      <section className=" bg-gradient-to-b from-white to-gray-50 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <div className="inline-block bg-gray-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                FRANCHISE OPPORTUNITY
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight">
                <span className="block">INVEST IN</span>
                <span className="block text-gray-400">QUICKRUN</span>
                <span className="block">FRANCHISE</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl">
                A sophisticated instant grocery and food delivery franchise with proven logistics, 
                advanced technology integration, and scalable micro-fulfillment hubs designed for 
             market expansion.
              </p>
              
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <button onClick={() => setShowModal(true)} className="bg-black hover:bg-gray-900 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl flex items-center space-x-3 group">
                  <span>INQUIRE NOW</span>
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </button>
            
              </div>
            </div>
            
            <div className="relative mt-10 md:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white rounded-3xl transform rotate-3"></div>
              <div className="relative bg-gray-900 h-[380px] sm:h-[450px] md:h-[550px] lg:h-[600px] rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="h-full border-2 border-gray-700 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white mb-4">Q</div>
                    <div className="text-white/80 text-lg font-medium tracking-wider">DELIVERY NETWORK</div>
                    <div className="mt-8 space-y-3">
                      <div className="h-2 bg-gray-700 rounded-full w-48 mx-auto"></div>
                      <div className="h-2 bg-gray-700 rounded-full w-40 mx-auto"></div>
                      <div className="h-2 bg-gray-700 rounded-full w-44 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-gray-100 rounded-full text-sm font-medium mb-6">
              STRATEGIC ADVANTAGE
            </div>
            <h2 className="text-5xl font-black mb-6">Why QuickRun Stands Apart</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A meticulously crafted franchise model designed for discerning investors seeking returns
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaChartLine size={32} />,
                title: " Returns",
                desc: "Average ROI of 25-30% with breakeven in 18-24 months",
                stats: "25-30% ROI"
              },
              {
                icon: <FaUsers size={32} />,
                title: "Flexible Office-Based Franchise Model",
                desc: "Set up your QuickRun office anywhere, hire your own team, manage operations independently — with full IT infrastructure and customer support provided by QuickRun.",
                stats: "Office-Based Model"
              },
              {
                icon: <FaMapMarkerAlt size={32} />,
                title: "Future Expansion Pipeline",
                desc: "Planned rollout across major metros backed by strong operational and technology infrastructure",
                stats: "Coming Soon"
              }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-8 sm:p-10 rounded-3xl border border-gray-200 hover:border-black transition-all duration-500 group hover:shadow-2xl">
                <div className="text-black mb-6">{item.icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 group-hover:text-gray-600 transition-colors duration-300">{item.title}</h3>
                <p className="text-gray-600 text-base sm:text-lg mb-6">{item.desc}</p>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">{item.stats}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-block px-6 py-2 bg-white/10 rounded-full text-sm font-medium mb-8">
                OUR PHILOSOPHY
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10 leading-tight">
                Precision.<br/>
                Performance.<br/>
                Partnership.
              </h2>
              
              <div className="space-y-8">
                {[
                  { number: '01', title: 'Elite Efficiency', desc: 'Ultra-fast delivery systems optimized for maximum throughput' },
                  { number: '02', title: 'Technological Mastery', desc: 'Proprietary AI-driven logistics and real-time tracking' },
                  { number: '03', title: 'Operational Excellence', desc: 'Military-grade precision in fulfillment and delivery' },
                  { number: '04', title: 'Strategic Growth', desc: 'Data-driven expansion into market segments' },
                ].map((value) => (
                  <div key={value.number} className="group cursor-pointer">
                    <div className="flex items-center space-x-6">
                      <div className="text-3xl md:text-4xl font-black text-gray-400 group-hover:text-white transition-colors duration-300">{value.number}</div>
                      <div className="flex-1 border-b border-gray-800 group-hover:border-white transition-colors duration-300 pb-6">
                        <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-gray-300 transition-colors duration-300">{value.title}</h3>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{value.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-900 h-[380px] sm:h-[480px] md:h-[550px] lg:h-[600px] rounded-3xl p-6 sm:p-8">
              <div className="h-full border border-gray-800 rounded-2xl flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                <div className="text-9xl font-black text-center mb-8 opacity-20">Q</div>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-2 bg-gray-800 rounded-full"></div>
                  ))}
                </div>
                <div className="mt-12 text-center text-gray-400 text-lg">
                Delivery Infrastructure
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Franchise Details */}
      <section className="py-20 md:py-32 bg-white">
  <div className="max-w-7xl mx-auto px-6">

    {/* GRID FIXED FOR MOBILE */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

      {/* LEFT SIDE */}
      <div className="space-y-10">
        <div>
          <div className="inline-block px-5 py-2 bg-gray-100 rounded-full text-xs sm:text-sm font-medium mb-4">
            INVESTMENT DETAILS
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6 leading-snug">
            Franchise Specifications
          </h3>
        </div>

        {/* RESPONSIVE GRID FIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: 'Capital Investment', value: '₹3.5–4.5 Cr' },
            { label: 'Space Required', value: '5,000–8,000 sq ft' },
            { label: 'Agreement Term', value: '5 Years' },
            { label: 'Royalty Fee', value: '3%' },
            { label: 'Training Period', value: '4 Weeks' },
            { label: 'Payback Period', value: '1.5–2 Years' },
            { label: 'Support Included', value: 'Full Spectrum' },
            { label: 'Expansion Scope', value: 'Global' },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 hover:border-black transition-colors duration-300"
            >
              <div className="text-gray-500 text-xs sm:text-sm mb-1 font-medium">
                {item.label}
              </div>
              <div className="text-xl sm:text-2xl font-black">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE (BLACK PANEL) */}
      <div className="bg-black text-white p-6 sm:p-8 md:p-10 rounded-3xl w-full">
        <div className="inline-block px-5 py-2 bg-white/10 rounded-full text-xs sm:text-sm font-medium mb-6">
          EXCLUSIVE BENEFITS
        </div>

        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-8 leading-snug">
          Strategic Advantages
        </h3>

        <ul className="space-y-6">
          {[
            'Proven last-mile delivery ecosystem',
            'Full operational & technical support',
            'Advanced inventory management systems',
            'Customer acquisition channels',
            'Exclusive territorial rights',
            'Continuous innovation pipeline',
            'Dedicated franchise success team',
            'Bulk procurement advantages',
            'Dedicated IT support (app, dashboard, backend)',
            'Complete customer support handled by QuickRun central team',
          ].map((benefit, index) => (
            <li
              key={index}
              className="flex items-start space-x-3 text-sm sm:text-base md:text-lg leading-normal"
            >
              <FaCheck className="text-gray-400 mt-1 flex-shrink-0" />
              <span className="text-gray-300">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block px-6 py-2 bg-black text-white rounded-full text-sm font-medium mb-8">
            LIMITED AVAILABILITY
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-8">
            Elevate Your<br/>
            Investment Portfolio
          </h2>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12">
            Join an exclusive network of franchise owners
          </p>
        
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 bg-gray-100 rounded-full text-sm font-medium mb-6">
              FREQUENTLY ASKED
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">Investment Inquiries</h2>
            <p className="text-lg md:text-xl text-gray-600">Detailed insights for discerning investors</p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: 'What distinguishes QuickRun from other delivery franchises?',
                a: 'QuickRun operates on a micro-fulfillment model with advanced technology integration, targeting high-density urban markets with discerning customers who value speed and reliability.'
              },
              {
                q: 'What level of support is provided during setup?',
                a: 'Comprehensive 360° support including site selection, hub design, technology deployment, staff training, supply chain setup, and launch marketing.'
              },
              {
                q: 'What are the key success metrics?',
                a: 'Average order value ₹850, daily delivery capacity 1,200+ orders, customer retention rate 78%, and gross margin 32-35%.'
              },
              {
                q: 'What expansion opportunities exist?',
                a: 'Exclusive territorial rights with first refusal on adjacent zones, plus access to our international expansion pipeline.'
              },
              {
                q: 'What is the investor qualification process?',
                a: 'Four-stage vetting: 1) Initial assessment 2) Financial review 3) Strategic alignment 4) Partnership agreement. Average process duration: 6-8 weeks.'
              },
            ].map((faq, index) => (
              <div key={index} className="group border-b border-gray-200 pb-6 cursor-pointer">
                <div className="flex justify-between items-center py-4 md:py-6">
                  <h3 className="text-lg md:text-xl font-bold group-hover:text-gray-600 transition-colors duration-300">{faq.q}</h3>
                  <div className="text-gray-400 group-hover:text-black transition-colors duration-300">
                    <FaChevronDown />
                  </div>
                </div>
                <div className="text-gray-600 leading-relaxed max-w-3xl text-base md:text-lg">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div>
              <div className="text-2xl sm:text-3xl font-black mb-6">QUICKRUN</div>
              <p className="text-gray-400 mb-8">Instant delivery franchise network</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-gray-400" />
                  <span>+91 93198 51474</span>
                </div>
                <div className="text-gray-400 text-sm">Delhi • Mumbai</div>
              </div>
            </div>
            
            <div>
              <div className="text-base sm:text-lg font-bold mb-8">FRANCHISE NETWORK</div>
              <div className="space-y-4 text-gray-400">
                <div>Strategic Locations</div>
                <div>Investor Portal</div>
                <div>Performance Reports</div>
                <div>Partner Resources</div>
              </div>
            </div>
            
            <div>
              <div className="text-base sm:text-lg font-bold mb-8">INVEST WITH US</div>
              <button onClick={() => setShowModal(true)} className="bg-white text-black hover:bg-gray-200 px-6 py-4 sm:px-8 rounded-full font-semibold transition-all duration-300 hover:scale-105 w-full mb-6">
                REQUEST PROPOSAL
              </button>
              <p className="text-gray-400 text-xs sm:text-sm">Limited franchise territories available for 2025</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400 text-xs sm:text-sm">
            © 2025 QuickRun Franchise Network. All rights reserved.
          </div>
        </div>
      </footer>

    </>
  );
}