import type { User } from '../types/domain'

export const users: User[] = [
  {
    id: 'user-admin-001',
    name: 'Demo Admin',
    role: 'admin',
    email: 'admin@example.test',
    status: 'active',
  },
  {
    id: 'user-operator-001',
    name: 'Demo Operator',
    role: 'operator',
    email: 'operator@example.test',
    status: 'active',
  },
  {
    id: 'user-viewer-001',
    name: 'Demo Viewer',
    role: 'viewer',
    email: 'viewer@example.test',
    status: 'inactive',
  },
]
