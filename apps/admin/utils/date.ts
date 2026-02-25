import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const seoulDayjs = (date?: Date | string) =>
  dayjs(date).tz('Asia/Seoul');
