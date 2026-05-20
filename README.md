# fish-automate-tms-scholarship

Monorepo scaffold for a scholarship automation platform built with:

- `apps/web`: Angular 21 frontend
- `apps/api`: NestJS API
- `apps/automation`: Playwright worker service
- `packages/shared`: shared TypeScript contracts and helpers
- MongoDB for persistence

## Architecture

```text
apps/web --> apps/api --> MongoDB <-- apps/automation
```

- The Angular frontend accepts applicant data and automation field values.
- The NestJS API validates requests and stores queued jobs in MongoDB.
- The Playwright worker polls MongoDB for `pending` jobs and executes automation separately from the API process.
- MongoDB stores request payloads, statuses, timestamps, and automation results.

## Getting started

1. Copy `.env.example` to `.env` if you want to override defaults.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start MongoDB locally or with Docker Compose:

   ```bash
   docker compose up mongodb -d
   ```

4. Run the applications in separate terminals:

   ```bash
   pnpm dev:api
   pnpm dev:automation
   pnpm dev:web
   ```

## Validation

```bash
pnpm build
pnpm test
```

## API overview

- `GET /health` returns API health and architecture metadata.
- `POST /automation-jobs` stores a job as `pending` and returns immediately.
- `GET /automation-jobs` lists queued and processed jobs.

### Example request

```json
{
  "applicantName": "Jamie Doe",
  "email": "jamie@example.com",
  "scholarshipId": "TMS-2026-001",
  "targetUrl": "https://example.com/external-form",
  "formEntries": [
    { "key": "firstName", "value": "Jamie" },
    { "key": "lastName", "value": "Doe" }
  ]
}
```
