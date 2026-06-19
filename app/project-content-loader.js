export function buildProjectsFromContent({ order, projectModules, caseStudyModules }) {
  return order.map(id => {
    const key = `../content/projects/${id}/project.json`
    const projectModule = projectModules[key]
    if (!projectModule) return null

    const caseStudyKey = `../content/projects/${id}/case-study.md`
    const caseStudyModule = caseStudyModules[caseStudyKey]

    const project = { ...(projectModule.default || projectModule) }
    project.caseStudy = caseStudyModule ? (caseStudyModule.default ?? caseStudyModule) : ''
    return project
  }).filter(Boolean)
}
