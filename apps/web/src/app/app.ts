import { HttpClient } from '@angular/common/http';
import { DatePipe, JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import type { AutomationJobRecord, CreateAutomationJobRequest } from '@fish/shared';

@Component({
  selector: 'app-root',
  imports: [DatePipe, JsonPipe, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  readonly apiBaseUrl = 'http://localhost:3000';
  readonly isSubmitting = signal(false);
  readonly jobs = signal<AutomationJobRecord[]>([]);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly applicationForm = this.formBuilder.nonNullable.group({
    applicantName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    scholarshipId: ['', Validators.required],
    targetUrl: [''],
    formEntries: this.formBuilder.nonNullable.array([
      this.createFormEntry('firstName'),
      this.createFormEntry('lastName'),
    ]),
  });

  constructor() {
    void this.loadJobs();
  }

  get formEntries(): FormArray {
    return this.applicationForm.controls.formEntries;
  }

  addField(): void {
    this.formEntries.push(this.createFormEntry());
  }

  removeField(index: number): void {
    if (this.formEntries.length === 1) {
      return;
    }

    this.formEntries.removeAt(index);
  }

  async refreshJobs(): Promise<void> {
    await this.loadJobs();
  }

  async submit(): Promise<void> {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const formValue = this.applicationForm.getRawValue();
      const payload: CreateAutomationJobRequest = {
        applicantName: formValue.applicantName,
        email: formValue.email,
        scholarshipId: formValue.scholarshipId,
        targetUrl: formValue.targetUrl || undefined,
        formEntries: formValue.formEntries,
      };

      await firstValueFrom(
        this.http.post<AutomationJobRecord>(`${this.apiBaseUrl}/automation-jobs`, payload),
      );

      this.successMessage.set(
        'Automation job queued successfully. The backend returns immediately while the worker processes it asynchronously.',
      );
      this.applicationForm.patchValue({
        applicantName: '',
        email: '',
        scholarshipId: '',
        targetUrl: '',
      });
      this.formEntries.clear();
      this.addField();
      this.addField();
      await this.loadJobs();
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Failed to queue automation job.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  private createFormEntry(key = '', value = '') {
    return this.formBuilder.nonNullable.group({
      key: [key, Validators.required],
      value: [value, Validators.required],
    });
  }

  private async loadJobs(): Promise<void> {
    try {
      const jobs = await firstValueFrom(
        this.http.get<AutomationJobRecord[]>(`${this.apiBaseUrl}/automation-jobs`),
      );
      this.jobs.set(jobs);
    } catch {
      this.jobs.set([]);
    }
  }
}
