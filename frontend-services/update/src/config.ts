import { config as CommonConfig } from '@crosslab/service-common';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 9000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  orm: {
    ...CommonConfig.readOrmConfig(),
  },
};
