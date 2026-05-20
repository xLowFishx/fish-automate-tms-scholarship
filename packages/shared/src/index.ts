export const AUTOMATION_JOB_STATUSES = [
  'pending',
  'running',
  'completed',
  'failed',
] as const;

export type AutomationJobStatus = (typeof AUTOMATION_JOB_STATUSES)[number];

export interface AutomationFieldEntry {
  key: string;
  value: string;
}

export interface AutomationJobInput {
  applicantName: string;
  email: string;
  scholarshipId: string;
  targetUrl?: string;
  formData: Record<string, string>;
}

export interface AutomationJobResult {
  message?: string;
  error?: string;
  screenshotPath?: string;
  filledFields?: string[];
  completedAt?: string;
}

export interface AutomationJobRecord {
  id: string;
  status: AutomationJobStatus;
  input: AutomationJobInput;
  result?: AutomationJobResult;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationJobRequest {
  applicantName: string;
  email: string;
  scholarshipId: string;
  targetUrl?: string;
  formEntries: AutomationFieldEntry[];
}

export function sanitizeFormData(
  entries: AutomationFieldEntry[],
): Record<string, string> {
  return entries.reduce<Record<string, string>>((accumulator, entry) => {
    const key = entry.key.trim();

    if (!key) {
      return accumulator;
    }

    accumulator[key] = entry.value.trim();
    return accumulator;
  }, {});
}
