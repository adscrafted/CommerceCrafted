// Background Worker for Report Polling
// This can be run as a separate process or integrated with Next.js

import { getReportPollingService } from './report-polling-service'

export class ReportBackgroundWorker {
  private service = getReportPollingService()
  private isRunning = false
  
  async start() {
    if (this.isRunning) {
      console.log('Report worker already running')
      return
    }

    this.isRunning = true
    console.log('Starting report background worker...')

    // Start the polling service
    await this.service.startPolling()

    // Set up graceful shutdown
    process.on('SIGINT', () => this.stop())
    process.on('SIGTERM', () => this.stop())

    console.log('Report background worker started successfully')
  }

  stop() {
    console.log('Stopping report background worker...')
    this.isRunning = false
    this.service.stopPolling()
    process.exit(0)
  }
}

// For standalone execution
if (require.main === module) {
  const worker = new ReportBackgroundWorker()
  worker.start().catch(console.error)
}