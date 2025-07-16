'use client'

import React from 'react'
import ProductQueueTab from '../components/ProductQueueTab'

export default function NichePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Niche Management</h1>
        <p className="text-gray-600">Manage product research niches and opportunities</p>
      </div>

      {/* Content */}
      <ProductQueueTab />
    </div>
  )
}