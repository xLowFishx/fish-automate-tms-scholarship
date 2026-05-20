import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'api',
      architecture: {
        frontend: 'Angular',
        api: 'NestJS',
        worker: 'Playwright automation service',
        database: 'MongoDB',
      },
    };
  }
}
