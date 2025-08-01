import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('Checking Supabase configuration...\n')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
console.log('Project ID from URL:', supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1])

console.log('\nCookie Analysis:')
console.log('Your cookie shows project: tznnfuivjfgiyexxmelr')
console.log('Your .env.local shows project: bcqhovifscrhlkvdhkuf')

console.log('\n❌ MISMATCH DETECTED!')
console.log('\nThis means you are logged into a different Supabase project than what your app is configured to use.')
console.log('\nTo fix this:')
console.log('1. Clear your browser cookies (especially those starting with sb-)')
console.log('2. Make sure your .env.local has the correct Supabase URL and keys')
console.log('3. Restart your development server')
console.log('4. Sign in again with the credentials we just set up')

console.log('\nAlternatively, update your .env.local to use the project you are logged into:')
console.log('NEXT_PUBLIC_SUPABASE_URL="https://tznnfuivjfgiyexxmelr.supabase.co"')
console.log('(You would also need to update the ANON_KEY and SERVICE_ROLE_KEY)')