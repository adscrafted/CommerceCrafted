const Stripe = require('stripe')
require('dotenv').config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function setupStripePricing() {
  console.log('Setting up Stripe products and prices...')
  
  try {
    // Create Pro Plan Product
    console.log('Creating Pro Plan product...')
    const proProduct = await stripe.products.create({
      name: 'CommerceCrafted Pro',
      description: 'Advanced Amazon product research with unlimited analyses and AI assistant',
      metadata: {
        plan: 'pro',
        tier: 'professional'
      }
    })
    
    // Create Pro Plan Price (Monthly)
    console.log('Creating Pro Plan monthly price...')
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2900, // $29.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      nickname: 'pro',
      metadata: {
        plan: 'pro',
        interval: 'monthly'
      }
    })
    
    // Create Pro Plan Annual Price (20% discount)
    console.log('Creating Pro Plan annual price...')
    const proAnnualPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 27840, // $278.40 for 12 months (20% discount)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      nickname: 'pro_annual',
      metadata: {
        plan: 'pro',
        interval: 'annual'
      }
    })
    
    // Create Enterprise Plan Product
    console.log('Creating Enterprise Plan product...')
    const enterpriseProduct = await stripe.products.create({
      name: 'CommerceCrafted Enterprise',
      description: 'Complete Amazon research platform with white-label reports, API access, and dedicated support',
      metadata: {
        plan: 'enterprise',
        tier: 'enterprise'
      }
    })
    
    // Create Enterprise Plan Price (Monthly)
    console.log('Creating Enterprise Plan monthly price...')
    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 9900, // $99.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      nickname: 'enterprise',
      metadata: {
        plan: 'enterprise',
        interval: 'monthly'
      }
    })
    
    // Create Enterprise Plan Annual Price (20% discount)
    console.log('Creating Enterprise Plan annual price...')
    const enterpriseAnnualPrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 95040, // $950.40 for 12 months (20% discount)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      nickname: 'enterprise_annual',
      metadata: {
        plan: 'enterprise',
        interval: 'annual'
      }
    })
    
    console.log('\n✅ Stripe products and prices created successfully!')
    console.log('\n📋 Add these environment variables to your .env.local:')
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`)
    console.log(`STRIPE_PRO_ANNUAL_PRICE_ID=${proAnnualPrice.id}`)
    console.log(`STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}`)
    console.log(`STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=${enterpriseAnnualPrice.id}`)
    
    console.log('\n📊 Products Created:')
    console.log(`Pro Product ID: ${proProduct.id}`)
    console.log(`Enterprise Product ID: ${enterpriseProduct.id}`)
    
    console.log('\n💰 Prices Created:')
    console.log(`Pro Monthly: ${proPrice.id} ($29/month)`)
    console.log(`Pro Annual: ${proAnnualPrice.id} ($278.40/year)`)
    console.log(`Enterprise Monthly: ${enterprisePrice.id} ($99/month)`)
    console.log(`Enterprise Annual: ${enterpriseAnnualPrice.id} ($950.40/year)`)
    
  } catch (error) {
    console.error('❌ Error setting up Stripe pricing:', error.message)
    process.exit(1)
  }
}

setupStripePricing()