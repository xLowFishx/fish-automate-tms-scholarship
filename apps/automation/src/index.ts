import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import type { WithId, Document } from 'mongodb';
import { MongoClient } from 'mongodb';
import { chromium } from 'playwright';
import type {
  AutomationJobInput,
  AutomationJobRecord,
  AutomationJobResult,
} from '@fish/shared';

const mongoUri =
  process.env.MONGO_URI ??
  'mongodb://localhost:27017/fish-automate-tms-scholarship';
const databaseName = new URL(mongoUri).pathname.replace(/^\//, '') || 'admin';
const pollIntervalMs = Number(process.env.AUTOMATION_POLL_INTERVAL_MS ?? 5000);
const navigationTimeoutMs = Number(
  process.env.AUTOMATION_NAVIGATION_TIMEOUT_MS ?? 30000,
);
const defaultTargetUrl = process.env.AUTOMATION_TARGET_URL;
const submitSelector = process.env.AUTOMATION_SUBMIT_SELECTOR;
const artifactDirectory = path.resolve(
  process.cwd(),
  'apps/automation/artifacts',
);

type StoredJob = Omit<AutomationJobRecord, 'id'> & { _id: string };

async function main(): Promise<void> {
  await mkdir(artifactDirectory, { recursive: true });

  const client = new MongoClient(mongoUri);
  await client.connect();

  const jobsCollection = client.db(databaseName).collection<StoredJob>('automationjobs');

  console.log(`[automation] worker connected to ${mongoUri}`);

  for (;;) {
    const job = await jobsCollection.findOneAndUpdate(
      { status: 'pending' },
      {
        $set: {
          status: 'running',
          updatedAt: new Date().toISOString(),
        },
      },
      { sort: { createdAt: 1 }, returnDocument: 'after' },
    );

    if (!job) {
      await delay(pollIntervalMs);
      continue;
    }

    try {
      const result = await runAutomation(job.input);

      await jobsCollection.updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'completed',
            result,
            updatedAt: new Date().toISOString(),
          },
        },
      );
    } catch (error) {
      await jobsCollection.updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'failed',
            result: {
              error:
                error instanceof Error ? error.message : 'Unknown automation error',
              completedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          },
        },
      );
    }
  }
}

async function runAutomation(input: AutomationJobInput): Promise<AutomationJobResult> {
  const targetUrl = input.targetUrl ?? defaultTargetUrl;

  if (!targetUrl) {
    throw new Error(
      'No target URL configured. Set AUTOMATION_TARGET_URL or include targetUrl in the request.',
    );
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: navigationTimeoutMs });

    const filledFields: string[] = [];

    for (const [key, value] of Object.entries(input.formData)) {
      const selector = `[name="${cssEscape(key)}"]`;
      const field = page.locator(selector).first();

      if ((await field.count()) === 0) {
        continue;
      }

      await field.fill(value);
      filledFields.push(key);
    }

    if (submitSelector) {
      const submitButton = page.locator(submitSelector).first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
      }
    }

    const screenshotPath = path.join(
      artifactDirectory,
      `${input.scholarshipId}-${Date.now()}.png`,
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return {
      message: 'Automation completed successfully.',
      screenshotPath,
      filledFields,
      completedAt: new Date().toISOString(),
    };
  } finally {
    await page.close();
    await browser.close();
  }
}

function cssEscape(value: string): string {
  return value.replace(/(["\\])/g, '\\$1');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

void main().catch((error: unknown) => {
  console.error('[automation] fatal worker error', error);
  process.exitCode = 1;
});
