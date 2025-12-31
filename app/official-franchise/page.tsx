"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Playfair_Display, Inter } from 'next/font/google';
import { FaWhatsapp, FaChevronDown, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';

const statesOfIndia = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
];

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600']
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg p-8 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
            
            <div className="mb-8">
              <h2 className={`text-2xl font-semibold mb-3 text-gray-900 dark:text-white ${playfair.className}`}>
                Partner with QuickRun
              </h2>
              <p className={`text-gray-600 dark:text-gray-300 ${inter.className}`}>
                Begin your franchise journey
              </p>
            </div>

            <div className="space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                value={enqName}
                onChange={(e) => setEnqName(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-400 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${inter.className}`}
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={enqPhone}
                onChange={(e) => setEnqPhone(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-400 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${inter.className}`}
              />

              <div className="relative">
                <select
                  value={enqState}
                  onChange={(e) => setEnqState(e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-400 outline-none transition-colors appearance-none cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${inter.className}`}
                >
                  <option>Select Your State</option>
                  {statesOfIndia.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none text-xs" />
              </div>

              <button
                onClick={submitEnquiry}
                className={`w-full bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-3 font-medium transition-colors flex items-center justify-center space-x-2 ${inter.className}`}
              >
                <span>Submit Application</span>
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-800 py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 dark:text-white leading-tight mb-8 ${playfair.className}`}>
              Partner with QuickRun
            </h1>
            
            <p className={`text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12 max-w-3xl mx-auto ${inter.className} font-light`}>
              Join India's premier instant delivery network. Build a profitable business delivering groceries and essentials in minutes.
            </p>
            
            <div className="flex justify-center mb-16">
              <button 
                onClick={() => setShowModal(true)} 
                className={`bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-12 py-4 font-medium transition-colors flex items-center justify-center space-x-3 ${inter.className}`}
              >
                <span>Apply for Franchise</span>
                <FaArrowRight className="text-sm" />
              </button>
            </div>

            {/* Elegant Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <div className={`text-4xl font-semibold text-gray-900 dark:text-white mb-2 ${playfair.className}`}>Minutes</div>
                <div className={`text-gray-600 dark:text-gray-300 ${inter.className}`}>Delivery Time</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-semibold text-gray-900 dark:text-white mb-2 ${playfair.className}`}>25+</div>
                <div className={`text-gray-600 dark:text-gray-300 ${inter.className}`}>Cities Available</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-semibold text-gray-900 dark:text-white mb-2 ${playfair.className}`}>₹3.5Cr</div>
                <div className={`text-gray-600 dark:text-gray-300 ${inter.className}`}>Starting Investment</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose QuickRun */}
      <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-6 ${playfair.className}`}>
              Why QuickRun
            </h2>
            <p className={`text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto ${inter.className} font-light`}>
              A proven business model built for sustainable growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {[
              {
                title: "Instant Delivery Promise",
                desc: "Ultra-fast delivery in minutes that builds customer loyalty and repeat business"
              },
              {
                title: "Strategic Locations",
                desc: "Micro-fulfillment centers positioned for maximum efficiency and coverage"
              },
              {
                title: "Advanced Technology",
                desc: "Proprietary logistics platform with real-time optimization and tracking"
              },
              {
                title: "Comprehensive Support",
                desc: "End-to-end assistance from setup to operations and ongoing growth"
              },
              {
                title: "Revenue Sharing",
                desc: "Transparent 5% revenue sharing model with strong profit potential"
              },
              {
                title: "Protected Territory",
                desc: "Exclusive franchise areas with expansion rights and market protection"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <h3 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${playfair.className}`}>
                  {item.title}
                </h3>
                <p className={`text-gray-600 dark:text-gray-300 leading-relaxed ${inter.className}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Details */}
      <section className="py-20 md:py-32 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-6 ${playfair.className}`}>
              Investment Details
            </h2>
            <p className={`text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto ${inter.className} font-light`}>
              Transparent structure with comprehensive support
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Investment Breakdown */}
            <div>
              <h3 className={`text-2xl font-semibold text-gray-900 dark:text-white mb-8 ${playfair.className}`}>
                Financial Overview
              </h3>
              
              <div className="space-y-6">
                {[
                  { label: 'Total Investment', value: '₹3.5 - 4.5 Crores' },
                  { label: 'Space Required', value: '5,000 - 8,000 sq ft' },
                  { label: 'Franchise Fee', value: '₹15 Lakhs' },
                  { label: 'Revenue Share', value: '5% of revenue' },
                  { label: 'Payback Period', value: '18 - 24 months' },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-600">
                    <div className={`text-gray-700 dark:text-gray-300 ${inter.className}`}>{item.label}</div>
                    <div className={`text-gray-900 dark:text-white font-semibold ${inter.className}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Support Package */}
            <div>
              <h3 className={`text-2xl font-semibold text-gray-900 dark:text-white mb-8 ${playfair.className}`}>
                Support Package
              </h3>
              
              <div className="space-y-4">
                {[
                  'Complete store setup and design',
                  'Advanced technology platform',
                  'Staff training and certification',
                  'Marketing and brand support',
                  'Supply chain management',
                  'Ongoing operational guidance',
                  '24/7 customer service support',
                  'Performance analytics dashboard',
                  'Territory protection rights',
                  'Continuous innovation updates'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-gray-300 rounded-full mt-2.5 flex-shrink-0"></div>
                    <span className={`text-gray-700 dark:text-gray-300 ${inter.className}`}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <button 
              onClick={() => setShowModal(true)}
              className={`bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-12 py-4 font-medium transition-colors inline-flex items-center space-x-3 ${inter.className}`}
            >
              <span>Request Detailed Proposal</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-6 ${playfair.className}`}>
              Getting Started
            </h2>
            <p className={`text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto ${inter.className} font-light`}>
              A straightforward path to franchise ownership
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {[
              {
                number: '01',
                title: 'Application',
                desc: 'Submit your franchise application with investment details and preferred location'
              },
              {
                number: '02',
                title: 'Evaluation',
                desc: 'Comprehensive review process including financial assessment and market analysis'
              },
              {
                number: '03',
                title: 'Site Selection',
                desc: 'Strategic location identification and approval for optimal market coverage'
              },
              {
                number: '04',
                title: 'Launch',
                desc: 'Complete setup, training, and operational launch with ongoing support'
              }
            ].map((item, index) => (
              <div key={index} className="flex space-x-6">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 border-2 border-gray-900 dark:border-gray-300 text-gray-900 dark:text-gray-300 flex items-center justify-center text-lg font-semibold ${inter.className}`}>
                    {item.number}
                  </div>
                </div>
                <div>
                  <h3 className={`text-2xl font-semibold text-gray-900 dark:text-white mb-4 ${playfair.className}`}>
                    {item.title}
                  </h3>
                  <p className={`text-gray-600 dark:text-gray-300 leading-relaxed ${inter.className}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-4xl md:text-5xl font-semibold text-white mb-8 ${playfair.className}`}>
            Begin Your Journey
          </h2>
          <p className={`text-xl text-gray-300 dark:text-gray-400 mb-12 max-w-2xl mx-auto ${inter.className} font-light`}>
            Join India's premier instant delivery network and build a sustainable business
          </p>
          
          <div className="flex justify-center mb-16">
            <button 
              onClick={() => setShowModal(true)}
              className={`bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 px-12 py-4 font-medium transition-colors inline-flex items-center space-x-3 ${inter.className}`}
            >
              <span>Apply for Franchise</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-gray-800 dark:border-gray-700">
            <div className="text-center">
              <div className={`text-3xl font-semibold text-white mb-2 ${playfair.className}`}>₹3.5Cr</div>
              <div className={`text-gray-400 dark:text-gray-500 ${inter.className}`}>Starting Investment</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-semibold text-white mb-2 ${playfair.className}`}>25+</div>
              <div className={`text-gray-400 dark:text-gray-500 ${inter.className}`}>Cities Available</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-semibold text-white mb-2 ${playfair.className}`}>5%</div>
              <div className={`text-gray-400 dark:text-gray-500 ${inter.className}`}>Revenue Share</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-6 ${playfair.className}`}>
              Common Questions
            </h2>
            <p className={`text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto ${inter.className} font-light`}>
              Answers to help you make an informed decision
            </p>
          </div>
          
          <div className="space-y-8">
            {[
              {
                q: 'What distinguishes QuickRun from other delivery services?',
                a: 'QuickRun focuses exclusively on ultra-fast delivery in minutes through strategically positioned micro-fulfillment centers, advanced logistics technology, and a premium customer experience approach.'
              },
              {
                q: 'What support is provided to franchise partners?',
                a: 'Comprehensive support including site selection, complete store setup, staff training, technology platform access, marketing assistance, and continuous operational guidance throughout your journey.'
              },
              {
                q: 'What is the total investment requirement?',
                a: 'Investment ranges from ₹3.5-4.5 crores, covering franchise fee, store setup, initial inventory, equipment, and working capital for the initial operational period. We operate on a 5% revenue sharing model.'
              },
              {
                q: 'What is the expected timeline to profitability?',
                a: 'Most franchise partners achieve break-even within 18-24 months, with strong performance metrics showing consistent growth thereafter based on market execution.'
              },
              {
                q: 'Which locations are currently available?',
                a: 'We are expanding across 25+ tier-1 and tier-2 cities in India. Contact us to discuss availability and market potential in your preferred location.'
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-8">
                <h3 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${playfair.className}`}>
                  {faq.q}
                </h3>
                <p className={`text-gray-600 dark:text-gray-300 leading-relaxed ${inter.className}`}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className={`text-gray-600 dark:text-gray-300 mb-6 ${inter.className}`}>
              Have additional questions?
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className={`text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-300 font-medium border-b border-gray-900 dark:border-gray-300 ${inter.className}`}
            >
              Contact our franchise team
            </button>
          </div>
        </div>
      </section>



    </>
  );
}