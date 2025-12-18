"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
type FormType = {
  name: string;
  email: string;
  phone: string;
  city: string;
  plan: string;
  message: string;
};
type FranchiseType = {
  id: number;
  title: string;
  investment: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  description: string;
  roi: string;
  duration: string;
};



import { useState, useEffect, useRef } from "react";
import { 
  CheckCircle, 
  TrendingUp, 
  Headphones, 
  Shield,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Users,
  Store,
  Home,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Target,
  DollarSign,
  Clock,
  ShieldCheck,
  BarChart3,
  Globe,
  Award,
  Package,
  ShoppingBag,
  Building,
  Download,
  Search
} from "lucide-react";

export default function LandingPage() {
const [form, setForm] = useState<FormType>({
  name: "",
  email: "",
  phone: "",
  city: "",
  plan: "Super Franchise — ₹25,00,000",
  message: "",
});


const [openCard, setOpenCard] = useState<number | null>(null);

const [currentSlide, setCurrentSlide] = useState<number>(0);

const sliderRef = useRef<HTMLDivElement | null>(null);

const cardRefs = useRef<HTMLDivElement[]>([]);

const toggleCard = (id: number) => {
  setOpenCard(openCard === id ? null : id);
};






const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

  e.preventDefault();

  if (!form.name || !form.email || !form.phone || !form.city) {
    alert("Please fill all required fields");
    return;
  }

  try {
    await addDoc(collection(db, "franchisesmallmodel"), {
      name: form.name,
      email: form.email,
      phone: form.phone,
      city: form.city,
      plan: form.plan,
      message: form.message || "",
      created_at: serverTimestamp(),
    });

    alert("Thanks! Your enquiry has been submitted. Our franchise manager will contact you within 24 hours.");

    setForm({
      name: "",
      email: "",
      phone: "",
      city: "",
      plan: "Super Franchise — ₹25,00,000",
      message: "",
    });

  } catch (error) {
    console.error("Error saving data:", error);
    alert("Something went wrong! Try again.");
  }
};

const getSlideWidth = (): number => {
  if (typeof window === "undefined") return 100;
  const w = window.innerWidth;

  if (w < 640) return 100;
  if (w < 1024) return 50;
  if (w < 1280) return 33.33;
  return 25;
};




  const benefits = [
    {
      icon: <ShieldCheck className="w-12 h-12" />,
      title: "Brand & Tech Support",
      description: "White-label dashboard & mobile app with regular updates"
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Operations Excellence",
      description: "Complete SOPs & onboarding support with audits"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Marketing Support",
      description: "Local ads & listing management with analytics"
    },
    {
      icon: <Headphones className="w-12 h-12" />,
      title: "Training Programs",
      description: "Staff & delivery team onboarding with certification"
    }
  ];

const franchiseTypes: FranchiseType[] = [
    {
      id: 1,
      title: "Super Franchise",
      investment: "₹25,00,000",
      icon: <Building className="w-14 h-14" />,
      color: "from-blue-900 to-blue-800",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100/30",
      borderColor: "border-blue-200",
      features: [
        "Exclusive rights for a large territory",
        "Can appoint & manage outlet franchises in your region",
        "High revenue share from all outlets under you",
        "Full branding & operational support",
        "Priority onboarding + business training",
        "Logistics & supply chain included"
      ],
      description: "Perfect for investors wanting to manage large territories with maximum scalability.",
      roi: "₹50-70L/year",
      duration: "5-7 years"
    },
    {
      id: 2,
      title: "Outlet Franchise",
      investment: "₹5,00,000",
      icon: <Store className="w-14 h-14" />,
      color: "from-emerald-900 to-emerald-800",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100/30",
      borderColor: "border-emerald-200",
      features: [
        "Setup of a micro-warehouse / delivery store",
        "Support for inventory, onboarding, packaging & operations",
        "Full staff training + delivery operations guidance",
        "Access to QuickRunFast technology, dashboard & seller system",
        "Standard marketing & branding support"
      ],
      description: "Ideal for entrepreneurs establishing a local delivery business with full support.",
      roi: "₹15-25L/year",
      duration: "3-5 years"
    },
    {
      id: 3,
      title: "Mini Franchise",
      investment: "₹25,000",
      icon: <Home className="w-14 h-14" />,
      color: "from-amber-900 to-amber-800",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100/30",
      borderColor: "border-amber-200",
      features: [
        "No warehouse needed",
        "Can operate from home or a small shop",
        "Very low setup cost",
        "Can sell limited product categories",
        "Training + app access included",
        "Per-order commission + Monthly sales performance incentives"
      ],
      description: "Perfect for small shop owners or individuals starting with minimal investment.",
      roi: "₹3-8L/year",
      duration: "1-2 years"
    },
    {
      id: 4,
      title: "Vendor Code Franchise",
      investment: "Zero / Minimal",
      icon: <Package className="w-14 h-14" />,
      color: "from-violet-900 to-violet-800",
      bgColor: "bg-gradient-to-br from-violet-50 to-violet-100/30",
      borderColor: "border-violet-200",
      features: [
        "Unique vendor code to list products on the platform",
        "Access to thousands of active buyers",
        "Support for catalog creation & product uploads",
        "Regular payment settlements",
        "Suitable for grocery, FMCG, vegetables, bakery, homemade items, and more"
      ],
      description: "Perfect for small shop owners or individuals starting with minimal investment.",
      roi: "₹1-5L/year",
      duration: "Flexible"
    }
  ];

  const stats = [
    { value: "95%", label: "Success Rate", icon: <Star className="w-6 h-6" /> },
    { value: "24/7", label: "Support", icon: <Headphones className="w-6 h-6" /> },
    { value: "₹10L+", label: "Avg. Annual Profit", icon: <DollarSign className="w-6 h-6" /> },
    { value: "500+", label: "Franchise Partners", icon: <Users className="w-6 h-6" /> }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % franchiseTypes.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + franchiseTypes.length) % franchiseTypes.length);
  };



  const scrollToForm = () => {
    document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full px-6 py-3 mb-8 shadow-lg">
                <Target className="w-5 h-5" />
                <span className="font-medium">Limited Franchise Spots Available</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Start Your Own
                <span className="block text-blue-800 mt-2">Franchise Business</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 max-w-2xl">
                Low Investment • High Profit Margins • Complete Support System
              </p>
              

              <button
                onClick={scrollToForm}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Apply for Franchise
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            
            {/* Right Content - Stats Visualization */}
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-gray-700">Live Opportunity Map</span>
                </div>
                
                <div className="space-y-6">
                  {franchiseTypes.map((type, index) => (
                    <div key={type.id} className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center text-white`}>
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">{type.title}</span>
                          <span className="font-bold text-gray-800">{type.investment}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${index === 0 ? 'bg-blue-600 w-3/4' : index === 1 ? 'bg-emerald-600 w-2/3' : index === 2 ? 'bg-amber-600 w-1/2' : 'bg-violet-600 w-1/3'}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-blue-700">Our Franchise?</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive support system designed for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-100"
              >
                <div className="absolute -top-4 left-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  {benefit.icon}
                </div>
                
                <div className="pt-12">
                  <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Weekly training sessions
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Dedicated account manager
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Franchise Types Section with Slider */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your <span className="text-blue-700">Franchise Type</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Select the perfect model that matches your investment capacity and business goals
            </p>
          </div>

          {/* Slider Container */}
{/* SLIDER SECTION */}
<div className="relative max-w-7xl mx-auto px-4">

  {/* Navigation Buttons */}
  <button
    onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10
    w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
  >
    <ChevronLeft className="w-6 h-6" />
  </button>

  <button
    onClick={() => setCurrentSlide(prev => prev + 1)}
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10
    w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
  >
    <ChevronRight className="w-6 h-6" />
  </button>


  {/* Slider Track */}
  <div className="overflow-hidden">
    <div
      className="flex transition-transform duration-500 ease-out"
      style={{
        transform: `translateX(-${currentSlide * getSlideWidth()}%)`,
      }}
    >
      {franchiseTypes.map((type, index) => (
        <div
          key={index}
          className="
            min-w-full 
            sm:min-w-[50%] 
            lg:min-w-[33.33%] 
            xl:min-w-[25%]
            px-3
          "
        >
          {/* CARD */}
          <div className={`${type.bgColor} border-2 ${type.borderColor}
            rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all h-full flex flex-col`}
          >

            {/* HEADER */}
            <div className={`p-8 bg-gradient-to-r ${type.color} text-white`}>
              <div className="flex justify-between mb-4">
                {type.icon}
                <div className="text-right">
                  <p className="text-sm opacity-80">Investment</p>
                  <h3 className="text-xl font-bold">{type.investment}</h3>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">{type.title}</h3>
              <p className="opacity-90">{type.description}</p>
            </div>

            {/* FEATURES */}
            <div className="p-6 flex flex-col flex-grow">
              <ul className="space-y-3 mb-6">
                {type.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {openCard === type.id && (
                <div className="border-t pt-4">
                  {type.features.slice(4).map((f, i) => (
                    <li key={i} className="flex gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                      <span className="text-sm text-gray-600">{f}</span>
                    </li>
                  ))}
                </div>
              )}

              <button
                onClick={() => toggleCard(type.id)}
                className="mt-auto bg-gray-900 text-white py-3 rounded-xl flex justify-center items-center gap-2"
              >
                {openCard === type.id ? "Show Less" : "View Details"}
                {openCard === type.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Slider Dots */}
  <div className="flex justify-center gap-2 mt-6">
    {franchiseTypes.map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentSlide(i)}
        className={`w-3 h-3 rounded-full transition-all 
          ${currentSlide === i ? "bg-blue-700 w-6" : "bg-gray-300"}`}
      />
    ))}
  </div>

</div>

        </div>
      </section>

      {/* Enquiry Form Section */}
      <section id="enquiry-form" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 rounded-2xl overflow-hidden shadow-2xl">
            <div className="md:flex">
              {/* Form Side */}
              <div className="md:w-2/3 p-10 md:p-14">
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    <h2 className="text-3xl font-bold">Apply for Franchise Partnership</h2>
                  </div>
                  <p className="text-gray-600">
                    Fill this form and our Franchise Manager will contact you within 24 hours with complete details.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="Your city"
                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Preferred Investment Plan
                      </label>
                      <select
                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none bg-white"
                        value={form.plan}
                        onChange={(e) => setForm({ ...form, plan: e.target.value })}
                      >
                        <option>Super Franchise — ₹25,00,000</option>
                        <option>Outlet Franchise — ₹5,00,000</option>
                        <option>Mini Franchise — ₹25,000</option>
                        <option>Vendor Code Franchise - Zero / Minimal</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Additional Message (Optional)
                      </label>
                      <textarea
                        placeholder="Tell us about your business experience or any specific requirements..."
                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white py-5 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-2xl"
                  >
                    <span className="relative z-10">Request Franchise Kit & Consultation</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </button>
                </form>
              </div>

              {/* Info Side */}
              <div className="md:w-1/3 p-10 md:p-14 bg-gradient-to-b from-blue-900 to-blue-800 text-white">
                <div className="mb-12">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">24/7 Support Available</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-8">Why Partner With Us?</h3>
                  <ul className="space-y-6">
                    {[
                      "Proven Business Model",
                      "Complete Training & Setup",
                      "Marketing & Operational Support",
                      "Regular Performance Reviews",
                      "Technology Platform",
                      "Community Support"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 border-t border-white/20">
                  <h4 className="font-bold text-xl mb-8">Contact Information</h4>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm opacity-90">Call us at</div>
                        <div className="font-bold text-lg">120-690-9586</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 px-3 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm opacity-90">Email us at</div>
                        <div className="font-bold">support@quickrunfast.com</div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}