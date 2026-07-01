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
      name: 'Perimeter Demo',
      customer: 'Training Customer',
      site: 'Demo Site',
      status: 'survey',
    })
  })

  it('requires project name and customer', () => {
    const draft: ProjectDraft = {
      name: ' ',
      customer: '',
      site: 'Demo Site',
      status: 'draft',
    }

    expect(validateProjectDraft(draft)).toEqual({
      name: 'Project name is required.',
      customer: 'Customer is required.',
    })
  })

  it('accepts a valid draft', () => {
    const errors = validateProjectDraft(createProjectDraft(projects[0]))

    expect(hasProjectDraftErrors(errors)).toBe(false)
  })
})
