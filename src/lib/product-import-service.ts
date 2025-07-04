// Product Import/Export Service for CommerceCrafted
// Handles CSV imports, bulk operations, and data synchronization

export interface ProductImportData {
  asin: string
  title?: string
  category?: string
  subcategory?: string
  brand?: string
  price?: number
  imageUrl?: string
  tags?: string[]
}

export interface ImportResult {
  success: boolean
  totalProcessed: number
  successCount: number
  errorCount: number
  errors: ImportError[]
  duplicates: number
  newProducts: string[] // Product IDs
}

export interface ImportError {
  row: number
  asin?: string
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx'
  fields: string[]
  filters?: {
    status?: string[]
    category?: string[]
    opportunityScore?: { min?: number; max?: number }
    dateRange?: { start: Date; end: Date }
  }
  includeAnalysis?: boolean
}

export interface BulkOperationResult {
  success: boolean
  processedCount: number
  successCount: number
  errorCount: number
  errors: string[]
}

export class ProductImportService {
  
  // Import products from CSV file
  static async importFromCSV(file: File): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      duplicates: 0,
      newProducts: []
    }

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        throw new Error('File is empty')
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredFields = ['asin']
      
      // Validate required fields
      for (const field of requiredFields) {
        if (!headers.includes(field)) {
          result.errors.push({
            row: 0,
            field,
            message: `Required field '${field}' not found in header`,
            severity: 'error'
          })
        }
      }

      if (result.errors.length > 0) {
        return result
      }

      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const rowData: any = {}

        // Map values to fields
        headers.forEach((header, index) => {
          if (values[index]) {
            rowData[header] = values[index]
          }
        })

        result.totalProcessed++

        try {
          // Validate ASIN format
          if (!this.isValidASIN(rowData.asin)) {
            result.errors.push({
              row: i + 1,
              asin: rowData.asin,
              field: 'asin',
              message: 'Invalid ASIN format',
              severity: 'error'
            })
            result.errorCount++
            continue
          }

          // Check for duplicates
          const existingProduct = await this.findProductByASIN(rowData.asin)
          if (existingProduct) {
            result.duplicates++
            result.errors.push({
              row: i + 1,
              asin: rowData.asin,
              field: 'asin',
              message: 'Product already exists',
              severity: 'warning'
            })
            continue
          }

          // Process and validate data
          const productData = await this.processImportRow(rowData, i + 1)
          
          if (productData.errors.length > 0) {
            result.errors.push(...productData.errors)
            if (productData.errors.some(e => e.severity === 'error')) {
              result.errorCount++
              continue
            }
          }

          // Create product
          const newProduct = await this.createProductFromImport(productData.data)
          result.newProducts.push(newProduct.id)
          result.successCount++

        } catch (error) {
          result.errorCount++
          result.errors.push({
            row: i + 1,
            asin: rowData.asin,
            field: 'general',
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error'
          })
        }
      }

      result.success = result.errorCount === 0
      return result

    } catch (error) {
      result.errors.push({
        row: 0,
        field: 'file',
        message: error instanceof Error ? error.message : 'Failed to process file',
        severity: 'error'
      })
      return result
    }
  }

  // Import products from Amazon SP-API
  static async importFromAmazonAPI(asins: string[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalProcessed: asins.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      duplicates: 0,
      newProducts: []
    }

    try {
      for (let i = 0; i < asins.length; i++) {
        const asin = asins[i].trim()
        
        try {
          // Validate ASIN
          if (!this.isValidASIN(asin)) {
            result.errors.push({
              row: i + 1,
              asin,
              field: 'asin',
              message: 'Invalid ASIN format',
              severity: 'error'
            })
            result.errorCount++
            continue
          }

          // Check for duplicates
          const existingProduct = await this.findProductByASIN(asin)
          if (existingProduct) {
            result.duplicates++
            continue
          }

          // Fetch product data from Amazon API
          const amazonData = await this.fetchAmazonProductData(asin)
          
          if (!amazonData) {
            result.errors.push({
              row: i + 1,
              asin,
              field: 'api',
              message: 'Product not found on Amazon',
              severity: 'error'
            })
            result.errorCount++
            continue
          }

          // Create product
          const newProduct = await this.createProductFromAmazon(amazonData)
          result.newProducts.push(newProduct.id)
          result.successCount++

        } catch (error) {
          result.errorCount++
          result.errors.push({
            row: i + 1,
            asin,
            field: 'api',
            message: error instanceof Error ? error.message : 'API error',
            severity: 'error'
          })
        }
      }

      result.success = result.errorCount === 0
      return result

    } catch (error) {
      result.errors.push({
        row: 0,
        field: 'api',
        message: error instanceof Error ? error.message : 'API connection failed',
        severity: 'error'
      })
      return result
    }
  }

  // Export products to specified format
  static async exportProducts(productIds: string[], options: ExportOptions): Promise<Blob> {
    try {
      // Fetch products with their data
      const products = await this.getProductsForExport(productIds, options)
      
      switch (options.format) {
        case 'csv':
          return this.exportToCSV(products, options.fields)
        case 'json':
          return this.exportToJSON(products, options.fields)
        case 'xlsx':
          return this.exportToExcel(products, options.fields)
        default:
          throw new Error('Unsupported export format')
      }
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Bulk update products
  static async bulkUpdateProducts(
    productIds: string[], 
    updates: Partial<ProductImportData>
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: false,
      processedCount: productIds.length,
      successCount: 0,
      errorCount: 0,
      errors: []
    }

    try {
      for (const productId of productIds) {
        try {
          await this.updateProduct(productId, updates)
          result.successCount++
        } catch (error) {
          result.errorCount++
          result.errors.push(`Product ${productId}: ${error instanceof Error ? error.message : 'Update failed'}`)
        }
      }

      result.success = result.errorCount === 0
      return result

    } catch (error) {
      result.errors.push(`Bulk update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  // Bulk delete products
  static async bulkDeleteProducts(productIds: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: false,
      processedCount: productIds.length,
      successCount: 0,
      errorCount: 0,
      errors: []
    }

    try {
      for (const productId of productIds) {
        try {
          await this.deleteProduct(productId)
          result.successCount++
        } catch (error) {
          result.errorCount++
          result.errors.push(`Product ${productId}: ${error instanceof Error ? error.message : 'Delete failed'}`)
        }
      }

      result.success = result.errorCount === 0
      return result

    } catch (error) {
      result.errors.push(`Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  // Schedule bulk analysis
  static async bulkScheduleAnalysis(
    productIds: string[], 
    scheduleType: 'daily' | 'weekly' | 'monthly' | 'custom',
    customFrequency?: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: false,
      processedCount: productIds.length,
      successCount: 0,
      errorCount: 0,
      errors: []
    }

    try {
      for (const productId of productIds) {
        try {
          await this.scheduleProductAnalysis(productId, scheduleType, customFrequency)
          result.successCount++
        } catch (error) {
          result.errorCount++
          result.errors.push(`Product ${productId}: ${error instanceof Error ? error.message : 'Schedule failed'}`)
        }
      }

      result.success = result.errorCount === 0
      return result

    } catch (error) {
      result.errors.push(`Bulk scheduling failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  // Helper Methods

  private static isValidASIN(asin: string): boolean {
    // ASIN format: 10 characters, starts with B, followed by 9 alphanumeric
    const asinRegex = /^B[0-9A-Z]{9}$/
    return asinRegex.test(asin?.toUpperCase() || '')
  }

  private static async findProductByASIN(asin: string): Promise<any> {
    // In production, query database for existing product
    console.log(`Checking for existing product with ASIN: ${asin}`)
    return null // Mock: no duplicates found
  }

  private static async processImportRow(rowData: any, rowNumber: number): Promise<{
    data: ProductImportData
    errors: ImportError[]
  }> {
    const errors: ImportError[] = []
    const data: ProductImportData = {
      asin: rowData.asin?.toUpperCase()
    }

    // Validate and process each field
    if (rowData.title) {
      data.title = rowData.title.trim()
      if (data.title && data.title.length > 500) {
        errors.push({
          row: rowNumber,
          asin: data.asin,
          field: 'title',
          message: 'Title too long (max 500 characters)',
          severity: 'warning'
        })
      }
    }

    if (rowData.category) {
      data.category = rowData.category.trim()
    }

    if (rowData.subcategory) {
      data.subcategory = rowData.subcategory.trim()
    }

    if (rowData.brand) {
      data.brand = rowData.brand.trim()
    }

    if (rowData.price) {
      const price = parseFloat(rowData.price)
      if (isNaN(price) || price < 0) {
        errors.push({
          row: rowNumber,
          asin: data.asin,
          field: 'price',
          message: 'Invalid price value',
          severity: 'warning'
        })
      } else {
        data.price = price
      }
    }

    if (rowData.tags) {
      data.tags = rowData.tags.split(';').map((tag: string) => tag.trim()).filter(Boolean)
    }

    return { data, errors }
  }

  private static async createProductFromImport(data: ProductImportData): Promise<any> {
    // In production, create product in database
    console.log('Creating product from import:', data)
    return {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...data,
      status: 'active',
      createdAt: new Date()
    }
  }

  private static async fetchAmazonProductData(asin: string): Promise<any> {
    // In production, fetch from Amazon SP-API
    console.log(`Fetching Amazon data for ASIN: ${asin}`)
    
    // Mock data for demo
    return {
      asin,
      title: `Product ${asin}`,
      category: 'Electronics',
      brand: 'Generic Brand',
      price: Math.random() * 100 + 20,
      rating: 3.5 + Math.random() * 1.5,
      reviewCount: Math.floor(Math.random() * 5000),
      imageUrl: '/api/placeholder/200/200'
    }
  }

  private static async createProductFromAmazon(amazonData: any): Promise<any> {
    // In production, create product from Amazon data
    console.log('Creating product from Amazon data:', amazonData)
    return {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...amazonData,
      status: 'active',
      createdAt: new Date()
    }
  }

  private static async getProductsForExport(productIds: string[], options: ExportOptions): Promise<any[]> {
    // In production, fetch products from database with filters
    console.log('Fetching products for export:', productIds, options)
    
    // Mock data
    return productIds.map(id => ({
      id,
      asin: `B${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      title: `Product ${id}`,
      category: 'Electronics',
      price: Math.random() * 100 + 20,
      rating: 3.5 + Math.random() * 1.5,
      opportunityScore: Math.random() * 10
    }))
  }

  private static async exportToCSV(products: any[], fields: string[]): Promise<Blob> {
    const headers = fields.join(',')
    const rows = products.map(product => 
      fields.map(field => {
        const value = product[field]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(',')
    )
    
    const csvContent = [headers, ...rows].join('\n')
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  }

  private static async exportToJSON(products: any[], fields: string[]): Promise<Blob> {
    const filteredProducts = products.map(product => {
      const filtered: any = {}
      fields.forEach(field => {
        if (product[field] !== undefined) {
          filtered[field] = product[field]
        }
      })
      return filtered
    })
    
    const jsonContent = JSON.stringify(filteredProducts, null, 2)
    return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  }

  private static async exportToExcel(products: any[], fields: string[]): Promise<Blob> {
    // In production, use a library like xlsx to create Excel files
    console.log('Excel export not implemented in demo')
    
    // For now, return CSV as fallback
    return this.exportToCSV(products, fields)
  }

  private static async updateProduct(productId: string, updates: Partial<ProductImportData>): Promise<void> {
    // In production, update product in database
    console.log(`Updating product ${productId}:`, updates)
  }

  private static async deleteProduct(productId: string): Promise<void> {
    // In production, delete product from database
    console.log(`Deleting product ${productId}`)
  }

  private static async scheduleProductAnalysis(
    productId: string, 
    scheduleType: string, 
    customFrequency?: string
  ): Promise<void> {
    // In production, create analysis schedule
    console.log(`Scheduling ${scheduleType} analysis for product ${productId}`, customFrequency)
  }

  // Generate import template CSV
  static generateImportTemplate(): Blob {
    const headers = [
      'asin',
      'title',
      'category',
      'subcategory', 
      'brand',
      'price',
      'imageUrl',
      'tags'
    ]
    
    const sampleData = [
      'B08N5WRWNW,Wireless Bluetooth Headphones,Electronics,Audio > Headphones,TechSound,79.99,https://example.com/image.jpg,audio;wireless;featured',
      'B07X8K9PQR,Smart Security Camera,Electronics,Security > Cameras,SecureVision,149.99,https://example.com/camera.jpg,security;smart-home',
      'B09M8N7K6L,Ergonomic Office Chair,Home & Office,Furniture > Chairs,ComfortDesk,199.99,https://example.com/chair.jpg,office;furniture;ergonomic'
    ]
    
    const csvContent = [headers.join(','), ...sampleData].join('\n')
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  }

  // Get import/export analytics
  static async getImportExportAnalytics(timeframe: '7d' | '30d' | '90d' = '30d') {
    // Mock analytics data
    return {
      totalImports: 15,
      totalProducts: 1247,
      successRate: 94.2,
      avgProcessingTime: 2.3, // minutes
      topErrorTypes: [
        { error: 'Invalid ASIN format', count: 23 },
        { error: 'Duplicate product', count: 18 },
        { error: 'Missing required field', count: 12 }
      ],
      recentImports: [
        { date: new Date(), productsAdded: 45, source: 'CSV Upload' },
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000), productsAdded: 32, source: 'Amazon API' },
        { date: new Date(Date.now() - 48 * 60 * 60 * 1000), productsAdded: 67, source: 'CSV Upload' }
      ]
    }
  }
}