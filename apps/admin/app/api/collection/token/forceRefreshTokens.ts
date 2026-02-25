import { refreshTokens } from '@/actions/cafe24/refreshTokens';
import { getAllCafe24Credentials } from '@/actions/malls/getAllCafe24Credentials';
import { seoulDayjs } from '@/utils/date';

export async function forceRefreshTokens() {
  const allCafe24Credentials = await getAllCafe24Credentials();

  for (const credential of allCafe24Credentials) {
    const now = seoulDayjs();
    const refreshExpiry = seoulDayjs(credential.refreshTokenExpiresAt);
    const threeDayBeforeExpiry = refreshExpiry.subtract(3, 'day');

    if (now.isAfter(threeDayBeforeExpiry)) {
      await refreshTokens(credential.mallId, credential.refreshToken);
    }
  }
}
