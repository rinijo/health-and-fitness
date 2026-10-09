export function localDateId(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function weekdayName(date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: 'long' })
}

function ordinal(day: number): string {
  const remainder = day % 100
  if (remainder >= 11 && remainder <= 13) return `${day}th`
  switch (day % 10) {
    case 1:
      return `${day}st`
    case 2:
      return `${day}nd`
    case 3:
      return `${day}rd`
    default:
      return `${day}th`
  }
}

export function formatTodayHeading(date = new Date()): string {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' })
  const month = date.toLocaleDateString('en-GB', { month: 'long' })
  return `${weekday} ${ordinal(date.getDate())} ${month}`
}

export function firstName(displayName?: string | null, email?: string | null): string {
  const fromName = displayName?.trim().split(/\s+/)[0]
  if (fromName) return fromName
  const fromEmail = email?.split('@')[0]
  if (fromEmail) return fromEmail
  return 'Rini'
}

export function formatDateLabel(dateId: string): string {
  const [year, month, day] = dateId.split('-').map(Number)
  if (!year || !month || !day) return dateId
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatChartDate(dateId: string): string {
  const [year, month, day] = dateId.split('-').map(Number)
  if (!year || !month || !day) return dateId
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}
