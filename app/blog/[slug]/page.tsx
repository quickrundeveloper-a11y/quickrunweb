"use client";

import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

type BlogParams = {
  slug: string;
};

type FirestoreBlogPost = {
  slug: string;
  title: string;
  content: string;
  description?: string;
  author?: string;
  image?: string;
  createdAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  keywords?: string;
};

function FirestoreBlogArticle({ slug }: { slug: string }) {
  const [post, setPost] = useState<FirestoreBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (post) {
      // Title: Prefer metaTitle, fallback to title
      if (post.metaTitle) {
        document.title = post.metaTitle;
      } else {
        document.title = `${post.title} | QuickRun Blog`;
      }

      // Description: Prefer metaDescription, fallback to description
      const desc = post.metaDescription || post.description;
      if (desc) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement("meta");
          metaDesc.setAttribute("name", "description");
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute("content", desc);
      }

      // Keywords: Prefer metaKeywords, fallback to keywords
      const keys = post.metaKeywords || post.keywords;
      if (keys) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement("meta");
          metaKeywords.setAttribute("name", "keywords");
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute("content", keys);
      }
    }
  }, [post]);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        const ref = collection(db, "blog_posts");
        const q = query(
          ref,
          where("slug", "==", slug),
          where("status", "==", "published")
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const doc = snap.docs[0];
          const data: any = doc.data();

          const createdAt = data.created_at?.toDate
            ? data.created_at.toDate()
            : null;

          const createdAtLabel = createdAt
            ? createdAt.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : undefined;

          const content: string = data.content || data.description || "";

          if (isMounted) {
            setPost({
              slug: data.slug ?? doc.id,
              title: data.title ?? "QuickRun Blog",
              content,
              description: data.description,
              author: data.author ?? "QuickRun Team",
              image: data.image,
              createdAt: createdAtLabel,
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              metaKeywords: data.metaKeywords,
              keywords: data.keywords,
            });
          }
        } else if (isMounted) {
          setMissing(true);
        }
      } catch {
        if (isMounted) {
          setMissing(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center py-10 md:py-16">
        <div className="w-[94%] max-w-3xl mx-auto">
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            Loading article...
          </p>
        </div>
      </main>
    );
  }

  if (missing || !post) {
    return (
      <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center py-10 md:py-16">
        <div className="w-[94%] max-w-3xl mx-auto">
          <p className="text-gray-700 dark:text-gray-200 text-base md:text-lg mb-4">
            This article could not be found.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center text-sm md:text-base font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to blog
          </Link>
        </div>
      </main>
    );
  }

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
            <span className="font-medium">
              {post.author || "QuickRun Team"}
            </span>{" "}
            {post.createdAt && (
              <>
                <span className="mx-1">•</span>
                <span>{post.createdAt}</span>
              </>
            )}
          </div>
          {post.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
              {post.description}
            </p>
          )}
        </header>

        <article className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
          {post.image && (
            <div className="w-full h-52 md:h-64 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-5 md:p-6 space-y-4">
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>
          </div>
        </article>

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

export default function BlogArticlePage({ params }: { params: BlogParams }) {
  return <FirestoreBlogArticle slug={params.slug} />;
}
