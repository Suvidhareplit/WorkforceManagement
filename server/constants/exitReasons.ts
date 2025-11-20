/**
 * Employee Exit Management Constants
 * 
 * Defines exit types and their corresponding reasons for employee exit management
 */

export const EXIT_TYPES = {
  VOLUNTARY: 'voluntary',
  INVOLUNTARY: 'involuntary',
  ABSCONDING: 'absconding',
} as const;

export type ExitType = typeof EXIT_TYPES[keyof typeof EXIT_TYPES];

/**
 * Voluntary Exit Reasons
 * These are reasons when an employee chooses to leave voluntarily
 */
export const VOLUNTARY_EXIT_REASONS = [
  'Better Career Opportunity',
  'Higher Studies / Education',
  'Relocation (Family / Personal)',
  'Health Reasons',
  'Personal Reasons / Family Commitments',
  'Job Role Mismatch',
  'Compensation / Benefits',
  'Work-Life Balance',
  'Unhappy with Manager / Team',
  'Lack of Growth / Learning Opportunities',
  'Long Commute / Travel Fatigue',
  'Returning to Hometown',
  'Entrepreneurship / Self-employment',
  'Retirement',
  'Peer Influence / Reference',
] as const;

/**
 * Involuntary Exit Reasons
 * These are reasons when the company terminates the employee
 */
export const INVOLUNTARY_EXIT_REASONS = [
  'Performance Issues',
  'Misconduct',
  'Violation of Company Policy',
  'Absenteeism / Job Abandonment',
  'Redundancy / Downsizing',
  'Disciplinary Termination',
  'Medical Unfitness',
  'Probation Non-confirmation',
  'Background Verification Failure',
  'Contract / Project Completion',
  'ATL - Resign',
] as const;

/**
 * Get all exit reasons for a specific exit type
 */
export function getExitReasons(exitType: ExitType): readonly string[] {
  switch (exitType) {
    case EXIT_TYPES.VOLUNTARY:
      return VOLUNTARY_EXIT_REASONS;
    case EXIT_TYPES.INVOLUNTARY:
      return INVOLUNTARY_EXIT_REASONS;
    case EXIT_TYPES.ABSCONDING:
      return []; // Absconding typically doesn't have additional reasons
    default:
      return [];
  }
}

/**
 * Validate if a reason is valid for a given exit type
 */
export function isValidExitReason(exitType: ExitType, reason: string): boolean {
  const validReasons = getExitReasons(exitType);
  return validReasons.includes(reason as any);
}

/**
 * All exit reasons combined
 */
export const ALL_EXIT_REASONS = {
  [EXIT_TYPES.VOLUNTARY]: VOLUNTARY_EXIT_REASONS,
  [EXIT_TYPES.INVOLUNTARY]: INVOLUNTARY_EXIT_REASONS,
  [EXIT_TYPES.ABSCONDING]: [],
} as const;
