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

  it('limits site names to a readable length', () => {
    const draft: ProjectDraft = {
      name: 'Perimeter Demo',
      customer: 'Training Customer',
      site: 'A'.repeat(81),
      status: 'survey',
    }

    expect(validateProjectDraft(draft)).toEqual({
      site: 'Site must be 80 characters or fewer.',
    })
  })

  it('accepts a valid draft', () => {
    const errors = validateProjectDraft(createProjectDraft(projects[0]))

    expect(hasProjectDraftErrors(errors)).toBe(false)
  })
})
