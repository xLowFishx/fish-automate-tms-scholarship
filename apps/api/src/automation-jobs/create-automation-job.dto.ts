import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import type { CreateAutomationJobRequest } from '@fish/shared';

class FormDataEntryDto {
  @IsString()
  @MaxLength(100)
  key!: string;

  @IsString()
  @MaxLength(1000)
  value!: string;
}

export class CreateAutomationJobDto
  implements Omit<CreateAutomationJobRequest, 'formData'>
{
  @IsString()
  @MaxLength(120)
  applicantName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(80)
  scholarshipId!: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  targetUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormDataEntryDto)
  formEntries!: FormDataEntryDto[];
}
