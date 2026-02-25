import { analyzeCompareSize } from '@/actions/ai/analyzeCompareSize';
import { analyzeSize } from '@/actions/ai/analyzeSize';
import { extractSizeOptionTextFromVariant } from '@/actions/ai/extractSizeOptionTextFromVariant';
import { getAllMallShopsByMallId } from '@/actions/cafe24/getAllMallShopsByMallId';
import { getCafe24CartProductsByCafe24MemberId } from '@/actions/cafe24/getCafe24CartProductsByCafe24MemberId';
import { getCafe24CustomersByLoginPhone } from '@/actions/cafe24/getCafe24CustomerByLoginPhone';
import { getCafe24ProductVariant } from '@/actions/cafe24/getCafe24ProductVariant';
import { getAllMalls } from '@/actions/malls/getAllMalls';
import { getAllMembersPhoneMap } from '@/actions/members/getAllMembersPhoneMap';
import type { SendTarget } from '@/actions/ppurio/sendkakaotalk';
import { createProduct } from '@/actions/products/createProduct';
import { getProduct } from '@/actions/products/getProduct';
import { getProductSpecifications } from '@/actions/products/getProductSpecification';
import { createRecommendation } from '@/actions/recommendation/createRecommendation';
import { getMemberRecommendation } from '@/actions/recommendation/getMemberRecommendation';
import { getAllMemberReviews } from '@/actions/reviews/getAllMemberReviews';
import type { Cafe24CartProduct, Shop } from '@/types';
import type { SizeResult } from '@/types/widget-request';
import { CART_TEST } from '@/utils/common';
import { seoulDayjs } from '@/utils/date';
import { COMPARABLE_DATE_FORMAT } from '@/utils/formatters';
import { isAllSizeResult } from '@/utils/size-result';
import type { SelectMember, SelectProduct } from '@repo/database';
import type { PRODUCT_CATEGORIES } from '@repo/database/src/const';

type MessageCustomer = {
  member: SelectMember;
  loginPhone: string;
  cafe24MemberId: string;
  shopNo: number;
  shopName: string;
};

type CartProduct = {
  cafe24CartProduct: Cafe24CartProduct;
  customer: MessageCustomer;
  product?: SelectProduct;
};

type SendData = {
  mallId: number;
  cartProduct: CartProduct;
  sizeResults: SizeResult[];
  selectedSizeOptionText: string;
};

export async function sendRecommendation() {
  try {
    const membersPhoneMapResponse = await getAllMembersPhoneMap();
    const membersPhoneMap = membersPhoneMapResponse.data?.membersPhoneMap;

    if (!membersPhoneMap) {
      throw new Error('No members phone map');
    }

    const allMallsResponse = await getAllMalls();
    const allMalls = allMallsResponse.data?.malls;

    if (!allMalls) {
      throw new Error('No all malls');
    }

    for (const mall of allMalls) {
      const shopsResponse = await getAllMallShopsByMallId(mall.id);
      const shops = shopsResponse.data?.shops;

      if (!shops) {
        throw new Error(`No shops. mallId: ${mall.id}`);
      }

      const customers = await retrieveCustomers(
        mall.id,
        mall.cafe24MallId,
        shops,
        membersPhoneMap
      );

      if (!customers) {
        throw new Error('No customers');
      }

      console.log('customers', customers.length);

      let cartProducts = await retrieveCartProducts(
        mall.id,
        mall.cafe24MallId,
        customers
      );

      if (!cartProducts) {
        throw new Error('No cart products');
      }

      console.log('cartProducts', cartProducts);

      cartProducts = await crawlProducts(mall.cafe24MallId, cartProducts);

      if (!cartProducts) {
        throw new Error('crawlProducts failed');
      }

      const sendData = await generateSendData(
        mall.id,
        mall.cafe24MallId,
        cartProducts
      );

      if (!sendData) {
        throw new Error('generateSendData failed');
      }

      console.log('sendData', sendData);

      await sendMessage(sendData);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function retrieveCustomers(
  mallId: number,
  cafe24MallId: string,
  shops: Shop[],
  membersPhoneMap: Map<string, SelectMember & { loginPhone: string }>
): Promise<MessageCustomer[] | null> {
  try {
    const result: MessageCustomer[] = [];

    for (const shop of shops) {
      for (const phoneMember of membersPhoneMap.values()) {
        const loginPhone = phoneMember.loginPhone;

        const cafe24CustomersResponse = await getCafe24CustomersByLoginPhone({
          mallId,
          cafe24MallId,
          shopNo: shop.shopNo,
          loginPhone,
        });
        const cafe24Customers = cafe24CustomersResponse.data?.customers;

        if (!cafe24Customers) {
          throw new Error('No cafe24 customers');
        }

        result.push(
          ...cafe24Customers.map((customer) => ({
            member: phoneMember,
            cafe24MemberId: customer.member_id,
            loginPhone,
            shopNo: shop.shopNo,
            shopName: shop.shopName,
          }))
        );
      }
    }
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function retrieveCartProducts(
  mallId: number,
  cafe24MallId: string,
  customers: MessageCustomer[]
): Promise<CartProduct[] | null> {
  try {
    const result: CartProduct[] = [];

    for (const customer of customers) {
      const cartProductsResponse = await getCafe24CartProductsByCafe24MemberId({
        mallId,
        cafe24MallId,
        shopNo: customer.shopNo,
        cafe24MemberId: customer.cafe24MemberId,
      });
      const cartProducts = cartProductsResponse.data?.cartProducts;

      if (!cartProducts) {
        throw new Error('No cart products');
      }

      for (const cartProduct of cartProducts) {
        const createdDate = seoulDayjs(cartProduct.created_date).format(
          COMPARABLE_DATE_FORMAT
        );
        const now = seoulDayjs().format(COMPARABLE_DATE_FORMAT);
        const diffDays = seoulDayjs(createdDate).diff(seoulDayjs(now), 'day');
        const needToSend = CART_TEST ? true : diffDays > 4;
        if (needToSend) {
          result.push({
            cafe24CartProduct: cartProduct,
            customer,
          });
        }
      }
    }
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function crawlProducts(
  cafe24MallId: string,
  cartProducts: CartProduct[]
): Promise<CartProduct[] | null> {
  try {
    const result: CartProduct[] = [];
    for (const cartProduct of cartProducts) {
      const getProductResponse = await getProduct(
        cafe24MallId,
        cartProduct.cafe24CartProduct.shop_no,
        cartProduct.cafe24CartProduct.product_no
      );
      const product = getProductResponse.data?.product;
      if (product) {
        result.push({
          ...cartProduct,
          product,
        });
      } else {
        const createProductResponse = await createProduct(
          cafe24MallId,
          cartProduct.cafe24CartProduct.shop_no,
          cartProduct.cafe24CartProduct.product_no
        );
        const created = createProductResponse.data?.product;
        if (!created) {
          throw new Error('createProductResponse failed');
        }
        result.push({
          ...cartProduct,
          product: created,
        });
      }
    }
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function generateSendData(
  mallId: number,
  cafe24MallId: string,
  cartProducts: CartProduct[]
): Promise<SendData[] | null> {
  try {
    const result: SendData[] = [];

    for (const cartProduct of cartProducts) {
      if (!cartProduct.product) {
        throw new Error('product not found');
      }

      const variantResponse = await getCafe24ProductVariant({
        mallId,
        cafe24MallId,
        shopNo: cartProduct.cafe24CartProduct.shop_no,
        productNo: cartProduct.cafe24CartProduct.product_no,
        variantCode: cartProduct.cafe24CartProduct.variant_code,
      });
      const variant = variantResponse.data?.variant;

      if (!variant) {
        throw new Error('No variant');
      }

      const selectedSizeOptionText = await extractSizeOptionTextFromVariant(
        variant.options
      );

      const getMemberRecommendationResponse = await getMemberRecommendation({
        memberId: cartProduct.customer.member.id,
        productId: cartProduct.product.id,
      });

      const recommendation =
        getMemberRecommendationResponse.data?.recommendation;

      if (recommendation) {
        const sizeResults = recommendation.sizeResults as SizeResult[];
        if (isAllSizeResult(sizeResults)) {
          result.push({
            cartProduct,
            sizeResults: recommendation.sizeResults as SizeResult[],
            selectedSizeOptionText,
            mallId,
          });
          continue;
        }
      }

      const getAllMemberReviewsResponse = await getAllMemberReviews(
        cartProduct.customer.member.id,
        cartProduct.product
          .category as (typeof PRODUCT_CATEGORIES)[number]['value']
      );

      const reviews = getAllMemberReviewsResponse.data?.reviews;

      if (!reviews) {
        throw new Error('getAllMemberReviewsResponse failed');
      }

      if (reviews.length === 0) {
        continue;
      }

      const specs = await getProductSpecifications(
        mallId,
        cartProduct.cafe24CartProduct.shop_no,
        cartProduct.cafe24CartProduct.product_no
      );

      const analyzeSizeResponse = await analyzeSize({
        targetProductSpecs: specs,
        memberReviews: reviews,
        member: cartProduct.customer.member,
        mallId,
        productId: cartProduct.product.id,
        productMaterial: cartProduct.product.material,
      });

      if (!analyzeSizeResponse) {
        throw new Error('analyzeSize failed');
      }

      const bestSize =
        analyzeSizeResponse.sizeResult.find((r) => r.best)?.size ?? '';
      const bestProductSpecificationId =
        specs.find((s) => s.size === bestSize)?.id ?? -1;

      if (bestProductSpecificationId !== -1) {
        await createRecommendation(
          cartProduct.customer.member.id,
          cartProduct.product.id,
          bestProductSpecificationId,
          analyzeSizeResponse.sizeResult,
          analyzeSizeResponse.inputData,
          null
        );
      }

      result.push({
        cartProduct,
        selectedSizeOptionText,
        sizeResults: analyzeSizeResponse.sizeResult,
        mallId,
      });
    }
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function sendMessage(sendData: SendData[]) {
  try {
    const sendTargets: SendTarget[] = [];

    for (const data of sendData) {
      const sizeResults = data.sizeResults;
      const bestSize = sizeResults.find((r) => r.best)?.size ?? '';
      const loginPhone = data.cartProduct.customer.loginPhone;
      const productId = data.cartProduct.product?.id;
      const productName = data.cartProduct.product?.productName;
      const productMaterial = data.cartProduct.product?.material ?? null;
      const title = data.sizeResults.find((r) => r.best)?.title;
      const subTitle = data.sizeResults.find((r) => r.best)?.subTitle;
      const shopName = data.cartProduct.customer.shopName;
      const mallId = data.mallId;
      const selectedSizeOptionText = data.selectedSizeOptionText;

      if (bestSize === '') {
        throw new Error('bestSize not found');
      }

      if (!productName || !productId) {
        throw new Error('product not found');
      }

      if (!title || !subTitle) {
        throw new Error('title or subTitle not found');
      }

      // if (selectedSizeOptionText === bestSize) {
      //   return;
      // }

      // const url = `https://${cafe24MallId}.cafe24.com/shop${shopNo}/order/basket.html`;
      // const urlToken = randomBase62(10);
      // const shortenLink = `${env.NEXT_PUBLIC_SITE_URL}/basket/${urlToken}`;

      // await database.insert(cafe24CartPageTable).values({
      //   token: urlToken,
      //   url,
      // });

      const sendType = bestSize === selectedSizeOptionText ? 'base' : 'compare';

      if (sendType === 'base') {
        const target: SendTarget = {
          type: 'base',
          to: loginPhone,
          changeWord: {
            var1: shopName,
            var2: productName,
            var3: `Size ${selectedSizeOptionText}`,
            var4: `Size ${bestSize}`,
            var5: `${title}\n${subTitle}`,
          },
        };
        sendTargets.push(target);
      } else {
        const size1 = sizeResults.find(
          (r) => r.size === selectedSizeOptionText
        );
        const size2 = sizeResults.find((r) => r.size === bestSize);

        if (!size1 || !size2) {
          throw new Error('size1 or size2 not found');
        }

        const analyzeCompareSizeResponse = await analyzeCompareSize({
          mallId,
          size1,
          size2,
          productId,
          productMaterial,
          short: true,
        });

        const compareSummaries = analyzeCompareSizeResponse?.compareSummaries;

        if (!compareSummaries) {
          throw new Error('compareSummaries not found');
        }

        const target: SendTarget = {
          type: 'compare',
          to: loginPhone,
          changeWord: {
            var1: shopName,
            var2: productName,
            var3: `Size ${selectedSizeOptionText}`,
            var4: `Size ${bestSize}`,
            var5: `${title}\n${subTitle}`,
            var6: compareSummaries[0].content,
            var7: compareSummaries[1].content,
          },
        };
        sendTargets.push(target);
      }
    }
    if (sendTargets.length > 0) {
      console.log('sendTargets', sendTargets);
      // await requestSend(sendTargets);
    }
  } catch (error) {
    console.error(error);
  }
}
