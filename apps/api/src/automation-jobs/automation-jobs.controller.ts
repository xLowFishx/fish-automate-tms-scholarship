import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { AutomationJobRecord } from '@fish/shared';
import { CreateAutomationJobDto } from './create-automation-job.dto';
import { AutomationJobsService } from './automation-jobs.service';

@Controller('automation-jobs')
export class AutomationJobsController {
  constructor(private readonly automationJobsService: AutomationJobsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  create(
    @Body() createAutomationJobDto: CreateAutomationJobDto,
  ): Promise<AutomationJobRecord> {
    return this.automationJobsService.create(createAutomationJobDto);
  }

  @Get()
  findAll(): Promise<AutomationJobRecord[]> {
    return this.automationJobsService.findAll();
  }
}
