import type { DISPLAY_LOCATIONS } from '@/const';

export type Cafe24InitSearchParamData = {
  is_multi_shop: string;
  lang: string;
  mall_id: string;
  nation: string;
  shop_no: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_type: string;
  hmac: string;
};

export type Cafe24RefreshTokenResponse = {
  access_token: string;
  expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
};

export type Cafe24GetAllMallSkinsResponse = {
  themes: {
    skin_no: number;
    skin_code: string;
    skin_name: string;
    skin_thumbnail_url: string;
    published_in: string;
  }[];
};

type Cafe24ScriptTag = {
  shop_no: number;
  script_no: string;
  src: string;
  display_location: DISPLAY_LOCATION[];
  skin_no: string[];
  exclude_path: string[];
  integrity: string;
  created_date: string;
  updated_date: string;
};

export type Cafe24GetAllMallScriptTagsResponse = {
  scripttags: Cafe24ScriptTag[];
};

export type Cafe24GetScriptTagResponse = {
  scripttag: Cafe24ScriptTag;
};

export type DISPLAY_LOCATION = (typeof DISPLAY_LOCATIONS)[number];

export type Cafe24GetAllMallShopsResponse = {
  shops: {
    shop_no: number;
    default: 'T' | 'F';
    shop_name: string;
    pc_skin_no: 1;
    mobile_skin_no: 2;
    base_domain: string;
    primary_domain: string;
    slave_domain: string[];
    active: 'T' | 'F';
  }[];
};

type Cafe24OptionValue = {
  option_image_file: string;
  option_link_image: string;
  option_color: string;
  option_text: string;
  value_no: number | null;
  additional_amount: string;
};

type Cafe24Option = {
  option_code: string;
  option_name: string;
  option_value: Cafe24OptionValue[];
  required_option: 'T' | 'F';
  option_display_type: string;
};

export type Cafe24GetProductOptionsResponse = {
  option: {
    shop_no: number;
    product_no: number;
    has_option: 'T' | 'F';
    options: Cafe24Option[];
  };
};

export type Cafe24Product = {
  shop_no: number;
  product_no: number;
  category: {
    category_no: number;
    recommend: 'T' | 'F';
    new: 'T' | 'F';
  }[];
  list_image: string | null;
  product_name: string;
};

export type Cafe24GetProductResponse = {
  product: Cafe24Product;
};

export type Cafe24GetCategoriesResponse = {
  categories: {
    category_no: number;
    full_category_name: Record<string, string | null>;
  }[];
};

export type Cafe24SalesVolume = {
  shop_no: string;
  collection_date: string; // "YYYY-MM-DD"
  collection_hour: string; // "HH"
  product_price: string; // 소수점 포함 문자열
  product_option_price: string;
  settle_count: string;
  exchane_product_count: string;
  cancel_product_count: string;
  return_product_count: string;
  updated_date: string; // ISO8601 형식
  product_no: number;
  variants_code: string;
  total_sales: string;
};

export type Cafe24Board = {
  shop_no: number;
  board_no: number;
  board_name: string;
};

export type Cafe24GetAllBoardsResponse = {
  boards: Cafe24Board[];
};

export type Cafe24BoardArticle = {
  shop_no: number;
  article_no: number;
  board_no: number;
  product_no: number;
  title: string;
  content: string;
  created_date: string;
};

export type Cafe24GetAllBoardArticlesResponse = {
  articles: Cafe24BoardArticle[];
};

export type Cafe24ProductSales = {
  order_count: number;
  order_product_count: number;
  order_amount: number;
  product_no: number;
  product_name: string;
};

export type Cafe24CartProduct = {
  product_no: number;
  shop_no: number;
  created_date: string;
  variant_code: string;
};

export type Cafe24Customer = {
  shop_no: number;
  member_id: string;
};

export type Cafe24GetCustomerResponse = {
  customers: Cafe24Customer[];
};

export type Cafe24Variant = {
  options: {
    name: string;
    value: string;
  }[];
};

export type Cafe24Store = {
  shop_no: number;
  shop_name: string;
  admin_name: string;
  mall_id: string;
  base_domain: string;
  primary_domain: string;
  company_registration_no: string;
  company_name: string;
  president_name: string;
  company_condition: string;
  company_line: string;
  country: string;
  country_code: string;
  zipcode: string;
  address1: string;
  address2: string;
  phone: string;
  fax: string;
  email: string;
  notification_only_email: string;
  mall_url: string;
  mail_order_sales_registration: string;
  mail_order_sales_registration_number: string;
  missing_report_reason_type: string;
  missing_report_reason: string;
  about_us_contents: string;
  company_map_url: string;
  customer_service_phone: string;
  customer_service_email: string;
  customer_service_fax: string;
  customer_service_sms: string;
  customer_service_hours: string;
  privacy_officer_name: string;
  privacy_officer_position: string;
  privacy_officer_department: string;
  privacy_officer_phone: string;
  privacy_officer_email: string;
  contact_us_mobile: string;
  contact_us_contents: string;
  sales_product_categories: string[];
  business_country: string;
  youtube_shops_logo: string;
};

export type Cafe24GetStoreResponse = {
  store: Cafe24Store;
};
