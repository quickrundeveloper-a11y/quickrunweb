"use client";

import { useState } from "react";

interface ShimmerImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export default function ShimmerImage({
  src,
  alt,
  className = "",
  ...props
}: ShimmerImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Shimmer Placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />
        </div>
      )}

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
}
