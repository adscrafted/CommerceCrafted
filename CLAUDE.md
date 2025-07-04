# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run Next.js ESLint

### Database Commands
- `npx prisma generate` - Generate Prisma client (outputs to `src/generated/prisma`)
- `npx prisma db push` - Push schema changes to database
- `npx prisma db seed` - Seed database with mock data
- `npx prisma studio` - Open Prisma Studio for database management

### Testing Commands
- `npm test` - Run tests (if configured)
- `npm run test:e2e` - Run end-to-end tests (if configured)

## Project Architecture

### Core Stack
- **Next.js 15** with App Router (`src/app/`)
- **TypeScript** with strict configuration
- **Prisma** ORM with SQLite (dev) / PostgreSQL (prod)
- **tRPC** for type-safe APIs
- **Tailwind CSS** + **shadcn/ui** components
- **NextAuth.js** for authentication

### Database Architecture
The database uses a comprehensive schema for Amazon product analysis:
- **Users** with role-based access (USER, ADMIN, ANALYST) and subscription tiers
- **Products** with Amazon-specific data (ASIN, BSR, ratings, reviews)
- **ProductAnalysis** with 5-score system (opportunity, competition, demand, feasibility, timing)
- **Keywords** with search volume and competition data
- **DailyFeature** for homepage featured products

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── products/          # Product pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── admin/            # Admin-specific components
├── lib/                   # Utilities and services
│   ├── mockData.ts       # Mock data service
│   └── utils.ts          # General utilities
├── server/               # tRPC backend
│   ├── procedures/       # tRPC procedures
│   └── routers/          # API routers
└── types/                # TypeScript definitions
```

### Key Features
- **Amazon Product Analysis** with comprehensive scoring system
- **Admin Dashboard** with real-time analytics
- **Role-based Access Control** (Free, Pro, Enterprise tiers)
- **Daily Featured Products** with AI-powered analysis
- **Advanced Search & Filtering** capabilities

### Mock Data System
The project uses a comprehensive mock data service (`src/lib/mockData.ts`) that provides:
- 1000+ realistic Amazon products across multiple categories
- Complete product analysis with 5-score system
- Financial projections and market intelligence
- Keyword analysis and review sentiment data

### Authentication & Authorization
- NextAuth.js integration with Prisma adapter
- Role-based permissions (USER, ADMIN, ANALYST)
- Subscription tier management (free, pro, enterprise)
- Session management with database storage

### API Integration Points
The project is designed for future integration with:
- **Amazon SP-API** for real product data
- **OpenAI API** for AI-powered analysis
- **Stripe** for payment processing
- **BigQuery** for analytics

### Development Notes
- Prisma client is generated to `src/generated/prisma/`
- Database uses SQLite for development, PostgreSQL for production
- shadcn/ui components use "new-york" style with CSS variables
- TypeScript path aliases configured for clean imports (`@/components`, `@/lib`, etc.)
- The project follows Next.js 15 App Router conventions

### Production Considerations
- Environment variables required for external API integrations
- Database migration strategy for Prisma schema changes
- The comprehensive README.md contains detailed deployment instructions
- Health check endpoints for monitoring service availability

## IdeaBrowser Implementation Plan

### Current Implementation Status
The project is being enhanced to replicate IdeaBrowser.com functionality for Amazon product research. See `IMPLEMENTATION_PLAN.md` for the complete 16-week roadmap.

### Key Enhancements in Progress
1. **Database Schema Evolution**: Adding deep research models for keyword analysis, PPC strategies, inventory analysis, demand forecasting, and competitor intelligence
2. **AI-Powered Research Agent**: Interactive conversational AI for product validation and market research
3. **Advanced Analytics**: Predictive modeling, trend analysis, and automated reporting
4. **Deep Research Features**: Multi-dimensional analysis including financial modeling and launch strategies

### New Database Models (Planned)
- `KeywordAnalysis` - Primary keywords, long-tail opportunities, seasonal trends, PPC metrics
- `PPCStrategy` - Launch costs, bid ranges, campaign structure, ACoS projections
- `InventoryAnalysis` - Order quantities, demand forecasting, supplier analysis
- `DemandAnalysis` - Market size, growth trends, customer behavior
- `CompetitorAnalysis` - Top competitors, price analysis, market share data
- `FinancialModel` - ROI calculations, cash flow projections, scenario analysis
- `AIResearchSession` - Interactive AI conversations and insights
- `TrendAnalysis` - Market trend tracking and opportunity identification

### Enhanced Features
- **Product of the Day**: IdeaBrowser-style comprehensive daily analysis
- **AI Research Agent**: Unlimited queries for Pro tier users
- **Deep Financial Modeling**: Amazon-specific cost calculations including FBA fees
- **Advanced Keyword Research**: Multi-dimensional keyword analysis with PPC optimization
- **Inventory Optimization**: Supply chain analysis and cash flow projections
- **Competitive Intelligence**: Real-time competitor monitoring and analysis

### Pricing Strategy (Mirroring IdeaBrowser)
- **Free**: Daily Amazon Opportunity
- **Hunter ($299/year)**: Database access, basic analysis, 10 AI queries/month
- **Pro ($999/year)**: Unlimited AI agent, advanced modeling, priority support
- **Enterprise (Custom)**: White-label solutions, custom integrations