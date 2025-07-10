# Niche API Documentation

## Overview

The Niche API provides comprehensive endpoints for managing product niches, including CRUD operations, product associations, analysis triggers, and data exports. All endpoints include authentication, rate limiting, and proper error handling.

## Authentication

All endpoints (except public search) require authentication via NextAuth session. The authentication middleware automatically:
- Validates the session
- Checks role permissions
- Verifies subscription tiers
- Adds user context to requests

## Rate Limiting

Different rate limits apply to different operations:
- **General API**: 60 requests/minute
- **Niche Operations**: 30 operations/5 minutes
- **Analysis**: 10 analyses/hour
- **Export**: 5 exports/hour

## Endpoints

### 1. List Niches
**GET** `/api/niches`

List all niches for the authenticated user with filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (active, archived, draft)
- `category` (optional): Filter by category
- `search` (optional): Search in name and description
- `page` (default: 1): Page number
- `pageSize` (default: 20, max: 100): Items per page
- `sortBy` (optional): Sort field (name, created_at, updated_at, product_count)
- `sortOrder` (optional): Sort direction (asc, desc)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Eco-Friendly Kitchen Products",
      "slug": "eco-friendly-kitchen-products",
      "category": "Home & Kitchen",
      "status": "active",
      "opportunity_score": 85,
      "product_count": 12,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 2. Create Niche
**POST** `/api/niches`

Create a new niche. Limited by subscription tier.

**Request Body:**
```json
{
  "name": "Eco-Friendly Kitchen Products",
  "description": "Sustainable kitchen items",
  "category": "Home & Kitchen",
  "subcategory": "Kitchen Storage",
  "tags": ["sustainable", "eco", "kitchen"],
  "status": "draft"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Eco-Friendly Kitchen Products",
    "slug": "eco-friendly-kitchen-products",
    ...
  },
  "message": "Niche created successfully"
}
```

### 3. Get Single Niche
**GET** `/api/niches/[id]`

Get detailed information about a specific niche.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Eco-Friendly Kitchen Products",
    "products": 12,
    "latestAnalysis": {
      "analysis_date": "2024-01-01T00:00:00Z",
      "metrics": {...},
      "ai_insights": {...}
    }
  }
}
```

### 4. Update Niche
**PUT** `/api/niches/[id]`

Update niche information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "status": "active",
  "tags": ["new", "tags"]
}
```

### 5. Delete Niche
**DELETE** `/api/niches/[id]`

Delete a niche and all associated data.

### 6. Get Niche Products
**GET** `/api/niches/[id]/products`

List all products in a niche.

**Response:**
```json
{
  "data": [
    {
      "niche_id": "uuid",
      "product_id": "uuid",
      "asin": "B08XYZ1234",
      "position": 1,
      "product": {
        "title": "Product Name",
        "price": 29.99,
        "bsr": 1234,
        "rating": 4.5
      }
    }
  ],
  "total": 12
}
```

### 7. Add Product to Niche
**POST** `/api/niches/[id]/products`

Add a product to a niche. Limited by subscription tier.

**Request Body:**
```json
{
  "asin": "B08XYZ1234",
  "notes": "High opportunity product",
  "position": 1
}
```

### 8. Remove Product from Niche
**DELETE** `/api/niches/[id]/products`

Remove a product from a niche.

**Request Body or Query:**
```json
{
  "asin": "B08XYZ1234"
}
```
Or use query parameter: `?asin=B08XYZ1234`

### 9. Trigger Analysis
**POST** `/api/niches/[id]/analyze`

Trigger analysis for a niche. Rate limited by subscription tier.

**Request Body:**
```json
{
  "type": "full",
  "force": false
}
```

**Analysis Types:**
- `full`: Complete analysis
- `keywords_only`: Only keyword analysis
- `competition_only`: Only competition analysis
- `demand_only`: Only demand analysis
- `refresh`: Quick refresh of existing data

**Response:**
```json
{
  "message": "Analysis started successfully",
  "data": {
    "jobId": "job-uuid",
    "type": "full",
    "estimatedTime": "5-10 minutes",
    "statusUrl": "/api/niches/[id]/status"
  }
}
```

### 10. Get Analysis Status
**GET** `/api/niches/[id]/status`

Check the status of an ongoing analysis.

**Response:**
```json
{
  "data": {
    "nicheId": "uuid",
    "status": "completed",
    "progress": 100,
    "lastAnalyzedAt": "2024-01-01T00:00:00Z",
    "nextAnalysisAvailable": "2024-01-02T00:00:00Z",
    "analysis": {
      "metrics": {...},
      "ai_insights": {...}
    }
  }
}
```

### 11. Export Niche Data
**GET** `/api/niches/[id]/export`

Export niche data in JSON or CSV format. Pro/Enterprise only.

**Query Parameters:**
- `format`: Export format (json, csv)
- `includeAnalysis`: Include analysis data (default: true)
- `includeProducts`: Include product list (default: true)

**Response:** File download with appropriate content type

### 12. Search Public Niches
**GET** `/api/niches/search`

Search public niches across all users. No authentication required.

**Query Parameters:**
- `q`: Search query (required)
- `category`: Filter by category
- `minOpportunityScore`: Minimum opportunity score
- `page`: Page number
- `pageSize`: Items per page

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...} // Optional additional details
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `SUBSCRIPTION_LIMIT_EXCEEDED`: Subscription limit reached
- `DUPLICATE_PRODUCT`: Product already in niche
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Subscription Limits

- **Free**: 1 niche, 10 products per niche
- **Pro**: 10 niches, 50 products per niche
- **Enterprise**: Unlimited niches and products

## TypeScript Types

```typescript
interface Niche {
  id: string
  name: string
  slug: string
  description?: string
  category: string
  subcategory?: string
  tags: string[]
  status: 'active' | 'archived' | 'draft'
  user_id: string
  opportunity_score?: number
  competition_level?: 'Low' | 'Medium' | 'High' | 'Very High'
  market_size?: number
  avg_price?: number
  total_monthly_revenue?: number
  product_count: number
  last_analyzed_at?: Date
  created_at: Date
  updated_at: Date
}

interface NicheProduct {
  niche_id: string
  product_id: string
  asin: string
  added_at: Date
  position?: number
  notes?: string
}
```