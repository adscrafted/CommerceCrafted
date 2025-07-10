require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function checkNichesTable() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Checking niches table structure...')

  try {
    // Get niches table structure
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'niches')

    if (error) {
      console.log('Could not get table structure, trying alternative...')
      
      // Just query the table to see what columns exist
      const { data: sample, error: sampleError } = await supabase
        .from('niches')
        .select('*')
        .limit(1)
      
      if (!sampleError && sample && sample.length > 0) {
        console.log('\nNiches table columns:', Object.keys(sample[0]))
        console.log('\nSample data:', JSON.stringify(sample[0], null, 2))
      }
    } else {
      console.log('\nNiches table columns:')
      columns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`)
      })
    }

    // Check if there's a mismatch between expected and actual structure
    const { data: niches, error: nichesError } = await supabase
      .from('niches')
      .select('*')
      .limit(3)

    if (nichesError) {
      console.log('\nError querying niches:', nichesError.message)
    } else {
      console.log('\nFound', niches.length, 'niches in the table')
      if (niches.length > 0) {
        console.log('First niche structure:')
        Object.entries(niches[0]).forEach(([key, value]) => {
          console.log(`  ${key}: ${typeof value} (${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value})`)
        })
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkNichesTable()