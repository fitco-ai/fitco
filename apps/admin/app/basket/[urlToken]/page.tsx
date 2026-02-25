import { getCartPage } from '@/actions/cart-page';
import { notFound, redirect } from 'next/navigation';

export default async function BasketPage({
  params,
}: { params: Promise<{ urlToken: string }> }) {
  const { urlToken } = await params;

  const cartPageUrl = await getCartPage(urlToken);

  if (!cartPageUrl) {
    notFound();
  }

  redirect(cartPageUrl);
}
