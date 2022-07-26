import { faker } from '@faker-js/faker';
import { prisma } from './../../src/database.js';

export async function insert () {
  const recommendation = await prisma.recommendation.create({
    data: {
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/' + faker.random.word()
    }
  });
  return recommendation;
} 