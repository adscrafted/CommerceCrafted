'use client'

import React from 'react'
import AdminNavigation from '../components/AdminNavigation'
import AnalyticsTab from '../components/AnalyticsTab'

export default function AnalyticsPage() {
  return (
    <div>
      <AdminNavigation />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">View system analytics, user metrics, and performance data</p>
        </div>

        {/* Content */}
        <AnalyticsTab />
      </div>
    </div>
  )
}
