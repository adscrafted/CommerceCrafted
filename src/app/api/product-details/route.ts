import { NextRequest, NextResponse } from 'next/server';

interface ProductDetailsRequest {
  asin: string;
  domain: number;
}

// Generate mock product details based on ASIN
function generateMockProductDetails(asin: string, domain: number) {
  // Extract some characteristics from ASIN for consistency
  const asinSeed = asin.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  // Generate consistent but varied data based on ASIN
  const basePrice = 1999 + (asinSeed % 3000); // Price between $19.99 - $49.99
  const rating = 35 + (asinSeed % 15); // Rating between 3.5 - 5.0 (in 0-50 scale)
  const reviewCount = 100 + (asinSeed % 5000); // Review count between 100 - 5100
  
  // Generate brand names based on ASIN
  const brands = ['Premium Choice', 'Elite Products', 'Natural Solutions', 'Pro Health', 'Smart Living', 'Pure Essence'];
  const brand = brands[asinSeed % brands.length];
  
  // Generate title based on ASIN pattern
  const productTypes = ['Supplement', 'Health Formula', 'Wellness Product', 'Vitamin Complex', 'Natural Extract'];
  const productType = productTypes[asinSeed % productTypes.length];
  const title = `${brand} ${productType} - Premium Quality ASIN: ${asin}`;
  
  return {
    asin,
    title,
    brand,
    currentPrice: basePrice, // In cents
    rating, // In 0-50 scale  
    reviewCount,
    imageUrl: `https://placehold.co/300x300/3B82F6/FFFFFF?text=${encodeURIComponent(brand)}`,
    isPrime: true,
    category: 'Health & Personal Care',
    subcategory: 'Vitamins & Dietary Supplements'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ProductDetailsRequest = await request.json();
    const { asin, domain } = body;

    if (!asin) {
      return NextResponse.json({
        success: false,
        message: 'ASIN is required'
      }, { status: 400 });
    }

    // Validate ASIN format
    if (!/^[A-Z0-9]{10}$/.test(asin.toUpperCase())) {
      return NextResponse.json({
        success: false,
        message: 'Invalid ASIN format'
      }, { status: 400 });
    }

    // TODO: Integrate with real Keepa API when KEEPA_API_KEY is available
    // For now, generate consistent mock data based on ASIN
    const mockProduct = generateMockProductDetails(asin.toUpperCase(), domain);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: mockProduct,
      source: 'mock'
    });

  } catch (error) {
    console.error('Product details error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch product details',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}