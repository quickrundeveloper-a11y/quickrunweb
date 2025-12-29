/**
 * ProductSchema Component - DEPRECATED
 * 
 * This component is no longer used. 
 * Product schema is now generated server-side in page.tsx for better SEO.
 * 
 * @deprecated Use server-side schema generation in page.tsx instead
 */

import { ProductSchemaProps } from './types/schema';

export default function ProductSchema({ productData, productId }: ProductSchemaProps) {
  console.warn('ProductSchema component is deprecated. Schema is now generated server-side.');
  return null;
}
