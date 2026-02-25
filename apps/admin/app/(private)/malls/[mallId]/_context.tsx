'use client';
import { DEFAULT_SHOP_NO } from '@/const';
import { type ReactNode, createContext, useContext, useState } from 'react';

type MallContextType = {
  mallId: number;
  selectedShopNo: number;
  setSelectedShopNo: (shopNo: number) => void;
};

const MallContext = createContext<MallContextType | null>(null);

export default function MallProvider({
  children,
  mallId,
}: {
  children: ReactNode;
  mallId: number;
}) {
  const [selectedShopNo, setSelectedShopNo] = useState<number>(DEFAULT_SHOP_NO);

  return (
    <MallContext.Provider value={{ mallId, selectedShopNo, setSelectedShopNo }}>
      {children}
    </MallContext.Provider>
  );
}

export function useMallContext() {
  const context = useContext(MallContext);
  if (!context) {
    throw new Error('useMallContext must be used within a MallProvider');
  }
  return context;
}
