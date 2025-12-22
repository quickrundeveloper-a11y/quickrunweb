# ProductSchema Component

A reusable Dynamic Product Schema (JSON-LD) component for SEO using schema.org Product.

## Features

- ✅ Maps your product data to schema.org Product format
- ✅ Handles price tiers and offers
- ✅ Uses "Quick Run Fast" branding
- ✅ Supports your field structure (itemName, images, documentId, etc.)
- ✅ SSR-safe with Next.js App Router
- ✅ Automatic fallbacks for missing data

## Usage

```tsx
import ProductSchema from "@/app/components/ProductSchema";

// In your product page component
<ProductSchema 
  productData={productData} 
  productId={id} // Optional: fallback for document ID
/>
```

## Your Product Data Structure

The component works with your current data structure and maps it accordingly:

```javascript
const productData = {
  // Current structure → Schema mapping
  name: "Product Name",           // → itemName
  imageUrls: ["url1", "url2"],    // → images array
  id: "doc123",                   // → documentId
  category: "grocery",            // → category
  priceTiers: [                   // → priceTiers
    { price: 100, mrp: 120 }
  ],
  inStock: true,                  // → availability
  keyInformation: {               // → description
    description: "Product details"
  }
};
```

## Field Mapping

| Your Current Field | Schema Field | Implementation |
|-------------------|--------------|----------------|
| `product.name` | `itemName` | ✅ Direct mapping |
| `product.imageUrls` | `images[].url` | ✅ Array conversion |
| `product.keyInformation.description` | `description` | ✅ With fallbacks |
| `product.id` | `documentId` | ✅ Used as SKU |
| `product.priceTiers[0].price` | `offers.price` | ✅ First tier |
| `product.category` | `category` | ✅ Direct mapping |
| `product.inStock` | `availability` | ✅ InStock/OutOfStock |

## Generated Schema Example

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Fresh Organic Apples",
  "image": ["https://example.com/apple1.jpg"],
  "description": "Fresh products from Quick Run Fast",
  "brand": {
    "@type": "Brand",
    "name": "Quick Run Fast"
  },
  "sku": "doc123",
  "category": "grocery",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": "100",
    "availability": "https://schema.org/InStock",
    "url": "https://quickrunfast.com/product/doc123",
    "seller": {
      "@type": "Organization",
      "name": "Quick Run Fast"
    },
    "itemCondition": "https://schema.org/NewCondition"
  }
}
```

## SEO Benefits

- 🎯 Rich snippets in Google search results
- 💰 Price and availability display in search
- 🏪 "Quick Run Fast" brand information
- 📱 Better mobile search experience
- 🔍 Enhanced product discovery

## Google Rich Snippets Optimization

This implementation is specifically optimized for Google Rich Snippets with:

### ✅ Rich Snippet Features
- **Product Information**: Name, description, images, category
- **Pricing Display**: Price range, currency, availability status  
- **Star Ratings**: Aggregate ratings and review count
- **Brand Information**: "Quick Run Fast" branding
- **Shipping Details**: Delivery time and shipping costs
- **Product Identifiers**: SKU, MPN, GTIN for better indexing
- **Breadcrumb Navigation**: Site structure for better UX

### 🎯 Google Search Features Enabled
1. **Product Rich Cards**: Image, price, availability in search results
2. **Price Comparison**: Shows price range across different units
3. **Star Ratings**: Review stars displayed in search results  
4. **Brand Recognition**: "Quick Run Fast" brand appears in results
5. **Shipping Info**: "Free delivery" or shipping details shown
6. **Stock Status**: "In Stock" or "Out of Stock" indicators

### 📊 Schema Validation (Development)
- Real-time validation indicator in bottom-right corner
- Console logging of schema completeness
- Automatic field validation for Google requirements

## Testing Your Rich Snippets

### 1. Google Rich Results Test (Primary)
```
https://search.google.com/test/rich-results
```
- Enter your product page URL
- Check for "Product" schema detection
- Verify all fields are recognized
- Look for green checkmarks on all sections

### 2. Schema.org Validator (Secondary)  
```
https://validator.schema.org/
```
- Paste your page HTML or URL
- Verify no validation errors
- Check schema structure completeness

### 3. Google Search Console (Production)
- Monitor "Enhancements" → "Products" section
- Check for schema errors or warnings
- Track rich snippet performance

### 4. Live Testing
- Search for your product on Google
- Look for enhanced search results with:
  - Product images
  - Price display
  - Star ratings
  - "In Stock" status
  - Brand name

## Troubleshooting

### Common Issues

1. **Schema not appearing in search results**
   - Ensure the component is rendered on the page
   - Check browser console for warnings
   - Validate with Google Rich Results Test

2. **Missing product data**
   - Verify `productData` prop is passed correctly
   - Check that product data includes required fields: `name`, `priceTiers`

3. **Missing document ID (URL shows undefined)**
   - Pass `productId` prop as fallback: `<ProductSchema productData={product} productId={id} />`
   - Ensure product data includes `id` or `documentId` field

4. **Price not showing**
   - Ensure `priceTiers` array has at least one item with valid `price`
   - Check that price is a positive number