import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomationJobsController } from './automation-jobs.controller';
import { AutomationJobEntity, AutomationJobSchema } from './automation-job.schema';
import { AutomationJobsService } from './automation-jobs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AutomationJobEntity.name,
        schema: AutomationJobSchema,
      },
    ]),
  ],
  controllers: [AutomationJobsController],
  providers: [AutomationJobsService],
})
export class AutomationJobsModule {}
