export function getFeaturedCvProjects(projects) {
  if (!Array.isArray(projects)) return []
  return projects.filter((project) => project.featured)
}
