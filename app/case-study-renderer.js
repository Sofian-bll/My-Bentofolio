export function getCaseStudyBlocks(project) {
  if (Array.isArray(project?.caseStudyBlocks) && project.caseStudyBlocks.length) {
    return project.caseStudyBlocks
  }
  if (project?.caseStudy) {
    return [{ type: 'paragraph', content: project.caseStudy }]
  }
  return null
}
