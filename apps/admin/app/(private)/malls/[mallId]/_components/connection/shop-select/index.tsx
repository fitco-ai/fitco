'use client';
import { useAllMallShops } from '@/queries/malls';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { useCallback } from 'react';
import { useMallContext } from '../../../_context';

export default function ShopSelect({ mallId }: { mallId: number }) {
  const { data: shops } = useAllMallShops(mallId);
  const { selectedShopNo, setSelectedShopNo } = useMallContext();

  const handleChange = useCallback(
    (value: string) => {
      setSelectedShopNo(Number(value));
    },
    [setSelectedShopNo]
  );

  return (
    <div>
      {shops ? (
        <Select value={selectedShopNo.toString()} onValueChange={handleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="쇼핑몰 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {shops.map((shop) => (
                <SelectItem key={shop.shopNo} value={shop.shopNo.toString()}>
                  {shop.shopName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <Skeleton className="h-9 w-[180px]" />
      )}
    </div>
  );
}
