import type { Incident, IncidentStatus } from '../../../src/types/domain'

export type IncidentReviewInput = {
  status: IncidentStatus
  operatorNote?: string
}

type IncidentReviewRecord = IncidentReviewInput & {
  updatedAt: string
}

const incidentReviews = new Map<string, IncidentReviewRecord>()

export function applyIncidentReviews(incidents: Incident[]): Incident[] {
  return incidents.map(applyIncidentReview)
}

export function applyIncidentReview(incident: Incident): Incident {
  const review = incidentReviews.get(incident.id)

  if (!review) {
    return cloneIncident(incident)
  }

  return {
    ...cloneIncident(incident),
    confirmationLevel: review.status === 'confirmed' ? 'operator-confirmed' : incident.confirmationLevel,
    operatorNote: review.operatorNote,
    status: review.status,
    updatedAt: review.updatedAt,
  }
}

export function saveIncidentReview(incidentId: string, input: IncidentReviewInput): IncidentReviewRecord {
  const review: IncidentReviewRecord = {
    operatorNote: input.operatorNote,
    status: input.status,
    updatedAt: new Date().toISOString(),
  }

  incidentReviews.set(incidentId, review)

  return review
}

function cloneIncident(incident: Incident): Incident {
  return {
    ...incident,
    evidenceRefs: incident.evidenceRefs.map((evidenceRef) => ({ ...evidenceRef })),
    sensorEventIds: [...incident.sensorEventIds],
    sourceDeviceIds: [...incident.sourceDeviceIds],
  }
}
