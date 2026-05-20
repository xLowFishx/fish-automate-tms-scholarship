import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type {
  AutomationJobInput,
  AutomationJobResult,
  AutomationJobStatus,
} from '@fish/shared';
import { AUTOMATION_JOB_STATUSES } from '@fish/shared';

@Schema({
  collection: 'automationjobs',
  timestamps: true,
  versionKey: false,
})
export class AutomationJobEntity {
  @Prop({
    required: true,
    enum: AUTOMATION_JOB_STATUSES,
    type: String,
  })
  status!: AutomationJobStatus;

  @Prop({
    required: true,
    type: Object,
  })
  input!: AutomationJobInput;

  @Prop({
    type: Object,
  })
  result?: AutomationJobResult;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AutomationJobSchema =
  SchemaFactory.createForClass(AutomationJobEntity);
