import { Test, TestingModule } from '@nestjs/testing';
import { AreaCandidatoController } from './area-candidato.controller';

describe('AreaCandidatoController', () => {
  let controller: AreaCandidatoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AreaCandidatoController],
    }).compile();

    controller = module.get<AreaCandidatoController>(AreaCandidatoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
