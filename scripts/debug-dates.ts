#!/usr/bin/env node

/**
 * Debug Date Calculations
 */

function getSundayOfWeek(date: Date): Date {
  const sunday = new Date(date)
  sunday.setDate(date.getDate() - date.getDay())
  sunday.setUTCHours(0, 0, 0, 0)
  return sunday
}

function getSaturdayOfWeek(date: Date): Date {
  const saturday = new Date(date)
  saturday.setDate(date.getDate() + (6 - date.getDay()))
  saturday.setUTCHours(23, 59, 59, 999)
  return saturday
}

async function main() {
  console.log('🗓️ Debug Date Calculations')
  console.log('==========================\n')

  const testDate = new Date('2025-04-06T00:00:00.000Z')
  
  console.log(`Input date: ${testDate.toISOString()}`)
  console.log(`Day of week: ${testDate.getDay()} (0=Sunday, 6=Saturday)`)
  console.log(`Date: ${testDate.getDate()}`)
  
  const sunday = getSundayOfWeek(testDate)
  const saturday = getSaturdayOfWeek(testDate)
  
  console.log(`\nSunday: ${sunday.toISOString()} (${sunday.toISOString().split('T')[0]})`)
  console.log(`Saturday: ${saturday.toISOString()} (${saturday.toISOString().split('T')[0]})`)
  
  // Check if it's a full week
  const diffDays = Math.floor((saturday.getTime() - sunday.getTime()) / (1000 * 60 * 60 * 24))
  console.log(`\nDays between: ${diffDays} (should be 6)`)
}

main().catch(console.error)