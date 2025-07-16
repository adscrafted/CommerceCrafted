// Test script to create a niche and verify data collection
async function testNicheCreation() {
  const testData = {
    nicheId: `test_niche_${Date.now()}`,
    nicheName: 'Smart Sleep Products Test',
    asins: ['B08MVBRNKV', 'B07ZPKBL9V'],
    marketplace: 'US'
  };

  console.log('Creating test niche:', testData);

  try {
    const response = await fetch('http://localhost:3000/api/niches/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Niche creation result:', result);

    if (result.success) {
      console.log('\n✅ Niche created successfully!');
      console.log('Niche ID:', result.niche.id);
      console.log('Status:', result.niche.status);
      
      // Check status after 10 seconds
      setTimeout(async () => {
        const statusResponse = await fetch(`http://localhost:3000/api/niches/process?nicheId=${testData.nicheId}`);
        const status = await statusResponse.json();
        console.log('\n📊 Status after 10 seconds:', status);
      }, 10000);
    } else {
      console.error('❌ Failed to create niche:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testNicheCreation();