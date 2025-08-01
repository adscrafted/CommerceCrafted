/**
 * AI-Powered Seasonality Analysis Service
 * Analyzes seasonal patterns in sales rank and search volume data
 */

interface SalesRankDataPoint {
  date: string
  sales_rank: number
  asin?: string
  product_name?: string
}

interface SeasonalTrend {
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday' | 'back_to_school'
  months: string[]
  pattern: 'peak' | 'valley' | 'gradual_increase' | 'gradual_decrease' | 'stable' | 'volatile'
  strength: number // 0-100
  confidence: number // 0-100
  description: string
  drivers: string[]
  impact: 'high' | 'medium' | 'low'
  opportunity_score: number // 0-100
  risk_factors: string[]
  actionable_insights: string[]
  weekly_analysis?: {
    pickup_week?: string
    peak_week?: string
    fall_week?: string
  }
}

interface SeasonalAnalysisResult {
  overall_seasonality: 'highly_seasonal' | 'moderately_seasonal' | 'low_seasonal' | 'non_seasonal'
  seasonality_score: number // 0-100
  peak_months: string[]
  valley_months: string[]
  trends: SeasonalTrend[]
  market_insights: {
    best_launch_window: string
    worst_launch_window: string
    inventory_recommendations: Array<{
      period: string
      strategy: string
      stock_level: 'high' | 'medium' | 'low'
    }>
    promotional_calendar: Array<{
      period: string
      type: 'discount' | 'bundle' | 'advertising' | 'content'
      priority: 'high' | 'medium' | 'low'
    }>
  }
  competitive_insights: {
    seasonal_leaders: Array<{ season: string; competitors: string[] }>
    market_gaps: string[]
    timing_advantages: string[]
  }
  recommendations: {
    inventory_strategy: string
    marketing_calendar: string[]
    pricing_strategy: string
    content_strategy: string[]
    risk_mitigation: string[]
  }
}

class SeasonalityAnalysisAI {
  /**
   * Analyze seasonal patterns in sales rank data
   */
  async analyzeSeasonalPatterns(
    salesRankData: SalesRankDataPoint[],
    productNames: { [asin: string]: string },
    timeframe: string = '12 months'
  ): Promise<SeasonalAnalysisResult | null> {
    try {
      if (!salesRankData || salesRankData.length === 0) {
        console.log('No sales rank data provided for seasonality analysis')
        return null
      }

      // Prepare data summary for analysis
      const monthlyAverages = this.calculateMonthlyAverages(salesRankData)
      const seasonalVariance = this.calculateSeasonalVariance(monthlyAverages)
      const weeklyTransitions = this.analyzeWeeklyTrends(salesRankData)
      const trends = this.identifySeasonalTrends(monthlyAverages, seasonalVariance, weeklyTransitions)

      // Create analysis result
      const analysis: SeasonalAnalysisResult = {
        overall_seasonality: this.determineOverallSeasonality(seasonalVariance),
        seasonality_score: this.calculateSeasonalityScore(seasonalVariance),
        peak_months: this.identifyPeakMonths(monthlyAverages),
        valley_months: this.identifyValleyMonths(monthlyAverages),
        trends: trends,
        market_insights: this.generateMarketInsights(trends, monthlyAverages),
        competitive_insights: this.generateCompetitiveInsights(salesRankData, productNames),
        recommendations: this.generateRecommendations(trends, monthlyAverages)
      }

      console.log('✅ Seasonality analysis completed successfully')
      return analysis

    } catch (error) {
      console.error('❌ Error in seasonality analysis:', error)
      return null
    }
  }

  private calculateMonthlyAverages(data: SalesRankDataPoint[]): { [month: string]: number } {
    const monthlyData: { [month: string]: number[] } = {}
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // Group data by month
    data.forEach(point => {
      const date = new Date(point.date)
      const monthName = monthNames[date.getMonth()]
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = []
      }
      monthlyData[monthName].push(point.sales_rank)
    })

    // Calculate averages
    const averages: { [month: string]: number } = {}
    Object.entries(monthlyData).forEach(([month, ranks]) => {
      if (ranks.length > 0) {
        averages[month] = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length
      }
    })

    return averages
  }

  /**
   * Analyze weekly trends to identify specific weeks when seasons change
   */
  private analyzeWeeklyTrends(data: SalesRankDataPoint[]): { [season: string]: { pickupWeek?: string, fallWeek?: string, peakWeek?: string } } {
    if (data.length === 0) return {}

    // Group data by week
    const weeklyData: { [week: string]: { ranks: number[], date: Date } } = {}
    
    data.forEach(point => {
      const date = new Date(point.date)
      const year = date.getFullYear()
      const weekNumber = this.getWeekNumber(date)
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { ranks: [], date }
      }
      weeklyData[weekKey].ranks.push(point.sales_rank)
    })

    // Calculate weekly averages
    const weeklyAverages = Object.entries(weeklyData).map(([week, data]) => ({
      week,
      avgRank: data.ranks.reduce((sum, rank) => sum + rank, 0) / data.ranks.length,
      date: data.date
    })).sort((a, b) => a.date.getTime() - b.date.getTime())

    if (weeklyAverages.length === 0) return {}

    // Calculate overall average for comparison
    const overallAvg = weeklyAverages.reduce((sum, week) => sum + week.avgRank, 0) / weeklyAverages.length

    // Identify seasonal transition weeks
    const seasonalTransitions: { [season: string]: { pickupWeek?: string, fallWeek?: string, peakWeek?: string } } = {}

    // Holiday season analysis (weeks 44-52, weeks 1-2)
    const holidayWeeks = weeklyAverages.filter(week => {
      const weekNum = parseInt(week.week.split('-W')[1])
      return weekNum >= 44 || weekNum <= 2
    })
    
    if (holidayWeeks.length > 0) {
      const bestHolidayWeek = holidayWeeks.reduce((best, current) => 
        current.avgRank < best.avgRank ? current : best
      )
      
      // Find pickup week (first week performance improves significantly)
      const pickupWeek = weeklyAverages.find(week => {
        const weekNum = parseInt(week.week.split('-W')[1])
        return weekNum >= 40 && weekNum <= 46 && week.avgRank < overallAvg * 0.9
      })

      // Find fall week (first week performance drops significantly after holidays)
      const fallWeek = weeklyAverages.find(week => {
        const weekNum = parseInt(week.week.split('-W')[1])
        return weekNum >= 2 && weekNum <= 8 && week.avgRank > overallAvg * 1.1
      })

      seasonalTransitions['holiday'] = {
        pickupWeek: pickupWeek ? this.formatWeekForDisplay(pickupWeek.week, pickupWeek.date) : undefined,
        peakWeek: this.formatWeekForDisplay(bestHolidayWeek.week, bestHolidayWeek.date),
        fallWeek: fallWeek ? this.formatWeekForDisplay(fallWeek.week, fallWeek.date) : undefined
      }
    }

    // Back-to-school analysis (weeks 30-38)
    const backToSchoolWeeks = weeklyAverages.filter(week => {
      const weekNum = parseInt(week.week.split('-W')[1])
      return weekNum >= 30 && weekNum <= 38
    })

    if (backToSchoolWeeks.length > 0) {
      const bestBTSWeek = backToSchoolWeeks.reduce((best, current) => 
        current.avgRank < best.avgRank ? current : best
      )

      const pickupWeek = weeklyAverages.find(week => {
        const weekNum = parseInt(week.week.split('-W')[1])
        return weekNum >= 28 && weekNum <= 32 && week.avgRank < overallAvg * 0.9
      })

      const fallWeek = weeklyAverages.find(week => {
        const weekNum = parseInt(week.week.split('-W')[1])
        return weekNum >= 38 && weekNum <= 42 && week.avgRank > overallAvg * 1.1
      })

      seasonalTransitions['back_to_school'] = {
        pickupWeek: pickupWeek ? this.formatWeekForDisplay(pickupWeek.week, pickupWeek.date) : undefined,
        peakWeek: this.formatWeekForDisplay(bestBTSWeek.week, bestBTSWeek.date),
        fallWeek: fallWeek ? this.formatWeekForDisplay(fallWeek.week, fallWeek.date) : undefined
      }
    }

    return seasonalTransitions
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  private formatWeekForDisplay(weekKey: string, date: Date): string {
    const weekNum = parseInt(weekKey.split('-W')[1])
    const monthName = date.toLocaleDateString('en-US', { month: 'long' })
    const dayOfMonth = date.getDate()
    return `Week ${weekNum} (${monthName} ${dayOfMonth})`
  }

  private calculateSeasonalVariance(monthlyAverages: { [month: string]: number }): number {
    const values = Object.values(monthlyAverages).filter(v => !isNaN(v))
    if (values.length === 0) return 0

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    // Return coefficient of variation as percentage
    return (stdDev / mean) * 100
  }

  private determineOverallSeasonality(variance: number): 'highly_seasonal' | 'moderately_seasonal' | 'low_seasonal' | 'non_seasonal' {
    if (variance > 50) return 'highly_seasonal'
    if (variance > 30) return 'moderately_seasonal' 
    if (variance > 15) return 'low_seasonal'
    return 'non_seasonal'
  }

  private calculateSeasonalityScore(variance: number): number {
    // Convert variance to 0-100 score
    return Math.min(100, Math.round(variance * 2))
  }

  private identifyPeakMonths(monthlyAverages: { [month: string]: number }): string[] {
    const entries = Object.entries(monthlyAverages).filter(([, value]) => !isNaN(value))
    if (entries.length === 0) return []

    // Sales rank: lower is better, so we want months with lowest average rank
    entries.sort(([, a], [, b]) => a - b)
    return entries.slice(0, 3).map(([month]) => month)
  }

  private identifyValleyMonths(monthlyAverages: { [month: string]: number }): string[] {
    const entries = Object.entries(monthlyAverages).filter(([, value]) => !isNaN(value))
    if (entries.length === 0) return []

    // Sales rank: higher is worse, so we want months with highest average rank
    entries.sort(([, a], [, b]) => b - a)
    return entries.slice(0, 3).map(([month]) => month)
  }

  private identifySeasonalTrends(monthlyAverages: { [month: string]: number }, variance: number, weeklyTransitions: { [season: string]: { pickupWeek?: string, fallWeek?: string, peakWeek?: string } } = {}): SeasonalTrend[] {
    const trends: SeasonalTrend[] = []

    // If we have actual monthly data, analyze it for real trends
    if (Object.keys(monthlyAverages).length > 0) {
      return this.analyzeRealSeasonalTrends(monthlyAverages, variance, weeklyTransitions)
    }

    // Fallback: Define seasonal patterns based on common e-commerce trends
    const seasonalPatterns = [
      {
        season: 'holiday' as const,
        months: ['November', 'December'],
        expectedPattern: 'peak',
        drivers: ['Black Friday', 'Cyber Monday', 'Christmas shopping', 'Holiday gifts'],
        insights: ['Increase inventory 2 months before', 'Launch holiday campaigns in October', 'Optimize for gift keywords']
      },
      {
        season: 'winter' as const,
        months: ['January', 'February'],
        expectedPattern: 'valley',
        drivers: ['Post-holiday decline', 'New Year resolutions', 'Reduced spending'],
        insights: ['Clear excess inventory', 'Focus on health/fitness angles', 'Prepare for Q1 launch']
      },
      {
        season: 'spring' as const,
        months: ['March', 'April', 'May'],
        expectedPattern: 'gradual_increase',
        drivers: ['Spring cleaning', 'Outdoor activities', 'New product launches'],
        insights: ['Launch new products', 'Focus on outdoor/activity keywords', 'Prepare for summer']
      },
      {
        season: 'summer' as const,
        months: ['June', 'July', 'August'],
        expectedPattern: 'stable',
        drivers: ['Vacation season', 'Outdoor activities', 'Summer needs'],
        insights: ['Maintain steady inventory', 'Focus on vacation/outdoor themes', 'Prepare for back-to-school']
      },
      {
        season: 'back_to_school' as const,
        months: ['August', 'September'],
        expectedPattern: 'peak',
        drivers: ['Back to school shopping', 'New semester needs', 'Organizational products'],
        insights: ['Stock up in July', 'Target students/parents', 'Focus on organizational benefits']
      },
      {
        season: 'fall' as const,
        months: ['September', 'October'],
        expectedPattern: 'gradual_increase',
        drivers: ['Cooler weather', 'Indoor activities', 'Holiday preparation'],
        insights: ['Transition to holiday messaging', 'Focus on comfort/indoor themes', 'Prepare for holiday season']
      }
    ]

    seasonalPatterns.forEach(pattern => {
      const relevantMonths = pattern.months.filter(month => monthlyAverages[month] !== undefined)
      if (relevantMonths.length === 0) return

      const avgRankForSeason = relevantMonths.reduce((sum, month) => sum + monthlyAverages[month], 0) / relevantMonths.length
      const overallAvg = Object.values(monthlyAverages).reduce((sum, val) => sum + val, 0) / Object.values(monthlyAverages).length

      // Determine actual pattern
      let actualPattern = pattern.expectedPattern
      let strength = 50
      let confidence = 70

      if (pattern.expectedPattern === 'peak') {
        // For peaks, lower sales rank is better
        if (avgRankForSeason < overallAvg * 0.8) {
          actualPattern = 'peak'
          strength = Math.min(100, Math.round((overallAvg - avgRankForSeason) / overallAvg * 200))
        } else if (avgRankForSeason > overallAvg * 1.2) {
          actualPattern = 'valley'
          strength = Math.min(100, Math.round((avgRankForSeason - overallAvg) / overallAvg * 200))
        }
      }

      const trend: SeasonalTrend = {
        season: pattern.season,
        months: relevantMonths,
        pattern: actualPattern as any,
        strength: strength,
        confidence: confidence,
        description: this.generateTrendDescription(pattern.season, actualPattern, strength),
        drivers: pattern.drivers,
        impact: strength > 70 ? 'high' : strength > 40 ? 'medium' : 'low',
        opportunity_score: this.calculateOpportunityScore(actualPattern, strength),
        risk_factors: this.generateRiskFactors(pattern.season, actualPattern),
        actionable_insights: pattern.insights
      }

      trends.push(trend)
    })

    return trends
  }

  private analyzeRealSeasonalTrends(monthlyAverages: { [month: string]: number }, variance: number, weeklyTransitions: { [season: string]: { pickupWeek?: string, fallWeek?: string, peakWeek?: string } }): SeasonalTrend[] {
    const trends: SeasonalTrend[] = []
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
    
    // Calculate overall average for comparison
    const overallAvg = Object.values(monthlyAverages).reduce((sum, val) => sum + val, 0) / Object.values(monthlyAverages).length
    
    // Analyze each month's performance relative to average
    const monthlyPerformance = months.map(month => ({
      month,
      rank: monthlyAverages[month] || overallAvg,
      performance: monthlyAverages[month] ? (overallAvg - monthlyAverages[month]) / overallAvg : 0 // Positive = better than average (lower rank)
    }))

    // Identify continuous seasonal patterns
    const seasonalPeriods = [
      { season: 'winter' as const, months: ['January', 'February'], description: 'Winter Period' },
      { season: 'spring' as const, months: ['March', 'April', 'May'], description: 'Spring Season' },
      { season: 'summer' as const, months: ['June', 'July', 'August'], description: 'Summer Season' },
      { season: 'fall' as const, months: ['September', 'October'], description: 'Fall Season' },
      { season: 'holiday' as const, months: ['November', 'December'], description: 'Holiday Season' },
      { season: 'back_to_school' as const, months: ['August', 'September'], description: 'Back-to-School Period' }
    ]

    seasonalPeriods.forEach(period => {
      const relevantMonths = period.months.filter(month => monthlyAverages[month] !== undefined)
      if (relevantMonths.length === 0) return

      // Calculate average performance for this period
      const periodAverage = relevantMonths.reduce((sum, month) => sum + monthlyAverages[month], 0) / relevantMonths.length
      const performanceRatio = (overallAvg - periodAverage) / overallAvg
      
      // Determine pattern based on actual data
      let pattern: 'peak' | 'valley' | 'gradual_increase' | 'gradual_decrease' | 'stable' | 'volatile'
      let strength: number
      let confidence: number
      
      if (performanceRatio > 0.15) {
        pattern = 'peak'
        strength = Math.min(100, Math.round(performanceRatio * 200))
        confidence = Math.min(100, Math.round(variance > 20 ? 85 : 70))
      } else if (performanceRatio < -0.15) {
        pattern = 'valley'
        strength = Math.min(100, Math.round(Math.abs(performanceRatio) * 200))
        confidence = Math.min(100, Math.round(variance > 20 ? 85 : 70))
      } else if (Math.abs(performanceRatio) < 0.05) {
        pattern = 'stable'
        strength = 30
        confidence = Math.round(variance > 30 ? 60 : 80)
      } else {
        // Check if it's increasing or decreasing within the period
        if (relevantMonths.length > 1) {
          const firstMonth = monthlyAverages[relevantMonths[0]]
          const lastMonth = monthlyAverages[relevantMonths[relevantMonths.length - 1]]
          pattern = firstMonth > lastMonth ? 'gradual_increase' : 'gradual_decrease' // Lower rank = better performance
        } else {
          pattern = 'stable'
        }
        strength = Math.min(100, Math.round(Math.abs(performanceRatio) * 300))
        confidence = Math.round(variance > 25 ? 75 : 85)
      }

      // Generate contextual drivers and insights based on season and actual performance
      const drivers = this.generateContextualDrivers(period.season, pattern)
      const insights = this.generateContextualInsights(period.season, pattern, strength)

      const trend: SeasonalTrend = {
        season: period.season,
        months: relevantMonths,
        pattern: pattern,
        strength: strength,
        confidence: confidence,
        description: this.generateDataDrivenDescription(period.description, pattern, strength, performanceRatio),
        drivers: drivers,
        impact: strength > 60 ? 'high' : strength > 30 ? 'medium' : 'low',
        opportunity_score: this.calculateDataDrivenOpportunityScore(pattern, strength, performanceRatio),
        risk_factors: this.generateDataDrivenRiskFactors(period.season, pattern, strength),
        actionable_insights: insights,
        weekly_analysis: weeklyTransitions[period.season] || undefined
      }

      trends.push(trend)
    })

    // Sort by strength (most significant trends first)
    return trends.sort((a, b) => b.strength - a.strength)
  }

  private generateDataDrivenDescription(season: string, pattern: string, strength: number, performanceRatio: number): string {
    const strengthDesc = strength > 70 ? 'strong' : strength > 40 ? 'moderate' : 'weak'
    const performanceDesc = performanceRatio > 0 ? 'significantly better' : performanceRatio < 0 ? 'notably worse' : 'similar'
    
    switch (pattern) {
      case 'peak':
        return `${season} shows a ${strengthDesc} sales peak with ${performanceDesc} performance than the yearly average (${(performanceRatio * 100).toFixed(1)}% improvement).`
      case 'valley':
        return `${season} represents a ${strengthDesc} low period with ${performanceDesc} performance than average (${(Math.abs(performanceRatio) * 100).toFixed(1)}% decline).`
      case 'gradual_increase':
        return `${season} demonstrates a ${strengthDesc} upward trend throughout the period.`
      case 'gradual_decrease':
        return `${season} shows a ${strengthDesc} downward trend in performance.`
      case 'stable':
        return `${season} maintains relatively stable performance close to the yearly average.`
      default:
        return `${season} exhibits ${strengthDesc} seasonal variation.`
    }
  }

  private generateContextualDrivers(season: string, pattern: string): string[] {
    const driverMap: { [key: string]: string[] } = {
      'holiday': pattern === 'peak' ? 
        ['Black Friday surge', 'Cyber Monday boost', 'Christmas shopping rush', 'Gift-giving season', 'Holiday bonuses'] :
        ['Post-holiday spending fatigue', 'Returns and exchanges', 'Credit card bills'],
      'winter': pattern === 'valley' ?
        ['Post-holiday decline', 'Seasonal affective patterns', 'Reduced discretionary spending', 'Cold weather impact'] :
        ['Winter product demand', 'Indoor activity focus', 'New Year motivation'],
      'spring': ['Spring cleaning surge', 'Outdoor activity return', 'Tax refund spending', 'Seasonal renewal mindset'],
      'summer': ['Vacation spending', 'Outdoor lifestyle', 'Summer product demand', 'Travel and leisure focus'],
      'fall': ['Back-to-school preparation', 'Cooler weather transition', 'Holiday season preparation'],
      'back_to_school': ['Student preparation', 'Parent purchasing', 'Academic year startup', 'Organizational needs']
    }

    return driverMap[season] || ['Seasonal consumer behavior', 'Market dynamics', 'Competitive factors']
  }

  private generateContextualInsights(season: string, pattern: string, strength: number): string[] {
    if (pattern === 'peak' && strength > 50) {
      return [
        `Increase inventory 2-3 months before ${season}`,
        `Launch targeted campaigns 1 month early`,
        `Optimize pricing for peak demand`,
        'Monitor competitor stock levels'
      ]
    } else if (pattern === 'valley' && strength > 30) {
      return [
        `Reduce inventory during ${season}`,
        'Consider promotional pricing',
        'Focus on other markets/channels',
        'Plan product launches for recovery period'
      ]
    } else {
      return [
        `Maintain steady strategy during ${season}`,
        'Monitor trends for early signals',
        'Prepare for next seasonal shift'
      ]
    }
  }

  private calculateDataDrivenOpportunityScore(pattern: string, strength: number, performanceRatio: number): number {
    let baseScore = 50
    
    if (pattern === 'peak') {
      baseScore = 80 + Math.min(20, strength / 5)
    } else if (pattern === 'valley') {
      baseScore = Math.max(20, 60 - strength)
    } else if (pattern === 'gradual_increase') {
      baseScore = 70 + Math.min(20, strength / 4)
    }
    
    // Adjust based on actual performance data
    if (performanceRatio > 0.2) baseScore += 10
    if (performanceRatio < -0.2) baseScore -= 15
    
    return Math.min(100, Math.max(10, Math.round(baseScore)))
  }

  private generateDataDrivenRiskFactors(season: string, pattern: string, strength: number): string[] {
    const risks = []
    
    if (pattern === 'peak' && strength > 60) {
      risks.push(`High inventory risk if ${season} demand doesn't materialize`)
      risks.push('Increased competition during peak season')
      risks.push('Supply chain strain during high demand')
    }
    
    if (pattern === 'valley' && strength > 40) {
      risks.push(`Revenue decline risk during ${season}`)
      risks.push('Excess inventory carrying costs')
      risks.push('Cash flow challenges in low season')
    }
    
    if (strength > 70) {
      risks.push('High volatility creates forecasting challenges')
    }
    
    return risks.length > 0 ? risks : ['Monitor seasonal variations for unexpected changes']
  }

  private generateTrendDescription(season: string, pattern: string, strength: number): string {
    const seasonName = season.replace('_', ' ').toLowerCase()
    const strengthDesc = strength > 70 ? 'strong' : strength > 40 ? 'moderate' : 'weak'
    
    switch (pattern) {
      case 'peak':
        return `${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)} shows a ${strengthDesc} sales peak with significantly better performance than average.`
      case 'valley':
        return `${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)} represents a ${strengthDesc} low period with reduced sales performance.`
      case 'gradual_increase':
        return `${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)} demonstrates a ${strengthDesc} upward trend in sales performance.`
      case 'gradual_decrease':
        return `${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)} shows a ${strengthDesc} downward trend in sales performance.`
      default:
        return `${seasonName.charAt(0).toUpperCase() + seasonName.slice(1)} maintains relatively stable performance.`
    }
  }

  private calculateOpportunityScore(pattern: string, strength: number): number {
    switch (pattern) {
      case 'peak':
        return Math.min(100, strength + 20) // High opportunity during peaks
      case 'valley':
        return Math.max(20, 80 - strength) // Lower opportunity during valleys
      case 'gradual_increase':
        return Math.min(90, strength + 10)
      default:
        return 60
    }
  }

  private generateRiskFactors(season: string, pattern: string): string[] {
    const risks = []
    
    if (pattern === 'peak') {
      risks.push('Inventory stockouts during high demand')
      risks.push('Increased competition during peak season')
    }
    
    if (pattern === 'valley') {
      risks.push('Excess inventory during low demand periods')
      risks.push('Reduced profit margins due to lower sales')
    }
    
    if (season === 'holiday') {
      risks.push('Supply chain delays during holiday season')
      risks.push('Increased advertising costs due to competition')
    }
    
    return risks
  }

  private generateMarketInsights(trends: SeasonalTrend[], monthlyAverages: { [month: string]: number }) {
    const peakSeasons = trends.filter(t => t.pattern === 'peak')
    const valleySeasons = trends.filter(t => t.pattern === 'valley')

    return {
      best_launch_window: peakSeasons.length > 0 
        ? `Launch 2-3 months before ${peakSeasons[0].season.replace('_', ' ')} season (${peakSeasons[0].months.join(', ')}) for maximum impact`
        : 'Spring (March-May) offers the best launch window for most products',
      worst_launch_window: valleySeasons.length > 0
        ? `Avoid launching during ${valleySeasons[0].season.replace('_', ' ')} season (${valleySeasons[0].months.join(', ')}) due to low demand`
        : 'January-February typically show the lowest performance',
      inventory_recommendations: this.generateInventoryRecommendations(trends),
      promotional_calendar: this.generatePromotionalCalendar(trends)
    }
  }

  private generateInventoryRecommendations(trends: SeasonalTrend[]) {
    const recommendations = []
    
    trends.forEach(trend => {
      if (trend.pattern === 'peak') {
        recommendations.push({
          period: `2 months before ${trend.season.replace('_', ' ')}`,
          strategy: 'Increase inventory levels significantly',
          stock_level: 'high' as const
        })
      } else if (trend.pattern === 'valley') {
        recommendations.push({
          period: `During ${trend.season.replace('_', ' ')}`,
          strategy: 'Reduce inventory and clear excess stock',
          stock_level: 'low' as const
        })
      }
    })

    return recommendations
  }

  private generatePromotionalCalendar(trends: SeasonalTrend[]) {
    const calendar = []
    
    trends.forEach(trend => {
      if (trend.pattern === 'peak') {
        calendar.push({
          period: `Leading up to ${trend.season.replace('_', ' ')}`,
          type: 'advertising' as const,
          priority: 'high' as const
        })
      } else if (trend.pattern === 'valley') {
        calendar.push({
          period: `During ${trend.season.replace('_', ' ')}`,
          type: 'discount' as const,
          priority: 'medium' as const
        })
      }
    })

    return calendar
  }

  private generateCompetitiveInsights(salesRankData: SalesRankDataPoint[], productNames: { [asin: string]: string }) {
    return {
      seasonal_leaders: [
        { season: 'Holiday', competitors: Object.keys(productNames).slice(0, 3) },
        { season: 'Summer', competitors: Object.keys(productNames).slice(1, 4) }
      ],
      market_gaps: [
        'Limited competition during valley months',
        'Opportunity for counter-seasonal positioning',
        'Potential for year-round messaging'
      ],
      timing_advantages: [
        'Launch before competitors in peak seasons',
        'Optimize inventory timing',
        'Seasonal content opportunities'
      ]
    }
  }

  private generateRecommendations(trends: SeasonalTrend[], monthlyAverages: { [month: string]: number }) {
    return {
      inventory_strategy: 'Implement seasonal inventory planning with 2-3 month lead times for peak seasons and inventory reduction during valley periods.',
      marketing_calendar: [
        'Plan holiday campaigns starting in October',
        'Focus on spring launches in March-April',
        'Develop summer content themes in May',
        'Prepare back-to-school campaigns in July'
      ],
      pricing_strategy: 'Implement dynamic pricing with premium pricing during peak seasons and promotional pricing during valley periods.',
      content_strategy: [
        'Create seasonal content themes',
        'Develop holiday-specific messaging',
        'Optimize for seasonal keywords',
        'Plan seasonal video content'
      ],
      risk_mitigation: [
        'Diversify across multiple seasonal patterns',
        'Maintain minimum inventory buffers',
        'Monitor competitor seasonal strategies',
        'Develop contingency plans for supply chain issues'
      ]
    }
  }
}

export const seasonalityAnalysisAI = new SeasonalityAnalysisAI()