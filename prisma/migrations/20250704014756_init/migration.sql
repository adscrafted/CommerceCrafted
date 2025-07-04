-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "subscription_tier" TEXT NOT NULL DEFAULT 'free',
    "subscription_expires_at" DATETIME,
    "email_subscribed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asin" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "subcategory" TEXT,
    "brand" TEXT,
    "price" REAL,
    "bsr" INTEGER,
    "rating" REAL,
    "review_count" INTEGER,
    "image_urls" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "product_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "opportunity_score" INTEGER NOT NULL,
    "competition_score" INTEGER NOT NULL,
    "demand_score" INTEGER NOT NULL,
    "feasibility_score" INTEGER NOT NULL,
    "timing_score" INTEGER NOT NULL,
    "financial_analysis" JSONB NOT NULL,
    "market_analysis" JSONB NOT NULL,
    "competition_analysis" JSONB NOT NULL,
    "keyword_analysis" JSONB NOT NULL,
    "review_analysis" JSONB NOT NULL,
    "supply_chain_analysis" JSONB NOT NULL,
    "ai_generated_content" TEXT,
    "human_edited_content" TEXT,
    "focus_graph_data" JSONB,
    "analyst_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "product_analyses_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_analyses_analyst_id_fkey" FOREIGN KEY ("analyst_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "search_volume" INTEGER,
    "competition_score" REAL,
    "cpc" REAL,
    "trend_data" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "product_keywords" (
    "product_id" TEXT NOT NULL,
    "keyword_id" TEXT NOT NULL,
    "relevance_score" REAL NOT NULL,
    "position" INTEGER,

    PRIMARY KEY ("product_id", "keyword_id"),
    CONSTRAINT "product_keywords_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_keywords_keyword_id_fkey" FOREIGN KEY ("keyword_id") REFERENCES "keywords" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "featured_date" DATETIME NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_features_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "daily_features_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_products" (
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "saved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_id", "product_id"),
    CONSTRAINT "saved_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "saved_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "keyword_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "primary_keywords" JSONB NOT NULL,
    "long_tail_keywords" JSONB NOT NULL,
    "keyword_difficulty" JSONB NOT NULL,
    "seasonal_trends" JSONB NOT NULL,
    "ppc_metrics" JSONB NOT NULL,
    "search_intent" JSONB NOT NULL,
    "competitor_keywords" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "keyword_analyses_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ppc_strategies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "estimated_launch_cost" REAL NOT NULL,
    "suggested_bid_ranges" JSONB NOT NULL,
    "competitor_ad_analysis" JSONB NOT NULL,
    "campaign_structure" JSONB NOT NULL,
    "expected_acos" REAL NOT NULL,
    "break_even_acos" REAL NOT NULL,
    "launch_phases" JSONB NOT NULL,
    "budget_allocation" JSONB NOT NULL,
    "targeting_strategy" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ppc_strategies_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "optimal_order_quantity" INTEGER NOT NULL,
    "seasonal_demand" JSONB NOT NULL,
    "supplier_analysis" JSONB NOT NULL,
    "cash_flow_projections" JSONB NOT NULL,
    "risk_assessment" JSONB NOT NULL,
    "lead_times" JSONB NOT NULL,
    "quality_requirements" JSONB NOT NULL,
    "cost_breakdown" JSONB NOT NULL,
    "moq_analysis" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inventory_analyses_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "demand_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "market_size" JSONB NOT NULL,
    "growth_trends" JSONB NOT NULL,
    "geographic_demand" JSONB NOT NULL,
    "customer_behavior" JSONB NOT NULL,
    "seasonal_patterns" JSONB NOT NULL,
    "demand_drivers" JSONB NOT NULL,
    "market_segmentation" JSONB NOT NULL,
    "price_elasticity" JSONB NOT NULL,
    "forecasting" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "demand_analyses_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "competitor_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "top_competitors" JSONB NOT NULL,
    "price_analysis" JSONB NOT NULL,
    "market_share_data" JSONB NOT NULL,
    "competitive_advantages" JSONB NOT NULL,
    "threat_level" TEXT NOT NULL,
    "entry_barriers" JSONB NOT NULL,
    "competitor_strategies" JSONB NOT NULL,
    "swot_analysis" JSONB NOT NULL,
    "benchmarking" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "competitor_analyses_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "financial_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "roi_calculations" JSONB NOT NULL,
    "break_even_analysis" JSONB NOT NULL,
    "cash_flow_projections" JSONB NOT NULL,
    "risk_metrics" JSONB NOT NULL,
    "scenario_analysis" JSONB NOT NULL,
    "profitability_model" JSONB NOT NULL,
    "investment_requirements" JSONB NOT NULL,
    "fba_fee_analysis" JSONB NOT NULL,
    "tax_implications" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "financial_models_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_research_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT,
    "session_type" TEXT NOT NULL,
    "conversation" JSONB NOT NULL,
    "insights" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "follow_up_actions" JSONB NOT NULL,
    "session_status" TEXT NOT NULL DEFAULT 'active',
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ai_research_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_research_sessions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trend_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trend_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "growth_rate" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "opportunities" JSONB NOT NULL,
    "related_products" JSONB NOT NULL,
    "market_data" JSONB NOT NULL,
    "risk_factors" JSONB NOT NULL,
    "timeframe" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "user_id" TEXT,
    "subscription_type" TEXT NOT NULL DEFAULT 'daily_deals',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "preferences" JSONB,
    "subscribe_source" TEXT,
    "unsubscribe_token" TEXT NOT NULL,
    "subscribe_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_email_sent" DATETIME,
    "emails_sent" INTEGER NOT NULL DEFAULT 0,
    "clicks_count" INTEGER NOT NULL DEFAULT 0,
    "opens_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "newsletter_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "newsletter_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "html_content" TEXT,
    "campaign_type" TEXT NOT NULL,
    "featured_product_id" TEXT,
    "scheduled_date" DATETIME NOT NULL,
    "sent_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "recipient_count" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "open_rate" REAL,
    "click_rate" REAL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "newsletter_campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event" TEXT NOT NULL,
    "properties" TEXT,
    "user_id" TEXT,
    "timestamp" DATETIME NOT NULL,
    "user_agent" TEXT,
    "url" TEXT,
    "referrer" TEXT,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "products_asin_key" ON "products"("asin");

-- CreateIndex
CREATE UNIQUE INDEX "product_analyses_product_id_key" ON "product_analyses"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_keyword_key" ON "keywords"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "daily_features_featured_date_key" ON "daily_features"("featured_date");

-- CreateIndex
CREATE UNIQUE INDEX "ppc_strategies_product_id_key" ON "ppc_strategies"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_analyses_product_id_key" ON "inventory_analyses"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "demand_analyses_product_id_key" ON "demand_analyses"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "competitor_analyses_product_id_key" ON "competitor_analyses"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_models_product_id_key" ON "financial_models"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_unsubscribe_token_key" ON "newsletter_subscriptions"("unsubscribe_token");
