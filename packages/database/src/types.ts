import type {
  aiTokenUsageTable,
  boardArticleTable,
  cafe24CartPageTable,
  cafe24CredentialTable,
  codeStateTable,
  mallTable,
  memberProductTable,
  memberTable,
  orderTable,
  ppurioCredentialTable,
  productSpecificationTable,
  productTable,
  recommendationTable,
  reviewTable,
  signInCodeTable,
  sizePromptTable,
  userTable,
} from './schema';

export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;

export type SelectCafe24Credential = typeof cafe24CredentialTable.$inferSelect;
export type InsertCafe24Credential = typeof cafe24CredentialTable.$inferInsert;

export type SelectCodeState = typeof codeStateTable.$inferSelect;
export type InsertCodeState = typeof codeStateTable.$inferInsert;

export type SelectMall = typeof mallTable.$inferSelect;
export type InsertMall = typeof mallTable.$inferInsert;

export type SelectMember = typeof memberTable.$inferSelect;
export type InsertMember = typeof memberTable.$inferInsert;

export type SelectSignInCode = typeof signInCodeTable.$inferSelect;
export type InsertSignInCode = typeof signInCodeTable.$inferInsert;

export type SelectOrder = typeof orderTable.$inferSelect;
export type InsertOrder = typeof orderTable.$inferInsert;

export type SelectProduct = typeof productTable.$inferSelect;
export type InsertProduct = typeof productTable.$inferInsert;

export type SelectProductSpecification =
  typeof productSpecificationTable.$inferSelect;
export type InsertProductSpecification =
  typeof productSpecificationTable.$inferInsert;

export type SelectReview = typeof reviewTable.$inferSelect;
export type InsertReview = typeof reviewTable.$inferInsert;

export type SelectRecommendation = typeof recommendationTable.$inferSelect;
export type InsertRecommendation = typeof recommendationTable.$inferInsert;

export type SelectBoardArticle = typeof boardArticleTable.$inferSelect;
export type InsertBoardArticle = typeof boardArticleTable.$inferInsert;

export type SelectSizePrompt = typeof sizePromptTable.$inferSelect;
export type InsertSizePrompt = typeof sizePromptTable.$inferInsert;

export type SelectPpurioCredential = typeof ppurioCredentialTable.$inferSelect;
export type InsertPpurioCredential = typeof ppurioCredentialTable.$inferInsert;

export type SelectCafe24CartPage = typeof cafe24CartPageTable.$inferSelect;
export type InsertCafe24CartPage = typeof cafe24CartPageTable.$inferInsert;

export type SelectMemberProduct = typeof memberProductTable.$inferSelect;
export type InsertMemberProduct = typeof memberProductTable.$inferInsert;

export type SelectAiTokenUsage = typeof aiTokenUsageTable.$inferSelect;
export type InsertAiTokenUsage = typeof aiTokenUsageTable.$inferInsert;
