'use client'

import React from 'react'
import AdminNavigation from '../components/AdminNavigation'
import UsersTab from '../components/UsersTab'

export default function UsersPage() {
  return (
    <div>
      <AdminNavigation />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and subscriptions</p>
        </div>

        {/* Content */}
        <UsersTab />
      </div>
    </div>
  )
}
