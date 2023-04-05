import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckupService } from './health-checkup.service';

describe('HealthCheckupService', () => {
  let service: HealthCheckupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthCheckupService],
    }).compile();

    service = module.get<HealthCheckupService>(HealthCheckupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
