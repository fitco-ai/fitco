'use client';
import { DEFAULT_SHOP_NO } from '@/const';
import { type ReactNode, createContext, useContext, useState } from 'react';

type MallReportContextType = {
  selectedShopNo: number;
  setSelectedShopNo: (shopNo: number) => void;
};

const MallReportContext = createContext<MallReportContextType | null>(null);

export default function MallReportProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedShopNo, setSelectedShopNo] = useState<number>(DEFAULT_SHOP_NO);

  return (
    <MallReportContext.Provider value={{ selectedShopNo, setSelectedShopNo }}>
      {children}
    </MallReportContext.Provider>
  );
}

export function useMallReportContext() {
  const context = useContext(MallReportContext);
  if (!context) {
    throw new Error(
      'useMallReportContext must be used within a MallReportProvider'
    );
  }
  return context;
}
