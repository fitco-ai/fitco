'use client';
import DataTableClient from '@/components/data-table/client';
import { useAllMallSkins } from '@/queries/malls';
import type { Skin, SkinDevice } from '@/types/mall';
import type { ColumnDef } from '@tanstack/react-table';
import ImageDialog from './image-dialog';
import PublishedIn from './published-in';
import ScriptHeader from './script-header';
import ScriptToggle from './script-toggle';

export default function MallSkins({ mallId }: { mallId: number }) {
  const { data: skins } = useAllMallSkins(mallId);

  const columns: ColumnDef<Skin>[] = [
    {
      accessorKey: 'skinNo',
      header: 'SKIN_NO(dev)',
      enableSorting: false,
      enableColumnFilter: false,
      cell: (data) => {
        const skinNo = data.getValue() as number;
        return <div>{skinNo}</div>;
      },
    },
    {
      accessorKey: 'skinThumbnailUrl',
      header: '이미지',
      enableSorting: false,
      enableColumnFilter: false,
      cell: (data) => {
        const skinThumbnailUrl = data.getValue() as string;
        return (
          <ImageDialog
            image={skinThumbnailUrl}
            skinName={data.row.original.skinName}
          />
        );
      },
    },
    {
      accessorKey: 'skinName',
      header: '스킨명',
      enableSorting: true,
      enableColumnFilter: false,
      cell: (data) => {
        const skinName = data.getValue() as string;
        return <div>{skinName}</div>;
      },
    },
    {
      accessorKey: 'device',
      header: '디바이스',
      enableSorting: true,
      enableColumnFilter: false,
      cell: (data) => {
        const device = data.getValue() as SkinDevice;
        return <div>{device.toUpperCase()}</div>;
      },
    },
    {
      accessorKey: 'publishedIn',
      header: '대표디자인',
      enableSorting: true,
      enableColumnFilter: false,
      cell: (data) => {
        const publishedIn = data.getValue() as string;
        return <PublishedIn publishedIn={publishedIn} />;
      },
    },
    {
      id: 'script',
      header: () => <ScriptHeader />,
      enableSorting: false,
      enableColumnFilter: false,
      cell: (data) => {
        const skinNo = data.row.original.skinNo;
        return <ScriptToggle skinNo={skinNo} />;
      },
    },
  ];

  return <DataTableClient columns={columns} data={skins ?? []} pageSize={50} />;
}
