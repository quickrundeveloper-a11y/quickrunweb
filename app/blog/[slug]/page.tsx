"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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
  sections?: {
    heading?: string;
    paragraph?: string;
    image?: string;
  }[];
};

function FirestoreBlogArticle({ slug }: { slug: string }) {
  const [post, setPost] = useState<FirestoreBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        // Try fetching by slug first
        const q = query(
          ref,
          where("slug", "==", slug)
          // Removed status check to allow viewing unpublished/draft posts if linked
        );

        let snap = await getDocs(q);
        let data: any = null;
        let docId = "";

        if (!snap.empty) {
          const d = snap.docs[0];
          data = d.data();
          docId = d.id;
        } else {
          // If slug lookup failed, try looking up by ID (assuming slug might be an ID)
          try {
            const docRef = doc(db, "blog_posts", slug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              data = docSnap.data();
              docId = docSnap.id;
            }
          } catch (e) {
            // Ignore error if slug is not a valid ID format
          }
        }

        if (data) {
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

          // Fallback to 'heading' if 'title' is missing
          // Fallback to 'paragraph' if 'content'/'description' is missing
          const title = data.title || data.heading || "QuickRun Blog";
          const content: string =
            data.content || data.paragraph || data.description || "";
          
          // Use default image if none provided
          const image = data.image || "https://images.pexels.com/photos/4393665/pexels-photo-4393665.jpeg?auto=compress&cs=tinysrgb&w=1200";

          // Parse additional sections
          // Admin panel likely saves them as 'sections', 'additionalSections', or 'content_sections'
          const rawSections = data.sections || data.additionalSections || data.additional_sections || [];
          const sections = Array.isArray(rawSections) ? rawSections.map((s: any) => ({
            heading: s.heading || s.title,
            paragraph: s.paragraph || s.content || s.description,
            image: s.image
          })) : [];

          console.log("Fetched blog post data:", { 
            title, 
            contentLength: content.length, 
            hasImage: !!image,
            sectionsCount: sections.length 
          });

          if (isMounted) {
            setPost({
              slug: data.slug ?? docId,
              title,
              content,
              description: data.description,
              author: data.author ?? "QuickRun Team",
              image: image,
              createdAt: createdAtLabel,
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              metaKeywords: data.metaKeywords,
              keywords: data.keywords,
              sections,
            });
          }
        } else if (isMounted) {
          setMissing(true);
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
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
        <div className="w-[94%] max-w-5xl mx-auto">
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
        <div className="w-[94%] max-w-5xl mx-auto">
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

  const markdownComponents: any = {
    a: ({ node, ...props }: any) => (
      <a
        {...props}
        className="text-blue-600 dark:text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
    img: ({ node, ...props }: any) => (
      <img
        {...props}
        className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity my-6"
        onClick={() => setSelectedImage(props.src as string)}
      />
    ),
    h1: ({ node, ...props }: any) => (
      <h1 {...props} className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100" />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 {...props} className="text-xl md:text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100" />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 {...props} className="text-lg md:text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-gray-100" />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 {...props} className="text-base md:text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100" />
    ),
    h5: ({ node, ...props }: any) => (
      <h5 {...props} className="text-sm md:text-base font-semibold mt-3 mb-1 text-gray-900 dark:text-gray-100" />
    ),
    h6: ({ node, ...props }: any) => (
      <h6 {...props} className="text-xs md:text-sm font-semibold mt-3 mb-1 text-gray-900 dark:text-gray-100 uppercase tracking-wide" />
    ),
    ul: ({ node, ...props }: any) => (
      <ul {...props} className="list-disc list-outside ml-6 my-4 space-y-1" />
    ),
    ol: ({ node, ...props }: any) => (
      <ol {...props} className="list-decimal list-outside ml-6 my-4 space-y-1" />
    ),
    li: ({ node, ...props }: any) => (
      <li {...props} className="pl-1" />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote {...props} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-4 italic text-gray-600 dark:text-gray-400" />
    ),
  };

  return (
    <>
      <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center py-20 md:py-24">
        <div className="w-[94%] max-w-5xl mx-auto">
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
              <div 
                className="w-full h-52 md:h-96 overflow-hidden group cursor-pointer" 
                onClick={() => setSelectedImage(post.image!)}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-5 md:p-8 space-y-4 text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              <ReactMarkdown components={markdownComponents}>
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Additional Sections */}
            {post.sections && post.sections.length > 0 && (
              <div className="p-5 md:p-8 pt-0 space-y-8">
                {post.sections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    {section.heading && (
                      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                        {section.heading}
                      </h2>
                    )}
                    {section.paragraph && (
                      <div className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        <ReactMarkdown components={markdownComponents}>
                          {section.paragraph}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

      {/* Lightbox */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
        >
            <button 
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                onClick={() => setSelectedImage(null)}
            >
                <X size={32} />
            </button>
            <img 
                src={selectedImage} 
                alt="Full screen view" 
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()} 
            />
        </div>
      )}
    </>
  );
}

export default function BlogArticlePage({ params }: { params: BlogParams }) {
  return <FirestoreBlogArticle slug={params.slug} />;
}
