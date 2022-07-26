import supertest from 'supertest';
import { faker } from '@faker-js/faker';

import app from './../src/app.js';
import { prisma } from './../src/database.js';
import { insert } from './factories/recommendationFactory.js';
import { deleteAllData } from './factories/scenarioFactory.js';

beforeEach( async() => {
  await deleteAllData();
});

const agent = supertest(app);

describe('Recommendation tests suite', () => {

  it('should insert recommendation', async () => {
    const recommendation = await insert();
    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { name: recommendation.name }
    });
    expect(recommendationCreated).not.toBeNull();
  });

  it('should return 201 after insert recommendation', async () => {
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/' + faker.random.word()
    };
    const res = await agent.post('/').send(recommendation);
    expect(res.status).toBe(201);
  })

});

afterAll(async () => {
  await prisma.$disconnect();
});