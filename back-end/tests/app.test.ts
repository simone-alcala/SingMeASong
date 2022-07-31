import supertest from 'supertest';
import { faker } from '@faker-js/faker';

import app from './../src/app.js';
import { prisma } from './../src/database.js';
import { insert } from './factories/recommendationFactory.js';
import { deleteAllData } from './factories/scenarioFactory.js';
import { recommendationService } from './../src/services/recommendationsService.js';

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

  it('should return 201 after insert a recommendation', async () => {
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/' + faker.random.word()
    };
    const res = await agent.post('/recommendations').send(recommendation);
    expect(res.status).toBe(201);
  })

  it('should upvote a recommendation', async () => {
    const recommendation = await insert();
    
    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { name: recommendation.name }
    });

    await agent.post(`/recommendations/${recommendationCreated.id}/upvote`).send();

    const recommendationCreatedUpVoted = await prisma.recommendation.findFirst({
      where: { id: recommendationCreated.id }
    });

    expect(recommendationCreatedUpVoted.score).toBe(1);
  });

  it('should downvote a recommendation', async () => {
    const recommendation = await insert();
    
    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { name: recommendation.name }
    });

    await agent.post(`/recommendations/${recommendationCreated.id}/downvote`).send();

    const recommendationCreatedDownVoted = await prisma.recommendation.findFirst({
      where: { id: recommendationCreated.id }
    });

    expect(recommendationCreatedDownVoted.score).toBe(-1);
  });

  it('should delete a recommendation if score < -5', async () => {
    const recommendation = await insert();
    
    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { name: recommendation.name }
    });

    for (let i = 0; i < 6; i++) {
      await agent.post(`/recommendations/${recommendationCreated.id}/downvote`).send();
    }  

    const recommendationCreatedDownVoted = await prisma.recommendation.findFirst({
      where: { id: recommendationCreated.id }
    });

    expect(recommendationCreatedDownVoted).toBeNull();
  });

  it('should return the last 10 recommendations', async () => {
    
    for (let i = 0; i < 12; i++) {
      await insert();
    }  
    
    const res = await agent.get('/recommendations');
    expect(res.body.length).toBe(10);
   
  });

  it('should return a recommendation by its id', async () => {
    
    const recommendation = await insert();
    
    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { name: recommendation.name }
    });
    
    const res = await agent.get(`/recommendations/${recommendationCreated.id}`);

    expect(res.body.name).toBe(recommendation.name);
   
  });

  it('should return 70% score > 10 and 30% score <= 10 recomendations', async () => {
    
    const recommendation1 = await insert();
    const recommendation2 = await insert();
        
    const recommendation1Created = await prisma.recommendation.findFirst({
      where: { name: recommendation1.name }
    });

    const recommendation2Created = await prisma.recommendation.findFirst({
      where: { name: recommendation2.name }
    });

    for (let i = 0; i < 12; i++) {
      await agent.post(`/recommendations/${recommendation1Created.id}/upvote`).send();
    }

    for (let i = 0; i < 3; i++) {
      await agent.post(`/recommendations/${recommendation2Created.id}/downvote`).send();
    }
    
    const recommendationsCount = new Map ();

    for (let i = 0; i < 10; i++) {
  
      const result = await recommendationService.getRandom();
      
      let value = recommendationsCount.get(result.id) as number;

      if (isNaN(value)) {
        value = 0;
      }
      
      recommendationsCount.set(result.id, value+1);
      
    }

    expect(recommendationsCount.get(recommendation1Created.id)).toBe(7);
    expect(recommendationsCount.get(recommendation2Created.id)).toBe(3);
    
  });

  it('should return the x top musics', async () => {
    
    const recommendation1 = await insert();
    const recommendation2 = await insert();
    const recommendation3 = await insert();
    
    const recommendation1Created = await prisma.recommendation.findFirst({
      where: { name: recommendation1.name }
    });

    const recommendation2Created = await prisma.recommendation.findFirst({
      where: { name: recommendation2.name }
    });

    const recommendation3Created = await prisma.recommendation.findFirst({
      where: { name: recommendation3.name }
    });

    await agent.post(`/recommendations/${recommendation1Created.id}/upvote`).send();
    await agent.post(`/recommendations/${recommendation1Created.id}/upvote`).send();
    await agent.post(`/recommendations/${recommendation3Created.id}/upvote`).send();
    
    const res = await agent.get(`/recommendations/top/10`);

    expect(res.body[0].id).toBe(recommendation1Created.id);
    expect(res.body[1].id).toBe(recommendation3Created.id);
    expect(res.body[2].id).toBe(recommendation2Created.id);
   
  });

});



afterAll(async () => {
  await prisma.$disconnect();
});