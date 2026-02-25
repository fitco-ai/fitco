import { addScriptTag } from '@/actions/cafe24/addWidget';
import { deleteWidgetFromSkin } from '@/actions/cafe24/deleteWidgetFromSkin';
import { useFitcoAIScriptTag } from '@/queries/malls';
import { Switch } from '@repo/design-system/components/ui/switch';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMallContext } from '../../../_context';

export default function ScriptToggle({
  skinNo,
}: {
  skinNo: number;
}) {
  const { mallId, selectedShopNo } = useMallContext();
  const { data: fitcoAIScriptTag } = useFitcoAIScriptTag(
    mallId,
    selectedShopNo
  );
  const [loading, setLoading] = useState(false);

  const addScript = async () => {
    const response = await addScriptTag(mallId, skinNo, selectedShopNo);
    if (!response.ok) {
      toast.error('위젯 추가 중 오류가 발생했습니다.');
    } else if (response.data?.isExists) {
      toast.warning('이미 위젯이 존재합니다. 새로고침 후 확인해주세요.');
    } else if (response.data?.isAdded) {
      toast.success('위젯이 추가되었습니다.');
    }
  };

  const deleteScript = async () => {
    if (!fitcoAIScriptTag) {
      return;
    }
    const response = await deleteWidgetFromSkin(
      mallId,
      selectedShopNo,
      skinNo,
      fitcoAIScriptTag.scriptNo
    );
    if (!response.ok) {
      toast.error('위젯 해제 중 오류가 발생했습니다.');
    } else if (response.data?.isNotFound) {
      toast.warning('위젯이 존재하지 않습니다. 새로고침 후 확인해주세요.');
    } else if (response.data?.isDeleted) {
      toast.success('위젯이 해제되었습니다.');
    }
  };

  const handleChange = async (checked: boolean) => {
    setLoading(true);
    if (checked) {
      await addScript();
    } else {
      await deleteScript();
    }
    setLoading(false);
  };

  const isApplied = !!fitcoAIScriptTag?.skinNo.includes(skinNo.toString());

  return (
    <div>
      <Switch
        checked={isApplied}
        onCheckedChange={handleChange}
        disabled={loading}
      />
    </div>
  );
}
