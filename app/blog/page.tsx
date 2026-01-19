"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

type BlogCard = {
  slug: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogCard[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const ref = collection(db, "blog_posts");
        const q = query(ref, where("status", "==", "published"));

        const snap = await getDocs(q);

        const firestorePosts: BlogCard[] = snap.docs.map((doc) => {
          const data: any = doc.data();

          const createdAt = data.created_at?.toDate
            ? data.created_at.toDate()
            : null;

          const contentSource: string =
            data.description || data.content || "";

          const words = contentSource.split(/\s+/).filter(Boolean);
          const approxMinutes = Math.max(1, Math.round(words.length / 200));

          return {
            slug: data.slug ?? doc.id,
            title: data.title ?? "QuickRun Blog",
            author: data.author ?? "QuickRun Team",
            date: createdAt
              ? createdAt.toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Recently",
            readTime: `${approxMinutes} min read`,
            image:
              data.image ||
              "https://images.pexels.com/photos/4393665/pexels-photo-4393665.jpeg?auto=compress&cs=tinysrgb&w=1200",
            excerpt:
              contentSource.slice(0, 220) +
              (contentSource.length > 220 ? "..." : ""),
          };
        });

        if (firestorePosts.length > 0) {
          setPosts(firestorePosts);
        }
      } catch {
        setPosts([]);
      }
    };

    fetchPosts();
  }, []);
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

        {posts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm md:text-base">
            No blog posts found.
          </p>
        ) : (
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
        )}
      </div>
    </main>
  );
}
