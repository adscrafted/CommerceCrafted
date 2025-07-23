import { NextRequest, NextResponse } from 'next/server';

interface SearchRequest {
  searchTerm: string;
  domain: number;
}

// Generate dynamic mock data based on search term
async function generateMockResults(searchTerm: string, domain: number) {
  const searchLower = searchTerm.toLowerCase();
  
  // Define different product categories based on search terms
  const productCategories = {
    'berberine': {
      category: 'Health & Personal Care',
      subcategory: 'Vitamins & Dietary Supplements',
      products: [
        {
          asin: 'B08BER1234',
          title: 'Berberine HCL 1200mg - Premium Berberine Supplement for Blood Sugar Support',
          brand: 'Nature\'s Nutrition',
          currentPrice: 2495,
          rating: 44,
          reviewCount: 3241,
          isPrime: true
        },
        {
          asin: 'B07BER5678',
          title: 'Pure Berberine Extract 500mg - Natural Blood Sugar & Cholesterol Support',
          brand: 'VitalHealth',
          currentPrice: 1999,
          rating: 42,
          reviewCount: 1856,
          isPrime: true
        },
        {
          asin: 'B09BER9012',
          title: 'Organic Berberine Root Extract - 60 Veggie Capsules',
          brand: 'Herbal Secrets',
          currentPrice: 2799,
          rating: 43,
          reviewCount: 2134,
          isPrime: true
        }
      ]
    },
    'supplement': {
      category: 'Health & Personal Care',
      subcategory: 'Vitamins & Dietary Supplements',
      products: [
        {
          asin: 'B08SUP1234',
          title: `Premium ${searchTerm} - High Potency Formula`,
          brand: 'NutriMax',
          currentPrice: 2999,
          rating: 45,
          reviewCount: 1567,
          isPrime: true
        },
        {
          asin: 'B07SUP5678',
          title: `Natural ${searchTerm} Complex - 90 Capsules`,
          brand: 'Pure Essence',
          currentPrice: 2199,
          rating: 43,
          reviewCount: 892,
          isPrime: true
        }
      ]
    },
    'sleep': {
      category: 'Health & Personal Care',
      subcategory: 'Sleep & Snoring',
      products: [
        {
          asin: 'B08SLE1234',
          title: 'Sleep Mask with Bluetooth Headphones - 3D Contoured Eye Mask',
          brand: 'DreamTech',
          currentPrice: 2599,
          rating: 44,
          reviewCount: 15234,
          isPrime: true
        },
        {
          asin: 'B07SLE5678',
          title: 'Wireless Sleep Headphones - Bluetooth Sports Headband',
          brand: 'SleepSound',
          currentPrice: 2299,
          rating: 43,
          reviewCount: 8456,
          isPrime: true
        }
      ]
    },
    'default': {
      category: 'All Departments',
      subcategory: 'General',
      products: [
        {
          asin: 'B08GEN1234',
          title: `${searchTerm} - Premium Quality Product`,
          brand: 'Generic Brand',
          currentPrice: 2999,
          rating: 42,
          reviewCount: 1234,
          isPrime: true
        },
        {
          asin: 'B07GEN5678',
          title: `Best ${searchTerm} for Home Use`,
          brand: 'Home Essential',
          currentPrice: 1999,
          rating: 41,
          reviewCount: 567,
          isPrime: true
        },
        {
          asin: 'B09GEN9012',
          title: `Professional ${searchTerm} - High Quality`,
          brand: 'Pro Choice',
          currentPrice: 3499,
          rating: 43,
          reviewCount: 2156,
          isPrime: true
        },
        {
          asin: 'B08GEN3456',
          title: `${searchTerm} Deluxe Edition - Enhanced Features`,
          brand: 'Elite Products',
          currentPrice: 4299,
          rating: 45,
          reviewCount: 3421,
          isPrime: true
        },
        {
          asin: 'B07GEN7890',
          title: `Compact ${searchTerm} - Space Saving Design`,
          brand: 'Smart Solutions',
          currentPrice: 1799,
          rating: 40,
          reviewCount: 789,
          isPrime: true
        }
      ]
    }
  };

  // Match search term to category
  let selectedCategory = productCategories.default;
  for (const [key, category] of Object.entries(productCategories)) {
    if (searchLower.includes(key)) {
      selectedCategory = category;
      break;
    }
  }

  // Use mock products directly without additional API calls
  const productsWithImages = selectedCategory.products.map((product, index) => {
    // Simple placeholder images for mock data
    const imageColors = ['3B82F6', '10B981', '8B5CF6', 'F59E0B', 'EF4444', '6366F1', 'EC4899', '14B8A6', 'FB923C', 'A855F7'];
    return {
      ...product,
      imageUrl: `https://placehold.co/300x300/${imageColors[index % imageColors.length]}/FFFFFF?text=${encodeURIComponent(product.brand)}`
    };
  });

  return {
    products: productsWithImages,
    category: selectedCategory.category,
    subcategory: selectedCategory.subcategory
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { searchTerm, domain } = body;

    if (!searchTerm) {
      return NextResponse.json({
        success: false,
        message: 'Search term is required'
      }, { status: 400 });
    }

    // TODO: Integrate with real Keepa API when KEEPA_API_KEY is available
    // For now, use enhanced mock data
    const mockResults = await generateMockResults(searchTerm, domain);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      data: mockResults.products,
      totalResults: mockResults.products.length,
      source: 'mock',
      category: mockResults.category,
      subcategory: mockResults.subcategory
    });

  } catch (error) {
    console.error('Keepa search error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to search products',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}