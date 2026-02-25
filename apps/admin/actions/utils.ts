import 'server-only';
import { env } from '@/env';
import Hashids from 'hashids';

const recommendationHashIds = new Hashids(env.RECOMMENDATION_ID_HASH_SALT, 16);
const mallHashIds = new Hashids(env.MALL_ID_HASH_SALT, 16);

export const IdCodec = {
  recommendation: {
    encode: (recommendationId: number) => {
      return recommendationHashIds.encode([recommendationId]);
    },
    decode: (hash: string) => {
      const decoded = recommendationHashIds.decode(hash);
      if (decoded.length === 0) {
        throw new Error('Invalid recommendation ID');
      }
      return Number(decoded[0]);
    },
  },
  mall: {
    encode: (mallId: number) => {
      return mallHashIds.encode([mallId]);
    },
    decode: (hash: string) => {
      const decoded = mallHashIds.decode(hash);
      if (decoded.length === 0) {
        throw new Error('Invalid mall ID');
      }
      return Number(decoded[0]);
    },
  },
};
