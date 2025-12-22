/**
 * Schema Validator Component (Development Only)
 * 
 * Validates that the generated schema meets Google Rich Snippets requirements
 * Only renders in development mode
 */

interface SchemaValidatorProps {
  productData: any;
  productId?: string;
}

export default function SchemaValidator({ productData, productId }: SchemaValidatorProps) {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!productData) return null;

  const validationResults = {
    hasName: !!productData.name,
    hasImages: !!(productData.imageUrls && productData.imageUrls.length > 0),
    hasPrice: !!(productData.priceTiers && productData.priceTiers[0]?.price),
    hasDescription: !!(productData.keyInformation?.description || productData.description),
    hasAvailability: productData.inStock !== undefined,
    hasProductId: !!(productData.id || productData.documentId || productId),
    hasBrand: true, // Always "Quick Run Fast"
    hasCategory: !!productData.category
  };

  const allValid = Object.values(validationResults).every(Boolean);
  const validCount = Object.values(validationResults).filter(Boolean).length;
  const totalCount = Object.keys(validationResults).length;

  // Log validation results
  console.group('🔍 Schema Validation Results');
  console.log(`✅ Valid Fields: ${validCount}/${totalCount}`);
  console.log('📊 Field Status:', validationResults);
  console.log(`🎯 Google Rich Snippets Ready: ${allValid ? 'YES' : 'NO'}`);
  
  if (!allValid) {
    console.warn('⚠️ Missing required fields for optimal rich snippets');
    Object.entries(validationResults).forEach(([field, isValid]) => {
      if (!isValid) {
        console.warn(`❌ Missing: ${field}`);
      }
    });
  }
  
  console.groupEnd();

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: allValid ? '#4CAF50' : '#FF9800',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      Schema: {validCount}/{totalCount} {allValid ? '✅' : '⚠️'}
    </div>
  );
}