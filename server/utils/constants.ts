export const PRIORITIES = {
  P0: 'Critical',
  P1: 'High',
  P2: 'Medium',
  P3: 'Low'
} as const;

export const REQUEST_TYPES = {
  replacement: 'Replacement',
  fresh: 'Fresh Requirement'
} as const;

export const REQUEST_STATUS = {
  open: 'Open',
  closed: 'Closed',
  called_off: 'Called Off'
} as const;

export const CANDIDATE_STATUS = {
  applied: 'Applied',
  prescreening: 'Prescreening',
  technical: 'Technical Round',
  selected: 'Selected',
  rejected: 'Rejected',
  offered: 'Offered',
  joined: 'Joined'
} as const;

export const TRAINING_TYPES = {
  induction: 'Induction',
  classroom: 'Classroom Training',
  field: 'Field Training'
} as const;

export const USER_ROLES = {
  admin: 'Admin',
  hr: 'HR',
  recruiter: 'Recruiter',
  manager: 'Manager',
  trainer: 'Trainer'
} as const;

export const EXIT_TYPES = {
  voluntary: 'Voluntary Resignation',
  termination: 'Termination',
  absconding: 'Absconding'
} as const;
