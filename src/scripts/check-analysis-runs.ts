import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAnalysisRuns(nicheId: string) {
  console.log(`\nChecking analysis runs for niche: ${nicheId}\n`)
  
  try {
    // Check analysis runs
    const { data: runs, error } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('niche_id', nicheId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching analysis runs:', error)
      return
    }
    
    console.log(`Found ${runs?.length || 0} analysis runs:`)
    
    for (const run of runs || []) {
      console.log(`\nRun ID: ${run.id}`)
      console.log(`- Status: ${run.status}`)
      console.log(`- Created: ${run.created_at}`)
      console.log(`- Started: ${run.started_at || 'Not started'}`)
      console.log(`- Completed: ${run.completed_at || 'Not completed'}`)
      console.log(`- Total ASINs: ${run.total_asins}`)
      console.log(`- Processed ASINs: ${run.processed_asins}`)
      console.log(`- Failed ASINs: ${run.failed_asins}`)
      
      if (run.error_message) {
        console.log(`- Error: ${run.error_message}`)
      }
      
      if (run.processing_log) {
        console.log(`- Processing Log: ${JSON.stringify(run.processing_log, null, 2)}`)
      }
    }
    
    // Also check niche_products table
    const { data: nicheProducts, error: npError } = await supabase
      .from('niche_products')
      .select('*')
      .eq('niche_id', nicheId)
    
    console.log(`\nNiche Products: ${nicheProducts?.length || 0} records`)
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

checkAnalysisRuns('ignite_1753685009886')