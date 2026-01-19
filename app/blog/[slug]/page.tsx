"use client";

import Link from "next/link";
import { notFound } from "next/navigation";

const posts = [
  {
    slug: "how-quickrun-delivers-in-minutes",
    title: "How QuickRun Delivers in Minutes",
    author: "Team QuickRun",
    date: "January 2026",
    readTime: "5 min read",
    image:
      "https://images.pexels.com/photos/4393665/pexels-photo-4393665.jpeg?auto=compress&cs=tinysrgb&w=1200",
    intro:
      "QuickRun combines smart routing, dense dark-store placement, and real-time inventory to deliver everyday essentials in just a few minutes.",
    paragraphs: [
      "Every minute matters when someone orders groceries or essentials online. At QuickRun, our promise is built on a network of compact dark stores placed close to high-demand neighbourhoods, backed by fast picking and packing operations.",
      "As soon as an order is placed, our systems lock inventory, assign a picker inside the store, and immediately route a nearby delivery partner. This tight loop ensures that items move from shelf to doorstep with very little idle time in between.",
      "Continuous monitoring of demand patterns helps us optimise assortment and placement inside each store so that high-frequency items are always within quick reach, reducing the time spent finding and packing products.",
    ],
  },
  {
    slug: "building-a-reliable-delivery-partner-network",
    title: "Building a Reliable Delivery Partner Network",
    author: "Operations Team",
    date: "December 2025",
    readTime: "6 min read",
    image:
      "https://images.pexels.com/photos/4246239/pexels-photo-4246239.jpeg?auto=compress&cs=tinysrgb&w=1200",
    intro:
      "QuickRun runs on the strength of thousands of delivery partners who keep the network moving all day long.",
    paragraphs: [
      "Reliability starts with transparent onboarding. Every new delivery partner joining QuickRun goes through training that covers navigation, safety, customer interaction, and quality standards.",
      "We provide clear earnings structures, incentives for peak hours, and support for common issues on the road, so that partners can focus on timely and safe deliveries.",
      "By analysing on-time performance, route efficiency, and feedback, we continuously refine our partner programs to keep the network fair, sustainable, and scalable.",
    ],
  },
  {
    slug: "designing-a-simple-grocery-shopping-experience",
    title: "Designing a Simple Grocery Shopping Experience",
    author: "Product & Design",
    date: "November 2025",
    readTime: "4 min read",
    image:
      "https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg?auto=compress&cs=tinysrgb&w=1200",
    intro:
      "The QuickRun app is designed so that anyone can find, compare, and order products in just a few taps.",
    paragraphs: [
      "We keep navigation shallow and predictable so that users can jump between categories, offers, and search results without feeling lost.",
      "High-contrast typography, clear pricing, and upfront information about availability and delivery time reduce decision friction while browsing.",
      "Small interaction details such as smooth transitions, clear states for cart actions, and instant feedback on changes help the experience feel responsive and trustworthy.",
    ],
  },
  {
    slug: "scaling-quickrun-to-new-cities",
    title: "Scaling QuickRun to New Cities",
    author: "Expansion Team",
    date: "October 2025",
    readTime: "7 min read",
    image:
      "https://images.pexels.com/photos/4484078/pexels-photo-4484078.jpeg?auto=compress&cs=tinysrgb&w=1200",
    intro:
      "Taking QuickRun to a new city means getting supply, operations, and technology ready in a coordinated way.",
    paragraphs: [
      "Before launch, we map demand clusters, traffic patterns, and local regulations to decide where to place our first dark stores.",
      "We then work with local suppliers, brands, and logistics partners to ensure that inventory, cold-chain needs, and last-mile capacities are ready for scale from day one.",
      "Post-launch, we closely track service levels, customer feedback, and repeat behaviour to fine-tune assortment, offers, and delivery coverage in each micro-market.",
    ],
  },
  {
    slug: "data-warehouse-journey-with-dbt",
    title: "Data Warehouse Journey With dbt",
    author: "Data & Engineering",
    date: "July 2026",
    readTime: "6 min read",
    image:
      "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1200",
    intro:
      "Our analytics matured quickly as business needs grew. This is a summary of our journey adopting dbt with Trino, and the modular patterns we used to scale our warehouse.",
    sections: [
      {
        title: "Challenges with the legacy pipeline",
        images: [
          "https://images.pexels.com/photos/50711/board-electronics-computer-data-50711.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=1200"
        ],
        body:
          "High build time, difficult RCAs, slow releases due to complexity, monolithic SQL causing redundancy, higher compute needs, and hard change-impact analysis made scaling painful.",
      },
      {
        title: "Foundation: moving to Trino + dbt",
        images: [
          "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/3861960/pexels-photo-3861960.jpeg?auto=compress&cs=tinysrgb&w=1200"
        ],
        body:
          "We migrated our analytics engine from Redshift to Trino and rebuilt pipelines using dbt-core with dbt-trino. dbt abstracts connections, threading, materialisations, and testing, enabling faster, trustworthy pipelines.",
      },
      {
        title: "Project structure & scaling",
        images: [
          "https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/4974913/pexels-photo-4974913.jpeg?auto=compress&cs=tinysrgb&w=1200"
        ],
        body:
          "We run 30+ marts and 900+ models: facts, dimensions, aggregates, finance, reporting, compliance. Function-specific models per mart, common sources in staging, macros grouped per mart, clear core/intermediate layers, snapshots for SCD-2.",
      },
      {
        title: "Advantages of dbt",
        images: [
          "https://images.pexels.com/photos/3861973/pexels-photo-3861973.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=1200"
        ],
        body:
          "Build time reduced dramatically via model reuse and macros. Staging→intermediate→core layers made RCAs faster. Source change impact analysis improved with parallel runs. Tests boosted quality. Materializations (view/table/incremental) shifted focus to design.",
      },
      {
        title: "Learnings & observability",
        images: [
          "https://images.pexels.com/photos/3861976/pexels-photo-3861976.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/3861975/pexels-photo-3861975.jpeg?auto=compress&cs=tinysrgb&w=1200"
        ],
        body:
          "Modular mindset replaced monolithic SQL. dbt-trino adaptor enabled fast incremental strategies (delete+insert). Jinja macros reduced SQL size. We instrumented query logging and built a Superset dashboard for runtime insights.",
      },
    ],
  },
  {
    slug: "continuous-corners-using-squircles-in-the-quickrun-app",
    title: "How we implemented continuous corners using squircles in the QuickRun app",
    author: "Product & Engineering",
    date: "March 2026",
    readTime: "4 min read",
    image:
      "https://images.pexels.com/photos/6697395/pexels-photo-6697395.jpeg?auto=compress&cs=tinysrgb&w=1200",
    intro:
      "Rounded rectangles are everywhere in modern interfaces. For QuickRun, we wanted our cards and components to feel even smoother, so we used squircle-shaped corners across the app.",
    sections: [
      {
        title: "Understanding continuous corners",
        image:
          "https://images.pexels.com/photos/4393663/pexels-photo-4393663.jpeg?auto=compress&cs=tinysrgb&w=1200",
        images: [
          "https://images.pexels.com/photos/4393663/pexels-photo-4393663.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/4393663/pexels-photo-4393663.jpeg?auto=compress&cs=tinysrgb&w=1200",
        ],
        body:
          "Classic rounded rectangles are easy to read but still have visible transitions where straight edges meet curved corners. With squircles, the transition from edge to corner is smoother, which makes cards feel more natural on high-density mobile screens.",
      },
      {
        title: "Choosing squircles for QuickRun",
        image:
          "https://images.pexels.com/photos/6697390/pexels-photo-6697390.jpeg?auto=compress&cs=tinysrgb&w=1200",
        images: [
          "https://images.pexels.com/photos/6697390/pexels-photo-6697390.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/6697390/pexels-photo-6697390.jpeg?auto=compress&cs=tinysrgb&w=1200",
        ],
        body:
          "In 1981, Xerox PARC introduced the first Graphical User Interface (GUI), marking a significant shift in computing. Over 43 years, rounded corners have evolved from a design embellishment to an industry standard in both software and hardware. Research shows that rounded rectangles, easier on the eyes and requiring less cognitive processing, now adorn modern screens.\n\nThe Macintosh, launched in 1984, played a crucial role in this evolution. Bill Atkinson’s QuickDraw tool, initially designed for circles and ellipses, evolved to render rounded rectangles - as suggested by Steve Jobs - enhancing familiarity and friendliness in design. This capability, introduced in a program called ‘RoundedRects’, reflected a pivotal moment in design history.\n\nEven though the affair of rounded rectangles with desktop GUI dates back to the mid 1980s, they gained widespread popularity in mobile GUI around June, 2013 with the launch of iOS 7. Compared to iOS 6, there was a notable shift in the use of rounded corners.",
      },
      {
        title: "Implementing the squircle layer",
        image:
          "https://images.pexels.com/photos/6697393/pexels-photo-6697393.jpeg?auto=compress&cs=tinysrgb&w=1200",
        images: [
          "https://images.pexels.com/photos/6697393/pexels-photo-6697393.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/6697393/pexels-photo-6697393.jpeg?auto=compress&cs=tinysrgb&w=1200",
        ],
        body:
          "We abstracted our card surfaces behind a reusable view layer that can draw squircle paths instead of simple rounded rectangles. This lets us control corner smoothness, borders, and shadows from a single configuration, instead of repeating style logic in every component.",
      },
      {
        title: "Benefits in everyday use",
        image:
          "https://images.pexels.com/photos/6697398/pexels-photo-6697398.jpeg?auto=compress&cs=tinysrgb&w=1200",
        images: [
          "https://images.pexels.com/photos/6697398/pexels-photo-6697398.jpeg?auto=compress&cs=tinysrgb&w=1200",
          "https://images.pexels.com/photos/6697398/pexels-photo-6697398.jpeg?auto=compress&cs=tinysrgb&w=1200",
        ],
        body:
          "With the squircle layer in place, product tiles, banners, and call-to-action cards share the same visual language. The result is a calmer, more cohesive interface where QuickRun’s brand feels consistent across screens without calling extra attention to the corners themselves.",
      },
    ],
  },
];

type BlogParams = {
  slug: string;
};

export default function BlogArticlePage({ params }: { params: BlogParams }) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const isSquircleArticle =
    post.slug === "continuous-corners-using-squircles-in-the-quickrun-app";

  return (
    <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center py-10 md:py-16">
      <div className="w-[94%] max-w-3xl mx-auto">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-gray-500 dark:text-gray-400 mb-3 uppercase">
            QuickRun Blog
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {post.title}
          </h1>
          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="font-medium">{post.author}</span>{" "}
            <span className="mx-1">•</span>
            <span>{post.date}</span>{" "}
            <span className="mx-1">•</span>
            <span>{post.readTime}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            {post.intro}
          </p>
        </header>

        {isSquircleArticle ? (
          <section className="space-y-8 md:space-y-10">
            {post.sections?.map((section, index) => (
              <article
                key={index}
                className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  {(section.images || [section.image]).map((img: string, i: number) => (
                    <div key={i} className="w-full h-52 md:h-64 overflow-hidden">
                      <img
                        src={img}
                        alt={section.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="p-5 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {section.body}
                  </p>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <article className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-full h-52 md:h-64 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 md:p-6 space-y-4">
              {post.paragraphs?.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        )}

        <div className="mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm md:text-base font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to blog
          </Link>
        </div>
      </div>
    </main>
  );
}
