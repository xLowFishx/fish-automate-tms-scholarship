import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { AutomationJobRecord } from '@fish/shared';
import { sanitizeFormData } from '@fish/shared';
import { CreateAutomationJobDto } from './create-automation-job.dto';
import { AutomationJobEntity } from './automation-job.schema';

@Injectable()
export class AutomationJobsService {
  constructor(
    @InjectModel(AutomationJobEntity.name)
    private readonly automationJobModel: Model<AutomationJobEntity>,
  ) {}

  async create(
    createAutomationJobDto: CreateAutomationJobDto,
  ): Promise<AutomationJobRecord> {
    const automationJob = await this.automationJobModel.create({
      status: 'pending',
      input: {
        applicantName: createAutomationJobDto.applicantName,
        email: createAutomationJobDto.email,
        scholarshipId: createAutomationJobDto.scholarshipId,
        targetUrl: createAutomationJobDto.targetUrl,
        formData: sanitizeFormData(createAutomationJobDto.formEntries),
      },
    });

    return this.toRecord(automationJob.toObject());
  }

  async findAll(): Promise<AutomationJobRecord[]> {
    const jobs = await this.automationJobModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return jobs.map((job) => this.toRecord(job));
  }

  private toRecord(job: {
    _id: { toString(): string };
    status: AutomationJobRecord['status'];
    input: AutomationJobRecord['input'];
    result?: AutomationJobRecord['result'];
    createdAt: Date | string;
    updatedAt: Date | string;
  }): AutomationJobRecord {
    return {
      id: job._id.toString(),
      status: job.status,
      input: job.input,
      result: job.result,
      createdAt: new Date(job.createdAt).toISOString(),
      updatedAt: new Date(job.updatedAt).toISOString(),
    };
  }
}
