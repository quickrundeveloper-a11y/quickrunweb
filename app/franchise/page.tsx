"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { Playfair_Display, Inter } from 'next/font/google';
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

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600']
});

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

  if (w < 640) return 100;    // Mobile: 1 card
  if (w < 1024) return 50;    // Tablet: 2 cards
  return 33.33;               // Desktop: 3 cards
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

  const getMaxSlides = (): number => {
    if (typeof window === "undefined") return franchiseTypes.length - 1;
    const w = window.innerWidth;
    
    if (w < 640) return franchiseTypes.length - 1;    // Mobile: can slide through all
    if (w < 1024) return franchiseTypes.length - 2;   // Tablet: show 2, can slide to show last 2
    return franchiseTypes.length - 3;                 // Desktop: show 3, can slide to show last card
  };

  const nextSlide = () => {
    const maxSlides = getMaxSlides();
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlides));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };



  const scrollToForm = () => {
    document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">

      {/* About QuickRun Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 leading-tight mb-8 ${playfair.className}`}>
              About QuickRun
            </h1>
            
            <p className={`text-xl md:text-2xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto ${inter.className} font-light`}>
              QuickRun is India's premier instant delivery network, revolutionizing how people access groceries and essentials. We deliver in minutes, not hours, through our strategically positioned micro-fulfillment centers and advanced logistics technology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-gray-200">
              <div className="text-center">
                <div className={`text-4xl font-semibold text-gray-900 mb-2 ${playfair.className}`}>Minutes</div>
                <div className={`text-gray-600 ${inter.className}`}>Ultra-Fast Delivery</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-semibold text-gray-900 mb-2 ${playfair.className}`}>25+</div>
                <div className={`text-gray-600 ${inter.className}`}>Cities Served</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-semibold text-gray-900 mb-2 ${playfair.className}`}>10,000+</div>
                <div className={`text-gray-600 ${inter.className}`}>Products Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className={`text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-8 ${playfair.className}`}>
              Franchise Opportunities
            </h2>
            
            <p className={`text-xl md:text-2xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto ${inter.className} font-light`}>
              Join our growing network of successful franchise partners. Multiple investment options with comprehensive support and proven business models.
            </p>
            
            <div className="flex justify-center mb-16">
              <button 
                onClick={scrollToForm}
                className={`bg-gray-900 hover:bg-black text-white px-12 py-4 font-medium transition-colors flex items-center justify-center space-x-3 ${inter.className}`}
              >
                <span>Apply for Franchise</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-3xl font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                    {stat.value}
                  </div>
                  <div className={`text-gray-600 ${inter.className}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-semibold text-gray-900 mb-6 ${playfair.className}`}>
              Why Partner with QuickRun
            </h2>
            <p className={`text-xl text-gray-600 max-w-2xl mx-auto ${inter.className} font-light`}>
              Comprehensive support system designed for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white p-8 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="mb-6 text-gray-900">
                  {benefit.icon}
                </div>
                
                <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${playfair.className}`}>
                  {benefit.title}
                </h3>
                <p className={`text-gray-600 leading-relaxed mb-6 ${inter.className}`}>
                  {benefit.description}
                </p>
                
                <div className="pt-6 border-t border-gray-200">
                  <ul className="space-y-3">
                    <li className={`flex items-start space-x-3 ${inter.className}`}>
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2.5 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">Weekly training sessions</span>
                    </li>
                    <li className={`flex items-start space-x-3 ${inter.className}`}>
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2.5 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">Dedicated account manager</span>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Franchise Types Section with Slider */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-semibold text-gray-900 mb-6 ${playfair.className}`}>
              Franchise Models
            </h2>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto ${inter.className} font-light`}>
              Select the perfect model that matches your investment capacity and business goals
            </p>
          </div>

          {/* Slider Container */}
{/* SLIDER SECTION */}
<div className="relative max-w-7xl mx-auto px-4">

  {/* Navigation Buttons */}
  <button
    onClick={prevSlide}
    disabled={currentSlide === 0}
    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-200 flex items-center justify-center transition-colors ${
      currentSlide === 0 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:border-gray-300 cursor-pointer'
    }`}
  >
    <ChevronLeft className="w-6 h-6 text-gray-600" />
  </button>

  <button
    onClick={nextSlide}
    disabled={currentSlide >= getMaxSlides()}
    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-200 flex items-center justify-center transition-colors ${
      currentSlide >= getMaxSlides()
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:border-gray-300 cursor-pointer'
    }`}
  >
    <ChevronRight className="w-6 h-6 text-gray-600" />
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
            px-3
          "
        >
          {/* CARD */}
          <div className="bg-white border border-gray-200 hover:border-gray-300 transition-colors h-full flex flex-col">

            {/* HEADER */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex justify-between items-start mb-6">
                <div className="text-gray-900">
                  {type.icon}
                </div>
                <div className="text-right">
                  <p className={`text-sm text-gray-600 mb-1 ${inter.className}`}>Investment</p>
                  <h3 className={`text-xl font-semibold text-gray-900 ${playfair.className}`}>{type.investment}</h3>
                </div>
              </div>
              <h3 className={`text-2xl font-semibold text-gray-900 mb-3 ${playfair.className}`}>{type.title}</h3>
              <p className={`text-gray-600 ${inter.className}`}>{type.description}</p>
            </div>

            {/* FEATURES */}
            <div className="p-8 flex flex-col flex-grow">
              <ul className="space-y-4 mb-8">
                {type.features.slice(0, 4).map((f, i) => (
                  <li key={i} className={`flex items-start space-x-3 ${inter.className}`}>
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2.5 flex-shrink-0"></div>
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>

              {openCard === type.id && (
                <div className="border-t border-gray-200 pt-6 mb-8">
                  <ul className="space-y-3">
                    {type.features.slice(4).map((f, i) => (
                      <li key={i} className={`flex items-start space-x-3 ${inter.className}`}>
                        <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2.5 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => toggleCard(type.id)}
                className={`mt-auto bg-gray-900 hover:bg-black text-white py-3 font-medium transition-colors flex justify-center items-center gap-2 ${inter.className}`}
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
  <div className="flex justify-center gap-2 mt-8">
    {Array.from({ length: getMaxSlides() + 1 }).map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentSlide(i)}
        className={`w-3 h-3 transition-all 
          ${currentSlide === i ? "bg-gray-900 w-6" : "bg-gray-300"}`}
      />
    ))}
  </div>

</div>

        </div>
      </section>

      {/* Enquiry Form Section */}
      <section id="enquiry-form" className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="md:flex">
              {/* Form Side */}
              <div className="md:w-2/3 p-10 md:p-14">
                <div className="mb-12">
                  <h2 className={`text-4xl font-semibold text-gray-900 mb-4 ${playfair.className}`}>
                    Apply for Partnership
                  </h2>
                  <p className={`text-gray-600 ${inter.className}`}>
                    Fill this form and our Franchise Manager will contact you within 24 hours with complete details.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-3 ${inter.className}`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className={`w-full border border-gray-200 p-4 focus:border-gray-400 outline-none transition-colors ${inter.className}`}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-3 ${inter.className}`}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full border border-gray-200 p-4 focus:border-gray-400 outline-none transition-colors ${inter.className}`}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-3 ${inter.className}`}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        className={`w-full border border-gray-200 p-4 focus:border-gray-400 outline-none transition-colors ${inter.className}`}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-3 ${inter.className}`}>
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="Your city"
                        className={`w-full border border-gray-200 p-4 focus:border-gray-400 outline-none transition-colors ${inter.className}`}
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium text-gray-700 mb-3 ${inter.className}`}>
                        Preferred Investment Plan
                      </label>
                      <select
                        className={`w-full border border-gray-200 p-4 focus:border-gray-400 outline-none transition-colors appearance-none bg-white ${inter.className}`}
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
                      <label className={`block text-sm font-medium text-gray-700 mb-3 ${inter.className}`}>
                        Additional Message (Optional)
                      </label>
                      <textarea
                        placeholder="Tell us about your business experience or any specific requirements..."
                        className={`w-full border border-gray-200 p-4 focus:border-gray-400 outline-none transition-colors resize-none ${inter.className}`}
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full bg-gray-900 hover:bg-black text-white py-4 font-medium transition-colors flex items-center justify-center space-x-3 ${inter.className}`}
                  >
                    <span>Submit Application</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* Info Side */}
              <div className="md:w-1/3 p-10 md:p-14 bg-gray-900 text-white">
                <div className="mb-12">
                  <h3 className={`text-2xl font-semibold mb-8 ${playfair.className}`}>
                    Why Partner With Us
                  </h3>
                  <ul className="space-y-6">
                    {[
                      "Proven Business Model",
                      "Complete Training & Setup",
                      "Marketing & Operational Support",
                      "Regular Performance Reviews",
                      "Technology Platform",
                      "Community Support"
                    ].map((item, index) => (
                      <li key={index} className={`flex items-start space-x-3 ${inter.className}`}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-2.5 flex-shrink-0"></div>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 border-t border-gray-800">
                  <h4 className={`font-semibold text-xl mb-8 ${playfair.className}`}>
                    Contact Information
                  </h4>
                  <div className="space-y-6">
                    <div className={`${inter.className}`}>
                      <div className="text-sm text-gray-400 mb-1">Call us at</div>
                      <div className="font-semibold text-lg text-white">120-690-9586</div>
                    </div>
                    <div className={`${inter.className}`}>
                      <div className="text-sm text-gray-400 mb-1">Email us at</div>
                      <div className="font-semibold text-white">support@quickrunfast.com</div>
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