import { seoulDayjs } from './date';

export const COMPARABLE_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const Formatters = {
  currency: (value: number) => {
    return `${new Intl.NumberFormat('ko-KR').format(value)}원`;
  },
  number: (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  },
  date: {
    simple: (value: Date | string) => {
      return seoulDayjs(value).format('YYYYMMDD');
    },
    hypen: (value: Date | string) => {
      return seoulDayjs(value).format('YYYY-MM-DD');
    },
    slash: (value: Date | string) => {
      return seoulDayjs(value).format('YYYY/MM/DD');
    },
    dot: (value: Date | string) => {
      return seoulDayjs(value).format('YYYY.MM.DD');
    },
    korYmd: (value: Date | string) => {
      return seoulDayjs(value).format('YYYY년 MM월 DD일');
    },
    korMMDD: (value: Date | string) => {
      return seoulDayjs(value).format('MM월 DD일');
    },
    korYmdHms: (value: Date | string) => {
      return seoulDayjs(value).format('YYYY년 MM월 DD일 HH시 mm분 ss초');
    },
    korYmdHm: (value: Date | string) => {
      return seoulDayjs(value).format('YYYY년 MM월 DD일 HH시 mm분');
    },
    yyyyMMddHHmm: (value: Date | string) => {
      return seoulDayjs(value).format('YYYY/MM/DD HH:mm');
    },
    yyyyMMddHHmmDot: (value: Date | string) => {
      return seoulDayjs(value).format('YYYY.MM.DD HH:mm');
    },
    tossPaymentsParam: (value: Date) => {
      return seoulDayjs(value).format('YYYY-MM-DD HH:mm:ss.SSS');
    },
    comparableDateString: (value: Date) => {
      return seoulDayjs(value).format(COMPARABLE_DATE_FORMAT);
    },
    daysStart: (value: string) => {
      return `${value} 00:00:00`;
    },
    daysEnd: (value: string) => {
      return `${value} 23:59:59`;
    },
  },
  phone: {
    simple: (phone: string) => {
      return formatPhoneNumber(phone);
    },
    removeSpaces: (phone: string) => {
      return phone.replace(/-/g, '');
    },
  },
};

const formatPhoneNumber = (phone: string) => {
  if (!phone) {
    return '-';
  }
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};
