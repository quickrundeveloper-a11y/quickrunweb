"use client";

import Link from "next/link";

const posts = [
  {
    slug: "how-quickrun-delivers-in-minutes",
    title: "How QuickRun Delivers in Minutes",
    author: "Team QuickRun",
    date: "January 2026",
    readTime: "5 min read",
    image:
      "https://images.pexels.com/photos/4393665/pexels-photo-4393665.jpeg?auto=compress&cs=tinysrgb&w=1200",
    excerpt:
      "Behind the scenes of our dark stores, routing engine, and operations that make ultra-fast delivery possible.",
  },
  {
    slug: "building-a-reliable-delivery-partner-network",
    title: "Building a Reliable Delivery Partner Network",
    author: "Operations Team",
    date: "December 2025",
    readTime: "6 min read",
    image:
      "https://images.pexels.com/photos/4246239/pexels-photo-4246239.jpeg?auto=compress&cs=tinysrgb&w=1200",
    excerpt:
      "How we onboard, train, and support delivery partners so that every order reaches safely and on time.",
  },
  {
    slug: "designing-a-simple-grocery-shopping-experience",
    title: "Designing a Simple Grocery Shopping Experience",
    author: "Product & Design",
    date: "November 2025",
    readTime: "4 min read",
    image:
      "https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg?auto=compress&cs=tinysrgb&w=1200",
    excerpt:
      "Principles and design decisions that keep the QuickRun app fast, clean, and easy for everyone.",
  },
  {
    slug: "scaling-quickrun-to-new-cities",
    title: "Scaling QuickRun to New Cities",
    author: "Expansion Team",
    date: "October 2025",
    readTime: "7 min read",
    image:
      "https://images.pexels.com/photos/4484078/pexels-photo-4484078.jpeg?auto=compress&cs=tinysrgb&w=1200",
    excerpt:
      "What it takes to open a new city: catalog, supply chain, partners, and local operations.",
  },
  {
    slug: "data-warehouse-journey-with-dbt",
    title: "Data Warehouse Journey With dbt",
    author: "Data & Engineering",
    date: "July 2026",
    readTime: "6 min read",
    image:
      "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1200",
    excerpt:
      "How the QuickRun data team scaled its warehouse using dbt, Trino, and a modular analytics architecture.",
  },
];

export default function BlogPage() {
  return (
    <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center py-10 md:py-16">
      <div className="w-[94%] max-w-6xl mx-auto">
        <header className="mb-10 md:mb-14 text-center">
          <p className="text-xs font-semibold tracking-[0.25em] text-gray-500 dark:text-gray-400 mb-3 uppercase">
            QuickRun Blog
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Stories from inside QuickRun
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            Product updates, engineering stories, operations learnings, and
            everything that powers instant delivery.
          </p>
        </header>

        <section className="grid gap-8 md:gap-10 md:grid-cols-2">
          {posts.map((post, index) => (
            <article
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col"
            >
              <div className="relative w-full h-52 md:h-56 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 md:p-6 flex flex-col flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span className="font-medium">{post.author}</span>{" "}
                  <span className="mx-1">•</span>
                  <span>{post.date}</span>{" "}
                  <span className="mx-1">•</span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {post.title}
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">
                  {post.excerpt}
                </p>

                <div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Read article
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
