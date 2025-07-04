# Amazon SP-API Integration Setup

This guide will help you set up Amazon SP-API integration to fetch real product data for CommerceCrafted.

## Prerequisites

1. **Amazon Seller Central Account**: You need an active Amazon Seller account
2. **Amazon Developer Account**: Register at [developer.amazonservices.com](https://developer.amazonservices.com)
3. **SP-API Application**: Create and register an SP-API application

## Step 1: Create SP-API Application

1. Go to [Amazon Developer Console](https://developer.amazon.com)
2. Navigate to "SP-API" section
3. Click "Create New Application"
4. Fill out the application details:
   - **Application Name**: CommerceCrafted
   - **Application Type**: Public Application
   - **Use Cases**: Analytics, Reports, Catalog Information

## Step 2: Generate API Credentials

After your application is approved, you'll receive:

- **Client ID**: Your application's unique identifier
- **Client Secret**: Your application's secret key
- **Refresh Token**: Long-lived token for authentication

## Step 3: Set Up AWS IAM Role

1. Create an AWS IAM role for SP-API access
2. Attach the necessary policies for SP-API operations
3. Note down the **Role ARN**

## Step 4: Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Amazon SP-API Configuration
AMAZON_ACCESS_KEY_ID=your-aws-access-key-id
AMAZON_SECRET_ACCESS_KEY=your-aws-secret-access-key
AMAZON_ROLE_ARN=arn:aws:iam::123456789012:role/YourSPAPIRole
AMAZON_CLIENT_ID=amzn1.application-oa2-client.xxxxx
AMAZON_CLIENT_SECRET=your-client-secret
AMAZON_REFRESH_TOKEN=your-refresh-token
AMAZON_MARKETPLACE_ID=ATVPDKIKX0DER
```

### Marketplace IDs

Common marketplace IDs:
- **US**: ATVPDKIKX0DER
- **UK**: A1F83G8C2ARO7P
- **DE**: A1PA6795UKMFR9
- **FR**: A13V1IB3VIYZZH
- **IT**: APJ6JRA9NG5V4
- **ES**: A1RKKUPIHCS9HS
- **CA**: A2EUQ1WTGCTBG2

## Step 5: API Capabilities

The integration provides access to:

### 1. Catalog Items API
- Product information and attributes
- Images and descriptions
- Product variations and specifications

### 2. Pricing API
- Current pricing information
- Price history tracking
- Competitive pricing data

### 3. Reports API
- Best Seller Rank (BSR) data
- Sales estimates
- Performance metrics

### 4. Enhanced Features
- **Rate Limiting**: Automatic throttling to respect API limits
- **Caching**: Smart caching to minimize API calls
- **Error Handling**: Robust error handling with fallbacks
- **Real-time Data**: Live product information updates

## Step 6: Testing the Integration

1. Start the development server:
```bash
npm run dev
```

2. Test the API endpoints:
```bash
# Search for products
curl "http://localhost:3000/api/products/search?q=headphones"

# Get product by ASIN
curl "http://localhost:3000/api/products/B08MVBRNKV"
```

## API Rate Limits

Amazon SP-API has strict rate limits:
- **Catalog Items**: 10 requests per second
- **Pricing**: 10 requests per second
- **Reports**: Varies by report type

Our implementation includes automatic rate limiting and retry mechanisms.

## Data Freshness

- **Product Information**: Cached for 30 minutes
- **Pricing Data**: Cached for 5 minutes
- **BSR Data**: Cached for 1 hour
- **Review Data**: Cached for 2 hours

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate credentials** regularly
4. **Monitor API usage** to avoid hitting limits
5. **Implement proper error handling** for production

## Troubleshooting

### Common Issues

1. **"Invalid credentials"**
   - Verify your Client ID and Secret
   - Check that your refresh token is valid
   - Ensure your AWS IAM role has correct permissions

2. **"Rate limit exceeded"**
   - Reduce API call frequency
   - Implement exponential backoff
   - Use caching more aggressively

3. **"Access denied"**
   - Check your SP-API application permissions
   - Verify marketplace ID is correct
   - Ensure IAM role has necessary policies

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=amazon-sp-api
```

## Production Deployment

For production deployment:

1. **Use secure credential storage** (AWS Secrets Manager, etc.)
2. **Implement monitoring** for API health and usage
3. **Set up alerts** for rate limit violations
4. **Use CDN caching** for product images
5. **Implement circuit breakers** for API failures

## Cost Considerations

- SP-API usage is generally free within rate limits
- AWS costs for IAM role and potential data transfer
- Consider implementing intelligent caching to minimize API calls

## Support Resources

- [Amazon SP-API Documentation](https://developer-docs.amazon.com/sp-api/)
- [SP-API GitHub Examples](https://github.com/amzn/selling-partner-api-models)
- [Developer Forums](https://sellercentral.amazon.com/forums/c/api)

## Legal Compliance

Ensure your application complies with:
- Amazon's API Terms of Service
- Data protection regulations (GDPR, CCPA)
- Amazon's scraping policies
- Intellectual property rights

---

**Note**: This integration is designed for legitimate business use cases. Always follow Amazon's terms of service and respect rate limits.