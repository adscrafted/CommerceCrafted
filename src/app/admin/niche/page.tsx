'use client'

import React from 'react'
import ProductQueueTab from '../components/ProductQueueTab'

export default function NichePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Niche Management</h1>
          <p className="text-gray-600">Manage product research niches and opportunities</p>
        </div>

        {/* Content */}
        <ProductQueueTab />
      </div>
    </div>
  )
}