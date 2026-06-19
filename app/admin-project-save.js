export async function saveProjectToContent(project, fetcher = fetch) {
  const res = await fetcher('/api/admin/project/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project }),
  })
  const data = await res.json()
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Failed to save project')
  }
  return data
}

export async function deleteProjectFromContent(id, fetcher = fetch) {
  const res = await fetcher('/api/admin/project/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  const data = await res.json()
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Failed to delete project')
  }
  return data
}
