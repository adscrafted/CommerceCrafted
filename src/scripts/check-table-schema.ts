import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function checkTableSchema() {
  const supabase = createServiceSupabaseClient()
  
  console.log('🔍 Checking niches_competition_analysis table...')
  
  // Try to insert a minimal record to see what columns exist
  const testData = {
    niche_id: 'test_schema_check',
    total_competitors: 1,
    competition_level: 'LOW',
    average_price: 0,
    average_rating: 0,
    average_reviews: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // First, try to select from the table to see if it exists
  const { data, error: selectError } = await supabase
    .from('niches_competition_analysis')
    .select('*')
    .limit(1)
  
  if (selectError) {
    console.error('❌ Error selecting from table:', selectError)
  } else {
    console.log('✅ Table exists')
    if (data && data.length > 0) {
      console.log('📊 Sample record columns:', Object.keys(data[0]))
    }
  }
  
  // Try to get table info via SQL
  const { data: columns, error: columnsError } = await supabase
    .rpc('get_table_columns', { table_name: 'niches_competition_analysis' })
    .select('*')
  
  if (!columnsError && columns) {
    console.log('📋 Table columns:', columns)
  }
  
  // Alternative: try a simple insert
  console.log('\n🧪 Testing minimal insert...')
  const { error: insertError } = await supabase
    .from('niches_competition_analysis')
    .insert(testData)
  
  if (insertError) {
    console.log('❌ Insert error:', insertError.message)
    console.log('💡 This error reveals required columns')
  } else {
    console.log('✅ Insert successful')
    
    // Clean up test data
    await supabase
      .from('niches_competition_analysis')
      .delete()
      .eq('niche_id', 'test_schema_check')
  }
}

checkTableSchema().catch(console.error)