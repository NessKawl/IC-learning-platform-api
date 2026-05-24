import { Test, TestingModule } from '@nestjs/testing';
import { AreaCandidatoService } from './area-candidato.service.js';

describe('AreaCandidatoService', () => {
  let service: AreaCandidatoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AreaCandidatoService],
    }).compile();

    service = module.get<AreaCandidatoService>(AreaCandidatoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
