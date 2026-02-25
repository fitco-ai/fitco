import type { DISPLAY_LOCATION } from './external';

export type Skin = {
  skinNo: number;
  skinCode: string;
  skinName: string;
  skinThumbnailUrl: string;
  publishedIn: string;
  device: SkinDevice;
};

export type SkinDevice = 'pc' | 'mobile';

export type ScriptTag = {
  shopNo: number;
  scriptNo: string;
  src: string;
  displayLocation: DISPLAY_LOCATION[];
  skinNo: string[];
  excludePath: string[];
  integrity: string;
  createdDate: Date;
  updatedDate: Date;
};

export type Shop = {
  shopNo: number;
  default: 'T' | 'F';
  shopName: string;
  pcSkinNo: 1;
  mobileSkinNo: 2;
  baseDomain: string;
  primaryDomain: string;
  slaveDomain: string[];
  active: 'T' | 'F';
};
