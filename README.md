# 🛒 CommerceCrafted - Amazon Product Analysis Platform

> **Professional Amazon marketplace analysis platform inspired by IdeaBrowser, providing daily product insights, comprehensive scoring, and AI-powered analysis for Amazon sellers and entrepreneurs.**

![CommerceCrafted](https://img.shields.io/badge/CommerceCrafted-v1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Production Ready](https://img.shields.io/badge/Production-Ready-green)

## 🎯 **Project Overview**

CommerceCrafted is a comprehensive Amazon product analysis platform designed to help entrepreneurs and sellers identify high-opportunity products through data-driven insights, AI-powered analysis, and comprehensive market research tools.

### **Key Features**
- 📊 **Daily Product Analysis** with 5-score system (Financial, Demand, Competition, Keywords, Reviews)
- 🔍 **1000+ Product Database** with advanced filtering and search
- 🤖 **AI-Powered Analysis** using OpenAI for automated insights
- 📈 **Focus Graph Visualization** for keyword relationships
- 👥 **Multi-tier Access Control** (Free, Pro, Enterprise)
- 🔐 **Admin Dashboard** with comprehensive management tools
- 📱 **Responsive Design** optimized for all devices

## 🚀 **Live Demo**

**Development Server**: http://localhost:3000

**Demo Accounts**:
- **Admin**: admin@commercecrafted.com (password: password)
- **User**: user@example.com (password: password)
- **Analyst**: analyst@commercecrafted.com (password: password)

## 📋 **Table of Contents**

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Features Overview](#features-overview)
- [Technology Stack](#technology-stack)
- [Development Phases](#development-phases)
- [API Integration](#api-integration)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Contributing](#contributing)

## ⚡ **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Git

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/CommerceCrafted.git
cd CommerceCrafted/commercecrafted

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the application.

## 📁 **Project Structure**

```
commercecrafted/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── page.tsx           # Homepage with daily features
│   │   ├── products/          # Product listing and details
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Shadcn/ui components
│   │   └── admin/            # Admin-specific components
│   ├── lib/                   # Core services and utilities
│   │   ├── mockData.ts       # Mock data service
│   │   ├── trpc-client.ts    # Enhanced tRPC client
│   │   ├── auth-service.ts   # Authentication system
│   │   ├── analytics-service.ts # Analytics and metrics
│   │   ├── amazon-api.ts     # Amazon SP-API integration
│   │   ├── ai-service.ts     # AI-powered analysis
│   │   ├── config.ts         # Configuration management
│   │   └── deployment-service.ts # Production deployment
│   ├── server/               # Backend tRPC routers
│   │   └── routers/          # API endpoint definitions
│   └── types/                # TypeScript type definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Database seeding
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🌟 **Features Overview**

### **🏠 Homepage**
- **Daily Featured Product** with comprehensive analysis
- **Trending Products** showcase with opportunity scores
- **Interactive Product Cards** with hover effects
- **Professional Navigation** with user authentication
- **Real-time Data Loading** with loading states

### **📦 Products Page**
- **Advanced Search & Filtering** by name, ASIN, brand, category
- **Category-based Filtering** with dynamic counts
- **Opportunity Score Filtering** (Excellent 8+, Good 6+, Fair 4+)
- **Multiple Sorting Options** (opportunity, demand, recent, price)
- **Responsive Product Grid** with detailed information
- **Pagination Support** for large datasets

### **📊 Product Detail Pages**
- **Comprehensive Analysis Tabs** (Overview, Financial, Market, Competition, Keywords, Reviews)
- **Interactive Scoring System** with color-coded progress bars
- **Financial Projections** with revenue estimates and break-even analysis
- **Market Intelligence** with competitor analysis and trends
- **Keyword Analysis** with search volume and competition data
- **Review Sentiment Analysis** with positive/negative insights
- **Related Products** suggestions

### **⚙️ Admin Dashboard**
- **Multi-tab Interface** (Overview, Products, Analytics, Settings)
- **Real-time Analytics** with comprehensive metrics
- **Product Management** with CRUD operations
- **User Management** with role-based permissions
- **System Health Monitoring** with service status
- **Performance Metrics** by category and score distribution
- **Recent Activity Tracking** and alerts

### **🔐 Authentication System**
- **Role-based Access Control** (User, Admin, Analyst)
- **Plan-based Features** (Free, Pro, Enterprise)
- **Session Management** with persistent storage
- **Usage Tracking** and quota enforcement
- **Profile Management** with preferences

### **📈 Analytics & Monitoring**
- **Real-time Dashboard Metrics** and KPIs
- **User Engagement Analytics** with behavioral insights
- **Revenue and Business Intelligence** metrics
- **Market Trends Analysis** and predictions
- **Activity Logging** and user journey tracking
- **Performance Alerts** and anomaly detection
- **Data Export** in CSV, JSON, XLSX formats

## 🛠 **Technology Stack**

### **Frontend**
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **React Hooks** for state management
- **Lucide React** for icons

### **Backend**
- **tRPC** for type-safe APIs
- **Prisma** for database ORM
- **SQLite** (development) / **PostgreSQL** (production)
- **NextAuth.js** for authentication

### **External Integrations**
- **Amazon SP-API** for real product data
- **OpenAI API** for AI-powered analysis
- **Google BigQuery** for analytics
- **Stripe** for payments
- **SendGrid** for email notifications

### **Development Tools**
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking
- **Prisma Studio** for database management

## 📈 **Development Phases**

### **✅ Phase 1: Foundation (Completed)**
- Next.js 14 project setup with TypeScript
- Database schema with Prisma
- Basic UI components with Shadcn/ui
- Homepage and products page structure
- Admin dashboard foundation

### **✅ Phase 2: Core Features (Completed)**
- Complete database implementation with seeding
- tRPC API endpoints for all features
- Mock data service with realistic products
- Full frontend integration with working features
- Authentication and user management

### **✅ Phase 3: Frontend Polish (Completed)**
- Enhanced homepage with daily features
- Advanced product filtering and search
- Comprehensive admin dashboard
- Professional UI with loading states
- Responsive design for all devices

### **✅ Phase 4: Advanced Features (Completed)**
- Enhanced tRPC client infrastructure
- Centralized configuration system
- Complete authentication service
- Advanced analytics service
- Product detail pages with comprehensive analysis

### **✅ Phase 5: Production Ready (Completed)**
- Amazon SP-API integration service
- AI-powered content generation
- Deployment and monitoring services
- Production configuration management
- Complete documentation and deployment guides

## 🔌 **API Integration**

### **Amazon SP-API Integration**

```typescript
// Configure Amazon SP-API credentials
AMAZON_SP_API_ENABLED=true
AMAZON_SP_API_REFRESH_TOKEN=your_refresh_token
AMAZON_SP_API_CLIENT_ID=your_client_id
AMAZON_SP_API_CLIENT_SECRET=your_client_secret
AMAZON_MARKETPLACE_ID=ATVPDKIKX0DER

// Usage example
import { amazonAPI } from '@/lib/amazon-api'

const product = await amazonAPI.getProductByASIN('B08N5WRWNW')
const searchResults = await amazonAPI.searchProducts('wireless headphones')
const marketData = await amazonAPI.getMarketData('B08N5WRWNW')
```

### **AI Service Integration**

```typescript
// Configure AI service
OPENAI_API_KEY=your_openai_key
ENABLE_AI_GENERATION=true
AI_PROVIDER=openai

// Usage example
import { aiService } from '@/lib/ai-service'

const analysis = await aiService.analyzeProduct({
  product: productData,
  analysisType: 'full',
  context: { userPlan: 'pro' }
})

const content = await aiService.generateContent({
  product: productData,
  contentType: 'analysis',
  tone: 'professional',
  length: 'medium'
})
```

### **Analytics Integration**

```typescript
// Configure BigQuery
BIGQUERY_ENABLED=true
BIGQUERY_PROJECT_ID=your_project_id
BIGQUERY_DATASET_ID=commercecrafted

// Usage example
import { analyticsService } from '@/lib/analytics-service'

const metrics = await analyticsService.getDashboardMetrics()
const trends = await analyticsService.getMarketTrends('Electronics')
const insights = await analyticsService.getPredictiveInsights()
```

## 🚀 **Production Deployment**

### **Environment Variables**

Create `.env.local` for development and `.env.production` for production:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/commercecrafted"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Amazon SP-API
AMAZON_SP_API_ENABLED=true
AMAZON_SP_API_REFRESH_TOKEN="your-refresh-token"
AMAZON_SP_API_CLIENT_ID="your-client-id"
AMAZON_SP_API_CLIENT_SECRET="your-client-secret"

# AI Services
OPENAI_API_KEY="your-openai-key"
ENABLE_AI_GENERATION=true

# Analytics
BIGQUERY_ENABLED=true
BIGQUERY_PROJECT_ID="your-project"

# Email
SENDGRID_API_KEY="your-sendgrid-key"

# Payments
STRIPE_SECRET_KEY="your-stripe-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-public-key"

# Feature Flags
FEATURE_REALTIME_ANALYSIS=true
FEATURE_FOCUS_GRAPHS=true
FEATURE_PREMIUM=true
```

### **Docker Deployment**

```bash
# Build Docker image
docker build -t commercecrafted .

# Run with Docker Compose
docker-compose up -d

# Scale for production
docker-compose up -d --scale app=3
```

### **Kubernetes Deployment**

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=commercecrafted
kubectl get services
```

### **Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all required environment variables
```

### **Database Migration**

```bash
# Production database setup
npx prisma migrate deploy
npx prisma db seed

# Backup database
npx prisma db pull
```

## ⚙️ **Environment Configuration**

### **Development Environment**
- **Database**: SQLite (file-based)
- **Amazon API**: Disabled (uses mock data)
- **AI Service**: Mock provider
- **Authentication**: Local sessions
- **Analytics**: Disabled

### **Staging Environment**
- **Database**: PostgreSQL (staging)
- **Amazon API**: Enabled (sandbox)
- **AI Service**: OpenAI (limited quota)
- **Authentication**: Full authentication
- **Analytics**: BigQuery (test dataset)

### **Production Environment**
- **Database**: PostgreSQL (production)
- **Amazon API**: Enabled (production)
- **AI Service**: OpenAI (full access)
- **Authentication**: Full authentication
- **Analytics**: BigQuery (production dataset)
- **Monitoring**: Full monitoring and alerts

## 📊 **Performance & Monitoring**

### **Health Checks**
- Database connectivity
- Amazon SP-API status
- AI service availability
- External service health
- System resource utilization

### **Key Metrics**
- **Response Time**: < 2s average
- **Uptime**: 99.9% target
- **Error Rate**: < 1% target
- **User Engagement**: Session duration, page views
- **Business Metrics**: User conversion, revenue tracking

### **Monitoring Tools**
- **Health Checks**: Built-in service monitoring
- **Error Tracking**: Sentry integration ready
- **Performance**: Web Vitals monitoring
- **Analytics**: Google Analytics integration
- **Alerts**: Email, Slack, webhook notifications

## 🔧 **Development Commands**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma db seed   # Seed database

# Testing
npm test             # Run tests
npm run test:e2e     # Run E2E tests
npm run test:coverage # Coverage report
```

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **IdeaBrowser** for inspiration and concept
- **Amazon SP-API** for product data access
- **OpenAI** for AI-powered analysis capabilities
- **Vercel** for deployment platform
- **Shadcn/ui** for beautiful UI components

## 📞 **Support**

- **Documentation**: [GitHub Wiki](https://github.com/yourusername/CommerceCrafted/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/CommerceCrafted/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/CommerceCrafted/discussions)
- **Email**: support@commercecrafted.com

---

**Built with ❤️ for Amazon sellers and entrepreneurs**

**🚀 Ready for production deployment with full Amazon SP-API integration, AI-powered analysis, and comprehensive monitoring!** 