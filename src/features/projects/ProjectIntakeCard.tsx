import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button, Card, CardHeader, Field, Input, Select, Text } from '@fluentui/react-components'
import { ButtonInfo } from '../../components/ui/ButtonInfo'
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

const projectStatusLabel: Record<Project['status'], string> = {
  draft: 'Taslak',
  survey: 'Kesif',
  active: 'Aktif',
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
      setSaveMessage(`${savedProject.name} taslagi kaydedildi.`)
    } catch {
      setSaveMessage('Taslak kaydedilemedi. Lutfen tekrar deneyin.')
    }
  }

  return (
    <Card className="project-card">
      <CardHeader
        header={<Text weight="semibold">Proje kaydi</Text>}
        description={<Text size={200}>Dogrulamali proje taslak formu</Text>}
      />
      <form className="form-grid" onSubmit={handleProjectSubmit}>
        <Field
          label="Proje adi"
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
          label="Musteri"
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
          label="Saha"
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
          label="Durum"
          hint={<span id={statusDescriptionId}>Yerel taslak status; final status backend yetkilendirmesiyle belirlenir.</span>}
        >
          <Select
            aria-describedby={statusDescriptionId}
            value={projectDraft.status}
            onChange={handleProjectStatusChange}
          >
            <option value="draft">{projectStatusLabel.draft}</option>
            <option value="survey">{projectStatusLabel.survey}</option>
            <option value="active">{projectStatusLabel.active}</option>
          </Select>
        </Field>
        {saveMessage ? (
          <div aria-live="polite" className="form-success" role="status">
            <Text weight="semibold">{saveMessage}</Text>
          </div>
        ) : null}
        <div className="button-with-info form-button-with-info">
          <Button appearance="primary" type="submit">
            Taslagi kaydet
          </Button>
          <ButtonInfo label="Formdaki proje bilgilerini dogrular ve mock kaynakli taslak kayit olarak saklar." />
        </div>
      </form>
    </Card>
  )
}
