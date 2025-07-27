import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface ScoreCardProps {
  value: string | number
  label: string
  icon?: LucideIcon
  description?: string
  variant?: 'default' | 'compact' | 'bordered'
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'gray'
  className?: string
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'text-green-500',
    border: 'border-green-200'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    border: 'border-purple-200'
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    icon: 'text-orange-500',
    border: 'border-orange-200'
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: 'text-red-500',
    border: 'border-red-200'
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    icon: 'text-indigo-500',
    border: 'border-indigo-200'
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    icon: 'text-gray-500',
    border: 'border-gray-200'
  }
}

export function ScoreCard({
  value,
  label,
  icon: Icon,
  description,
  variant = 'default',
  color = 'blue',
  className
}: ScoreCardProps) {
  const colors = colorClasses[color]

  if (variant === 'compact') {
    return (
      <div className={cn(
        'text-center p-3 rounded-lg border',
        colors.bg,
        colors.border,
        className
      )}>
        {Icon && (
          <Icon className={cn('h-4 w-4 mx-auto mb-1', colors.icon)} />
        )}
        <div className={cn('text-xl font-bold', colors.text)}>
          {value}
        </div>
        <div className="text-xs text-gray-600 mt-0.5">{label}</div>
      </div>
    )
  }

  if (variant === 'bordered') {
    return (
      <div className={cn(
        'p-4 bg-white border rounded-lg text-center',
        colors.border,
        className
      )}>
        {Icon && (
          <Icon className={cn('h-5 w-5 mx-auto mb-2', colors.icon)} />
        )}
        <div className={cn('text-2xl font-bold', colors.text)}>
          {value}
        </div>
        <div className="text-sm text-gray-600 mt-1">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn(
      'p-4 rounded-lg text-center border',
      colors.bg,
      colors.border,
      className
    )}>
      {Icon && (
        <Icon className={cn('h-5 w-5 mx-auto mb-2', colors.icon)} />
      )}
      <h3 className="text-sm font-medium text-gray-600 mb-1">{label}</h3>
      <div className={cn('text-2xl font-bold', colors.text)}>
        {value}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  )
}