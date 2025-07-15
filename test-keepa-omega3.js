// Direct test of Keepa API for Omega 3 product
const https = require('https');

const KEEPA_API_KEY = process.env.KEEPA_API_KEY || '';
const ASIN = 'B014LDT0ZM'; // Omega 3

if (!KEEPA_API_KEY) {
  console.error('ERROR: KEEPA_API_KEY environment variable not set');
  process.exit(1);
}

const url = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=1&asin=${ASIN}&stats=1&history=1&offers=20&fbafees=1&buybox=1&rating=1`;

console.log('Fetching Keepa data for ASIN:', ASIN);
console.log('URL:', url.replace(KEEPA_API_KEY, 'KEY_HIDDEN'));

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.products && response.products[0]) {
        const product = response.products[0];
        
        console.log('\n=== BASIC INFO ===');
        console.log('Title:', product.title || 'N/A');
        console.log('Brand:', product.brand || 'N/A');
        console.log('Manufacturer:', product.manufacturer || 'N/A');
        
        console.log('\n=== STATS CURRENT ===');
        if (product.stats && product.stats.current) {
          console.log('Stats array length:', product.stats.current.length);
          console.log('Price (idx 0):', product.stats.current[0]);
          console.log('New price (idx 1):', product.stats.current[1]);
          console.log('BSR (idx 3):', product.stats.current[3]);
          console.log('Buy Box (idx 18):', product.stats.current[18]);
          
          // Look for non-negative values
          console.log('\nNon-negative values in stats:');
          product.stats.current.forEach((val, idx) => {
            if (val !== -1 && val !== null) {
              console.log(`  Index ${idx}: ${val}`);
            }
          });
        }
        
        console.log('\n=== CSV DATA ===');
        if (product.csv) {
          console.log('CSV array length:', product.csv.length);
          
          // Check each CSV index
          product.csv.forEach((data, idx) => {
            if (data && Array.isArray(data) && data.length > 0) {
              console.log(`CSV index ${idx}: ${data.length} data points`);
              // Show last value
              const lastValue = data[data.length - 1];
              if (lastValue !== -1) {
                console.log(`  Last value: ${lastValue}`);
              }
            }
          });
        }
        
        console.log('\n=== IMAGES ===');
        console.log('imagesCSV:', product.imagesCSV || 'N/A');
        console.log('image:', product.image || 'N/A');
        
        console.log('\n=== FEATURES ===');
        console.log('features:', product.features || 'N/A');
        
        // Save full response
        require('fs').writeFileSync(`keepa-omega3-${Date.now()}.json`, JSON.stringify(product, null, 2));
        console.log('\nFull response saved to keepa-omega3-*.json');
        
      } else {
        console.log('No product data returned');
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err);
});