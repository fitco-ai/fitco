import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { AI_TOKEN_USAGES, MEMBER_GENDERS, PRODUCT_CATEGORIES } from './const';

/**
 * 성별
 */
export const memberGenderTypeEnum = pgEnum(
  'MemberGenderType',
  MEMBER_GENDERS.map((gender) => gender.value) as [string, ...string[]]
);

/**
 * 상품 카테고리
 */
export const productCategoryTypeEnum = pgEnum(
  'ProductCategoryType',
  PRODUCT_CATEGORIES.map((category) => category.value) as [string, ...string[]]
);

/**
 * ai 토큰 사용 유형
 */
export const aiTokenUsageTypeEnum = pgEnum(
  'AiTokenUsageType',
  AI_TOKEN_USAGES.map((usage) => usage.value) as [string, ...string[]]
);

// 관리자(admin) 로그인 유저
export const userTable = pgTable('User', {
  id: serial().primaryKey(),
  login: varchar({ length: 100 }).unique().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

/**
 * 관리자(admin) 로그인 유저 비밀번호
 */
export const userPasswordTable = pgTable('UserPassword', {
  id: serial().primaryKey(),
  userId: integer()
    .references(() => userTable.id)
    .notNull(),
  password: varchar({ length: 100 }).notNull(),
});

/**
 * 카페24 몰
 */
export const mallTable = pgTable('Mall', {
  id: serial().primaryKey(),
  cafe24MallId: varchar({ length: 100 }).unique().notNull(),
  memo: text(),
  createdAt: timestamp().notNull().defaultNow(),
  initialOrderCollected: boolean().notNull().default(false),
  initialBoardCollected: boolean().notNull().default(false),
});

/**
 * 카페24 몰 크레덴셜
 */
export const cafe24CredentialTable = pgTable('Cafe24Credential', {
  id: serial().primaryKey(),
  mallId: integer()
    .references(() => mallTable.id)
    .notNull()
    .unique(),
  accessToken: varchar({ length: 100 }).notNull(),
  accessTokenExpiresAt: varchar({ length: 100 }).notNull(),
  refreshToken: varchar({ length: 100 }).notNull(),
  refreshTokenExpiresAt: varchar({ length: 100 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

/**
 * 위젯 회원
 */
export const memberTable = pgTable('Member', {
  id: serial().primaryKey(),
  loginPhone: varchar({ length: 100 }).unique(), // null => Guest
  onboarding: boolean().notNull().default(true),
  height: integer(),
  weight: integer(),
  gender: memberGenderTypeEnum(),
  createdAt: timestamp().notNull().defaultNow(),
  agreementMarketing: boolean().notNull().default(false), // 미사용
  agreementData: boolean().notNull().default(false), // 장바구니 알림톡 수신
});

/**
 * 상품
 */
export const productTable = pgTable(
  'Product',
  {
    id: serial().primaryKey(),
    brand: varchar({ length: 100 }),
    productNo: integer(),
    productName: varchar({ length: 255 }),
    productImage: varchar({ length: 255 }),
    mallId: integer().references(() => mallTable.id),
    cafe24MallId: varchar({ length: 100 }),
    shopNo: integer(),
    category: productCategoryTypeEnum(),
    material: varchar({ length: 255 }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [
    unique('cafe24MallId_shopNo_productNo').on(
      table.cafe24MallId,
      table.shopNo,
      table.productNo
    ),
  ]
);

/**
 * 상품 상세 사이즈 스펙
 */
export const productSpecificationTable = pgTable(
  'ProductSpecification',
  {
    id: serial().primaryKey(),
    productId: integer()
      .references(() => productTable.id)
      .notNull(),
    size: varchar({ length: 255 }),
    spec: json(),
  },
  (table) => [unique('productId_size').on(table.productId, table.size)]
);

/**
 * 주문
 */
export const orderTable = pgTable(
  'Order',
  {
    id: serial().primaryKey(),
    memberId: integer().references(() => memberTable.id),
    productId: integer()
      .references(() => productTable.id)
      .notNull(),
    productSpecificationId: integer()
      .references(() => productSpecificationTable.id)
      .notNull(),
    cafe24OrderId: varchar({ length: 255 }), // url, 수동입력은 없음
    cafe24MemberId: varchar({ length: 255 }), // url, 수동입력은 없음
    cafe24BuyerPhone: varchar({ length: 255 }),
    orderDate: varchar({ length: 100 }).notNull(),
  },
  (table) => [
    unique('cafe24OrderId_productSpecificationId').on(
      table.cafe24OrderId,
      table.productSpecificationId
    ),
    unique('cafe24MemberId_productId_productSpecificationId').on(
      table.cafe24MemberId,
      table.productId,
      table.productSpecificationId
    ),
    unique('memberId_productId_productSpecificationId').on(
      table.memberId,
      table.productId,
      table.productSpecificationId
    ),
  ]
);

/**
 * 리뷰
 */
export const reviewTable = pgTable(
  'Review',
  {
    id: serial().primaryKey(),
    memberId: integer()
      .references(() => memberTable.id)
      .notNull(),
    productSpecificationId: integer()
      .references(() => productSpecificationTable.id)
      .notNull(),
    content: text(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [
    unique('memberId_productSpecificationId').on(
      table.memberId,
      table.productSpecificationId
    ),
  ]
);

/**
 * 사이즈 추천 결과
 */
export const recommendationTable = pgTable(
  'Recommendation',
  {
    id: serial().primaryKey(),
    memberId: integer()
      .references(() => memberTable.id)
      .notNull(),
    productId: integer()
      .references(() => productTable.id)
      .notNull(),
    productSpecificationId: integer()
      .references(() => productSpecificationTable.id)
      .notNull(),
    sizeResults: json(),
    input: json(),
    createdAt: timestamp().notNull().defaultNow(),
    ip: varchar({ length: 255 }),
    duration: varchar({ length: 255 }).default('0'),
    gptModel: varchar({ length: 255 }).default('gpt-4.1'),
  },
  (table) => [
    unique('memberId_productId_recommendation').on(
      table.memberId,
      table.productId
    ),
  ]
);

/**
 * 몰 가입(애플리케이션 설치) 시 인증코드
 */
export const codeStateTable = pgTable('CodeState', {
  id: serial().primaryKey(),
  pendingMallId: varchar({ length: 100 }).notNull(),
  state: varchar({ length: 100 }).unique().notNull(),
});

/**
 * 핸드폰 로그인 시 인증코드
 */
export const signInCodeTable = pgTable('SignInCode', {
  id: serial().primaryKey(),
  phone: varchar({ length: 100 }).notNull(),
  code: varchar({ length: 100 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

/**
 * 위젯 통계
 */
export const analyticsTable = pgTable('analytics', {
  id: serial().primaryKey(),
  mallId: integer()
    .references(() => mallTable.id)
    .notNull(),
  shopNo: integer().notNull(),
  click: boolean().notNull().default(false),
  result: boolean().notNull().default(false),
  cart: boolean().notNull().default(false),
  exitView: varchar({ length: 255 }),
  createdAt: timestamp().notNull().defaultNow(),
});

/**
 * AI 토큰 사용량
 */
export const aiTokenUsageTable = pgTable('AiTokenUsage', {
  id: serial().primaryKey(),
  type: aiTokenUsageTypeEnum().notNull(),
  token: integer().notNull(),
  mallId: integer().references(() => mallTable.id),
  productId: integer().references(() => productTable.id),
  dateStr: varchar({ length: 100 }).notNull(),
  durationSeconds: real().notNull().default(0),
});

/**
 * 쇼핑몰별 통계 데이터 공유링크
 */
export const externalReportSecretTable = pgTable('ExternalReportSecret', {
  id: serial().primaryKey(),
  mallId: integer()
    .references(() => mallTable.id)
    .notNull()
    .unique(),
  secret: varchar({ length: 100 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

/**
 * 카페24 쇼핑몰 사이즈 관련 게시글
 */
export const boardArticleTable = pgTable(
  'BoardArticle',
  {
    id: serial().primaryKey(),
    mallId: integer()
      .references(() => mallTable.id)
      .notNull(),
    shopNo: integer().notNull(),
    boardNo: integer().notNull(),
    articleNo: integer().notNull(),
    productNo: integer().notNull(),
    createdDate: varchar({ length: 100 }).notNull(),
  },
  (table) => [
    unique('mallId_shopNo_boardNo_articleNo').on(
      table.mallId,
      table.shopNo,
      table.boardNo,
      table.articleNo
    ),
  ]
);

/**
 * 관리자에서 수정 가능한 사이즈 추천 프롬프트
 */
export const sizePromptTable = pgTable('SizePrompt', {
  id: serial().primaryKey(),
  prompt: text().notNull(),
  comparePrompt: text().notNull().default(''),
  updatedAt: timestamp().notNull().defaultNow(),
});

/**
 * 뿌리오 크레덴셜
 */
export const ppurioCredentialTable = pgTable('PpurioCredential', {
  id: serial().primaryKey(),
  accessToken: text().notNull(),
  accessTokenExpiresAt: varchar({ length: 100 }).notNull(),
});

export const cafe24CartPageTable = pgTable('Cafe24CartPageTable', {
  id: serial().primaryKey(),
  token: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 255 }).notNull(),
});

export const memberProductTable = pgTable('MemberProduct', {
  id: serial().primaryKey(),
  memberId: integer()
    .references(() => memberTable.id)
    .notNull(),
  productId: integer()
    .references(() => productTable.id)
    .notNull(),
  category: productCategoryTypeEnum().notNull(),
});
