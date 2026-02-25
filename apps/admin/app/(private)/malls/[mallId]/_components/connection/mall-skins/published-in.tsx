import { useAllMallShops } from '@/queries/malls';
import { useMallContext } from '../../../_context';

export default function PublishedIn({ publishedIn }: { publishedIn: string }) {
  const { mallId } = useMallContext();
  const { data: shops } = useAllMallShops(mallId);
  if (publishedIn === 'unpublished') {
    return <div>-</div>;
  }

  const shop = shops?.find((shop) => shop.shopNo === Number(publishedIn));
  if (!shop) {
    return <div>-</div>;
  }

  return <div>{shop.shopName}</div>;
}
