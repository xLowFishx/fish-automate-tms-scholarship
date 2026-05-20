import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AutomationJobsService } from './automation-jobs.service';
import { AutomationJobEntity } from './automation-job.schema';

describe('AutomationJobsService', () => {
  let service: AutomationJobsService;

  const createMock = jest.fn();
  const findMock = jest.fn();
  const sortMock = jest.fn();
  const leanMock = jest.fn();
  const execMock = jest.fn();

  beforeEach(async () => {
    execMock.mockResolvedValue([
      {
        _id: 'job-2',
        status: 'completed',
        input: {
          applicantName: 'Taylor',
          email: 'taylor@example.com',
          scholarshipId: 'TMS-2',
          formData: { studentId: '12345' },
        },
        result: { message: 'done' },
        createdAt: '2026-05-20T00:00:00.000Z',
        updatedAt: '2026-05-20T00:01:00.000Z',
      },
    ]);
    leanMock.mockReturnValue({ exec: execMock });
    sortMock.mockReturnValue({ lean: leanMock });
    findMock.mockReturnValue({ sort: sortMock });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationJobsService,
        {
          provide: getModelToken(AutomationJobEntity.name),
          useValue: {
            create: createMock,
            find: findMock,
          },
        },
      ],
    }).compile();

    service = module.get(AutomationJobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a pending job with sanitized form data', async () => {
    createMock.mockResolvedValue({
      toObject: () => ({
        _id: 'job-1',
        status: 'pending',
        input: {
          applicantName: 'Jamie Doe',
          email: 'jamie@example.com',
          scholarshipId: 'TMS-1',
          formData: { username: 'jamie' },
        },
        createdAt: '2026-05-20T00:00:00.000Z',
        updatedAt: '2026-05-20T00:00:00.000Z',
      }),
    });

    const job = await service.create({
      applicantName: 'Jamie Doe',
      email: 'jamie@example.com',
      scholarshipId: 'TMS-1',
      formEntries: [
        { key: ' username ', value: ' jamie ' },
        { key: ' ', value: 'ignored' },
      ],
    });

    expect(createMock).toHaveBeenCalledWith({
      status: 'pending',
      input: {
        applicantName: 'Jamie Doe',
        email: 'jamie@example.com',
        scholarshipId: 'TMS-1',
        targetUrl: undefined,
        formData: { username: 'jamie' },
      },
    });
    expect(job.id).toBe('job-1');
    expect(job.status).toBe('pending');
  });

  it('lists jobs in API response format', async () => {
    const jobs = await service.findAll();

    expect(findMock).toHaveBeenCalled();
    expect(jobs).toEqual([
      {
        id: 'job-2',
        status: 'completed',
        input: {
          applicantName: 'Taylor',
          email: 'taylor@example.com',
          scholarshipId: 'TMS-2',
          formData: { studentId: '12345' },
        },
        result: { message: 'done' },
        createdAt: '2026-05-20T00:00:00.000Z',
        updatedAt: '2026-05-20T00:01:00.000Z',
      },
    ]);
  });
});
