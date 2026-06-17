export function projectCategoryIds(project) {
  if (!project) return []
  if (Array.isArray(project.categories) && project.categories.length) return project.categories
  return project.category ? [project.category] : []
}

export function getProjectGalleryState({ projects, categories, filter }) {
  const counts = projects.reduce((acc, project) => {
    projectCategoryIds(project).forEach((category) => {
      acc[category] = (acc[category] || 0) + 1
    })
    return acc
  }, {})

  const catKeys = Object.keys(categories).filter((key) => counts[key])
  const activeFilter = filter === 'all' || counts[filter] ? filter : 'all'
  const shown = activeFilter === 'all'
    ? projects
    : projects.filter((project) => projectCategoryIds(project).includes(activeFilter))

  return { counts, catKeys, activeFilter, shown }
}
