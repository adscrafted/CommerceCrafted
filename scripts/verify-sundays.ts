#!/usr/bin/env node

/**
 * Verify all dates are Sundays
 */

const dates = [
  '2025-04-06',
  '2025-04-13',
  '2025-04-20',
  '2025-04-27',
  '2025-05-04',
  '2025-05-11',
  '2025-05-18',
  '2025-05-25',
  '2025-06-01',
  '2025-06-08'
]

dates.forEach(dateStr => {
  const date = new Date(dateStr + 'T00:00:00.000Z')
  const dayOfWeek = date.getUTCDay()
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
  console.log(`${dateStr}: ${dayName} (${dayOfWeek})`)
})