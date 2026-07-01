import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button, Card, CardHeader, Field, Input, Select, Text } from '@fluentui/react-components'
import { saveProjectDraft } from '../../services/apiClient'
import type { Project } from '../../types/domain'
import {
  createProjectDraft,
  hasProjectDraftErrors,
  validateProjectDraft,
  type ProjectDraft,
  type ProjectDraftErrors,
} from './projectForm'

export type ProjectIntakeCardProps = {
  project: Project
}

export function ProjectIntakeCard({ project }: ProjectIntakeCardProps) {
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(() => createProjectDraft(project))
  const [projectErrors, setProjectErrors] = useState<ProjectDraftErrors>({})
  const [saveMessage, setSaveMessage] = useState<string>('')
  const nameValidationId = 'project-name-validation'
  const customerValidationId = 'project-customer-validation'
  const siteValidationId = 'project-site-validation'
  const statusDescriptionId = 'project-status-description'

  function handleProjectFieldChange(field: keyof ProjectDraft, value: string) {
    setProjectDraft((draft) => ({
      ...draft,
      [field]: value,
    }))

    setProjectErrors((errors) => ({
      ...errors,
      [field]: undefined,
    }))
    setSaveMessage('')
  }

  function handleProjectStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    handleProjectFieldChange('status', event.target.value as ProjectDraft['status'])
  }

  async function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validateProjectDraft(projectDraft)
    setProjectErrors(errors)

    if (hasProjectDraftErrors(errors)) {
      setSaveMessage('')
      return
    }

    try {
      const savedProject = await saveProjectDraft(projectDraft)
      setSaveMessage(`${savedProject.name} draft saved.`)
    } catch {
      setSaveMessage('Draft could not be saved. Please try again.')
    }
  }

  return (
    <Card className="project-card">
      <CardHeader
        header={<Text weight="semibold">Project intake</Text>}
        description={<Text size={200}>Validated frontend form shell</Text>}
      />
      <form className="form-grid" onSubmit={handleProjectSubmit}>
        <Field
          label="Project name"
          required
          validationMessage={projectErrors.name ? <span id={nameValidationId}>{projectErrors.name}</span> : undefined}
          validationState={projectErrors.name ? 'error' : 'none'}
        >
          <Input
            aria-describedby={projectErrors.name ? nameValidationId : undefined}
            aria-invalid={Boolean(projectErrors.name)}
            value={projectDraft.name}
            onChange={(event) => handleProjectFieldChange('name', event.target.value)}
          />
        </Field>
        <Field
          label="Customer"
          required
          validationMessage={
            projectErrors.customer ? <span id={customerValidationId}>{projectErrors.customer}</span> : undefined
          }
          validationState={projectErrors.customer ? 'error' : 'none'}
        >
          <Input
            aria-describedby={projectErrors.customer ? customerValidationId : undefined}
            aria-invalid={Boolean(projectErrors.customer)}
            value={projectDraft.customer}
            onChange={(event) => handleProjectFieldChange('customer', event.target.value)}
          />
        </Field>
        <Field
          label="Site"
          validationMessage={projectErrors.site ? <span id={siteValidationId}>{projectErrors.site}</span> : undefined}
          validationState={projectErrors.site ? 'error' : 'none'}
        >
          <Input
            aria-describedby={projectErrors.site ? siteValidationId : undefined}
            aria-invalid={Boolean(projectErrors.site)}
            value={projectDraft.site}
            onChange={(event) => handleProjectFieldChange('site', event.target.value)}
          />
        </Field>
        <Field
          label="Priority"
          hint={<span id={statusDescriptionId}>Local demo status; backend authorization will decide final status.</span>}
        >
          <Select
            aria-describedby={statusDescriptionId}
            value={projectDraft.status}
            onChange={handleProjectStatusChange}
          >
            <option value="draft">Draft</option>
            <option value="survey">Survey</option>
            <option value="active">Active</option>
          </Select>
        </Field>
        {saveMessage ? (
          <div aria-live="polite" className="form-success" role="status">
            <Text weight="semibold">{saveMessage}</Text>
          </div>
        ) : null}
        <Button appearance="primary" type="submit">
          Save draft
        </Button>
      </form>
    </Card>
  )
}
