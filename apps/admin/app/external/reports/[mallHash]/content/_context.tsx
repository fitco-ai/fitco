'use client';
import { DEFAULT_SHOP_NO } from '@/const';
import { type ReactNode, createContext, useContext, useState } from 'react';

type ExternalMallReportContextType = {
  selectedShopNo: number;
  setSelectedShopNo: (shopNo: number) => void;
};

const ExternalMallReportContext =
  createContext<ExternalMallReportContextType | null>(null);

export default function ExternalMallReportProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedShopNo, setSelectedShopNo] = useState<number>(DEFAULT_SHOP_NO);

  return (
    <ExternalMallReportContext.Provider
      value={{ selectedShopNo, setSelectedShopNo }}
    >
      {children}
    </ExternalMallReportContext.Provider>
  );
}

export function useExternalMallReportContext() {
  const context = useContext(ExternalMallReportContext);
  if (!context) {
    throw new Error(
      'useExternalMallReportContext must be used within a ExternalMallReportProvider'
    );
  }
  return context;
}
