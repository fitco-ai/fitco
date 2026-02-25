import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Settings } from 'lucide-react';
import MallSkins from './mall-skins';
import ShopSelect from './shop-select';

interface ConnectionProps {
  mallId: number;
}

export default function Connection({ mallId }: ConnectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          쇼핑몰 연동 관리
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ShopSelect mallId={mallId} />
        <MallSkins mallId={mallId} />
      </CardContent>
    </Card>
  );
}
