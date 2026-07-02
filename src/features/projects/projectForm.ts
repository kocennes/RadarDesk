import type { Project } from '../../types/domain'

export type ProjectDraft = {
  name: string
  customer: string
  site: string
  status: Project['status']
}

export type ProjectDraftErrors = Partial<Record<keyof ProjectDraft, string>>

export function validateProjectDraft(draft: ProjectDraft): ProjectDraftErrors {
  const errors: ProjectDraftErrors = {}

  if (draft.name.trim().length === 0) {
    errors.name = 'Proje adi zorunludur.'
  }

  if (draft.customer.trim().length === 0) {
    errors.customer = 'Musteri zorunludur.'
  }

  if (draft.site.trim().length > 80) {
    errors.site = 'Saha adi 80 karakter veya daha kisa olmalidir.'
  }

  return errors
}

export function hasProjectDraftErrors(errors: ProjectDraftErrors): boolean {
  return Object.keys(errors).length > 0
}

export function createProjectDraft(project: Project): ProjectDraft {
  return {
    name: project.name,
    customer: project.customer,
    site: project.site,
    status: project.status,
  }
}
