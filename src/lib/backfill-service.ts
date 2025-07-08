// Historical Data Backfill Service
import { AmazonSearchTermsService } from './amazon-search-terms-service'
import { getDuplicatePreventionService } from './duplicate-prevention-service'
import { getBigQueryService } from './bigquery-service'

export class BackfillService {
  private amazonService = new AmazonSearchTermsService()
  private duplicateService = getDuplicatePreventionService()
  private bigQueryService = getBigQueryService()

  // Get the Sunday date for a given week
  private getSundayOfWeek(date: Date): Date {
    const sunday = new Date(date)
    const dayOfWeek = sunday.getUTCDay()
    if (dayOfWeek !== 0) {
      // If not Sunday, go back to previous Sunday
      sunday.setUTCDate(sunday.getUTCDate() - dayOfWeek)
    }
    sunday.setUTCHours(0, 0, 0, 0)
    return sunday
  }

  // Get the Saturday date for a given week
  private getSaturdayOfWeek(date: Date): Date {
    const sunday = this.getSundayOfWeek(date)
    const saturday = new Date(sunday)
    saturday.setUTCDate(sunday.getUTCDate() + 6)
    saturday.setUTCHours(23, 59, 59, 999)
    return saturday
  }

  // Check how far back we can go with Amazon data
  async getMaxBackfillDate(): Promise<Date> {
    // Amazon appears to only keep data for 4-6 weeks based on testing
    // April reports (3+ months old) are failing with FATAL status
    const maxWeeksBack = 6
    const today = new Date()
    const maxBackfillDate = new Date(today)
    maxBackfillDate.setDate(today.getDate() - (maxWeeksBack * 7))
    
    return this.getSundayOfWeek(maxBackfillDate)
  }

  // Get all missing weeks that can be backfilled
  async getMissingWeeksForBackfill(marketplaceId: string = 'ATVPDKIKX0DER'): Promise<Date[]> {
    const maxBackfillDate = await this.getMaxBackfillDate()
    const today = new Date()
    const currentWeekStart = this.getSundayOfWeek(today)

    // Get missing weeks from our duplicate prevention service
    const missingWeekStrings = await this.duplicateService.getMissingWeeks(
      maxBackfillDate.toISOString().split('T')[0],
      currentWeekStart.toISOString().split('T')[0],
      marketplaceId
    )

    return missingWeekStrings.map(weekStr => {
      const date = new Date(weekStr + 'T00:00:00.000Z')
      return date
    })
  }

  // Request historical report for a specific week
  async requestHistoricalWeek(
    weekStartDate: Date,
    marketplaceId: string = 'ATVPDKIKX0DER'
  ): Promise<string> {
    // Check if this week is already processed
    const weekStartStr = weekStartDate.toISOString().split('T')[0]
    const alreadyExists = await this.duplicateService.isWeekAlreadyProcessed(weekStartStr, marketplaceId)
    
    if (alreadyExists) {
      throw new Error(`Week ${weekStartStr} already exists in database`)
    }

    // Calculate week end date (Saturday)
    const weekEndDate = this.getSaturdayOfWeek(weekStartDate)

    console.log(`📅 Requesting historical report for week: ${weekStartStr} to ${weekEndDate.toISOString().split('T')[0]}`)

    // Request the report from Amazon
    const reportMetadata = await this.amazonService.requestTopSearchTermsReport({
      startDate: weekStartDate,
      endDate: weekEndDate,
      marketplaceId
    })

    return reportMetadata.reportId
  }

  // Backfill multiple weeks (with rate limiting)
  async backfillHistoricalData(
    maxWeeks: number = 5, // Limit to avoid hitting API rate limits
    marketplaceId: string = 'ATVPDKIKX0DER'
  ): Promise<{
    requested: string[]
    skipped: string[]
    errors: string[]
  }> {
    const results = {
      requested: [] as string[],
      skipped: [] as string[],
      errors: [] as string[]
    }

    try {
      // Get missing weeks
      const missingWeeks = await this.getMissingWeeksForBackfill(marketplaceId)
      console.log(`📊 Found ${missingWeeks.length} missing weeks for backfill`)

      // Limit the number of weeks to process
      const weeksToProcess = missingWeeks.slice(0, maxWeeks)

      for (const weekDate of weeksToProcess) {
        try {
          const weekStr = weekDate.toISOString().split('T')[0]
          
          // Add delay to respect rate limits (15 minutes between requests)
          if (results.requested.length > 0) {
            console.log('⏳ Waiting 15 minutes for rate limit...')
            await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000))
          }

          const reportId = await this.requestHistoricalWeek(weekDate, marketplaceId)
          results.requested.push(`${weekStr}: ${reportId}`)
          
          console.log(`✅ Successfully requested report for week ${weekStr}: ${reportId}`)
          
        } catch (error) {
          const weekStr = weekDate.toISOString().split('T')[0]
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          
          if (errorMsg.includes('already exists')) {
            results.skipped.push(`${weekStr}: Already processed`)
            console.log(`⏭️  Skipped week ${weekStr}: Already processed`)
          } else {
            results.errors.push(`${weekStr}: ${errorMsg}`)
            console.error(`❌ Error processing week ${weekStr}:`, error)
          }
        }
      }

    } catch (error) {
      console.error('❌ Fatal error during backfill:', error)
      results.errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return results
  }

  // Check status of all pending reports and process completed ones
  async processCompletedReports(): Promise<{
    processed: string[]
    stillPending: string[]
    errors: string[]
  }> {
    // This would integrate with your existing polling system
    // to check report statuses and process completed ones
    
    // Implementation would:
    // 1. Get list of pending reports from database
    // 2. Check status of each with Amazon API  
    // 3. Download and process completed reports
    // 4. Update BigQuery with new data
    
    return {
      processed: [],
      stillPending: [],
      errors: []
    }
  }
}

export const getBackfillService = () => new BackfillService()