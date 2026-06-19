export function projectCategoryIds(project) {
  if (!project) return []
  if (Array.isArray(project.categories) && project.categories.length) return project.categories
  return project.category ? [project.category] : []
}

function latestYear(period) {
  if (!period) return 0
  const years = [...period.matchAll(/\d{4}/g)].map(Number)
  return years.length ? Math.max(...years) : 0
}

export function sortProjects(projects, sort) {
  const list = [...projects]
  if (sort === 'recent') {
    list.sort((a, b) => latestYear(b.period) - latestYear(a.period) || a.name.localeCompare(b.name))
  } else if (sort === 'az') {
    list.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'za') {
    list.sort((a, b) => b.name.localeCompare(a.name))
  }
  return list
}

export function getProjectGalleryState({ projects, categories, filter, sort }) {
  const counts = projects.reduce((acc, project) => {
    projectCategoryIds(project).forEach((category) => {
      acc[category] = (acc[category] || 0) + 1
    })
    return acc
  }, {})

  const catKeys = Object.keys(categories).filter((key) => counts[key])
  const activeFilter = filter === 'all' || counts[filter] ? filter : 'all'
  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter((project) => projectCategoryIds(project).includes(activeFilter))

  const shown = sortProjects(filtered, sort || 'default')

  return { counts, catKeys, activeFilter, shown }
}
