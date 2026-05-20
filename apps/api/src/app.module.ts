import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomationJobsModule } from './automation-jobs/automation-jobs.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ??
        'mongodb://localhost:27017/fish-automate-tms-scholarship',
    ),
    AutomationJobsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
