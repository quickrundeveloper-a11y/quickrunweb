/**
 * TypeScript definitions for Schema components
 */

// Product data structure (matches your Firestore schema)
export interface Product {
  id: string;
  name: string;
  category?: string;
  imageUrls?: string[];
  description?: string;
  keyInformation?: {
    description?: string;
    ingredients?: string;
    concern?: string;
  };
  keyIngredients?: string;
  priceTiers?: PriceTier[];
  price?: number;
  mrp?: number;
  inStock?: boolean;
  stockQty?: number;
  sku?: string;
  keywords?: string;
  groceryVegType?: string;
  groceryEdible?: string;
  restaurentId?: string;
  
  // Additional fields for schema mapping
  itemName?: string;
  images?: Array<{ url: string }>;
  documentId?: string;
}

export interface PriceTier {
  price: number;
  mrp?: number;
  quantity?: string | number;
  unit?: string;
  percentOff?: number;
}

// Schema.org Product structure (for reference)
export interface ProductSchemaOrg {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  image: string | string[];
  description: string;
  sku: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  category?: string;
  keywords?: string;
  additionalProperty?: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string;
  }>;
  offers: {
    "@type": "Offer";
    url: string;
    priceCurrency: string;
    price: string;
    priceSpecification?: {
      "@type": "PriceSpecification";
      price: string;
      priceCurrency: string;
      valueAddedTaxIncluded: boolean;
    };
    availability: string;
    itemCondition: string;
    seller: {
      "@type": "Organization";
      name: string;
    };
    priceValidUntil: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: string;
  };
}

// Component prop types
export interface ProductSchemaProps {
  productData: Product;
  productId?: string;
}