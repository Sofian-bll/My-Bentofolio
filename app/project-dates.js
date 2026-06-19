function parseDate(d) {
  if (!d) return null
  const dt = new Date(d + 'T00:00:00')
  return isNaN(dt.getTime()) ? null : dt
}

export function formatPeriod(startDate, endDate) {
  const start = parseDate(startDate)
  if (!start) return ''
  const sy = start.getFullYear()
  const end = parseDate(endDate)
  if (!end) return String(sy)
  const ey = end.getFullYear()
  if (sy === ey) return String(sy)
  return `${sy} – ${ey}`
}

export function formatDuration(startDate, endDate) {
  const start = parseDate(startDate)
  if (!start) return ''
  const end = parseDate(endDate)
  if (!end) return 'En cours'
  const ms = end.getTime() - start.getTime()
  const days = Math.round(ms / (1000 * 60 * 60 * 24))
  if (days <= 0) return ''
  if (days < 45) return `${days} j.`
  const months = Math.round(days / 30.44)
  if (months < 24) return `${months} mois`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem <= 1) return `${years} an${years > 1 ? 's' : ''}`
  return `${years} an${years > 1 ? 's' : ''} ${rem} mois`
}

export function computeProjectDates(project) {
  if (!project.startDate) return project
  return {
    ...project,
    period: formatPeriod(project.startDate, project.endDate),
    duration: formatDuration(project.startDate, project.endDate),
  }
}
