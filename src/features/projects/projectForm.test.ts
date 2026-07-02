import { describe, expect, it } from 'vitest'
import { projects } from '../../mocks/projects'
import {
  createProjectDraft,
  hasProjectDraftErrors,
  validateProjectDraft,
  type ProjectDraft,
} from './projectForm'

describe('project form helpers', () => {
  it('creates a draft from an existing project', () => {
    expect(createProjectDraft(projects[0])).toEqual({
      name: 'Cevre Guvenligi Egitim Senaryosu',
      customer: 'Egitim Musterisi',
      site: 'Egitim Sahasi',
      status: 'survey',
    })
  })

  it('requires project name and customer', () => {
    const draft: ProjectDraft = {
      name: ' ',
      customer: '',
      site: 'Egitim Sahasi',
      status: 'draft',
    }

    expect(validateProjectDraft(draft)).toEqual({
      name: 'Proje adi zorunludur.',
      customer: 'Musteri zorunludur.',
    })
  })

  it('limits site names to a readable length', () => {
    const draft: ProjectDraft = {
      name: 'Cevre Guvenligi Egitim Senaryosu',
      customer: 'Egitim Musterisi',
      site: 'A'.repeat(81),
      status: 'survey',
    }

    expect(validateProjectDraft(draft)).toEqual({
      site: 'Saha adi 80 karakter veya daha kisa olmalidir.',
    })
  })

  it('accepts a valid draft', () => {
    const errors = validateProjectDraft(createProjectDraft(projects[0]))

    expect(hasProjectDraftErrors(errors)).toBe(false)
  })
})
