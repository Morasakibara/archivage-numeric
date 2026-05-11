import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  type: 'postgres',
  synchronize: false, // Toujours false en production, gérer via migrations
  logging: process.env.NODE_ENV === 'development',
}));
