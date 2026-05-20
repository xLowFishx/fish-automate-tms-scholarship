import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { App } from './app';

describe('App', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const request = httpTestingController.expectOne('http://localhost:3000/automation-jobs');
    request.flush([]);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the automation workspace heading', async () => {
    const fixture = TestBed.createComponent(App);
    const request = httpTestingController.expectOne('http://localhost:3000/automation-jobs');
    request.flush([]);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'TMS scholarship automation console',
    );
  });

  it('submits queued jobs through the API payload', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    httpTestingController.expectOne('http://localhost:3000/automation-jobs').flush([]);
    fixture.detectChanges();

    app.applicationForm.patchValue({
      applicantName: 'Jamie Doe',
      email: 'jamie@example.com',
      scholarshipId: 'TMS-2026-001',
      targetUrl: 'https://example.com/form',
    });
    app.formEntries.at(0).patchValue({ key: 'firstName', value: 'Jamie' });
    app.formEntries.at(1).patchValue({ key: ' lastName ', value: ' Doe ' });

    const submission = app.submit();

    const postRequest = httpTestingController.expectOne('http://localhost:3000/automation-jobs');
    expect(postRequest.request.method).toBe('POST');
    expect(postRequest.request.body).toEqual({
      applicantName: 'Jamie Doe',
      email: 'jamie@example.com',
      scholarshipId: 'TMS-2026-001',
      targetUrl: 'https://example.com/form',
      formEntries: [
        { key: 'firstName', value: 'Jamie' },
        { key: ' lastName ', value: ' Doe ' },
      ],
    });
    postRequest.flush({
      id: 'job-1',
      status: 'pending',
      input: {
        applicantName: 'Jamie Doe',
        email: 'jamie@example.com',
        scholarshipId: 'TMS-2026-001',
        formData: {
          firstName: 'Jamie',
          lastName: 'Doe',
        },
      },
      createdAt: '2026-05-20T00:00:00.000Z',
      updatedAt: '2026-05-20T00:00:00.000Z',
    });
    await fixture.whenStable();
    httpTestingController.expectOne('http://localhost:3000/automation-jobs').flush([]);
    await submission;
  });
});
