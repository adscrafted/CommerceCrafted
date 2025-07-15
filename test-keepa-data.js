// Test script to check Keepa data directly
const fetch = require('node-fetch');

const KEEPA_API_KEY = process.env.KEEPA_API_KEY || 'YOUR_API_KEY_HERE';
const ASIN = 'B0DZ9QN4KD'; // Tesla wipers

async function testKeepaData() {
  console.log('Testing Keepa data for ASIN:', ASIN);
  
  const url = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=1&asin=${ASIN}&stats=1&history=1&offers=20&fbafees=1&buybox=1&rating=1`;
  
  console.log('Fetching from:', url.replace(KEEPA_API_KEY, 'API_KEY_HIDDEN'));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.products && data.products[0]) {
      const product = data.products[0];
      
      console.log('\n=== BASIC INFO ===');
      console.log('Title:', product.title);
      console.log('Brand:', product.brand);
      console.log('Manufacturer:', product.manufacturer);
      console.log('Binding:', product.binding);
      
      console.log('\n=== IMAGES ===');
      console.log('imagesCSV:', product.imagesCSV);
      console.log('image:', product.image);
      console.log('images:', product.images);
      
      console.log('\n=== FEATURES/DESCRIPTION ===');
      console.log('features:', product.features);
      console.log('description:', product.description);
      
      console.log('\n=== DIMENSIONS ===');
      console.log('packageLength:', product.packageLength, '(hundredths of inches)');
      console.log('packageWidth:', product.packageWidth);
      console.log('packageHeight:', product.packageHeight);
      console.log('packageWeight:', product.packageWeight, '(hundredths of ounces)');
      
      console.log('\n=== CURRENT STATS ===');
      if (product.stats && product.stats.current) {
        console.log('Current price (index 0):', product.stats.current[0]);
        console.log('Current BSR (index 3):', product.stats.current[3]);
        console.log('Current rating (index 16):', product.stats.current[16]);
        console.log('Current reviews (index 17):', product.stats.current[17]);
      }
      
      console.log('\n=== CSV DATA ===');
      if (product.csv) {
        console.log('CSV array length:', product.csv.length);
        console.log('Has price history (csv[0]):', !!product.csv[0]);
        console.log('Has BSR history (csv[3]):', !!product.csv[3]);
      }
      
      // Save full response
      require('fs').writeFileSync(`keepa-test-${ASIN}.json`, JSON.stringify(product, null, 2));
      console.log(`\nFull response saved to keepa-test-${ASIN}.json`);
    } else {
      console.log('No product data returned');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testKeepaData();