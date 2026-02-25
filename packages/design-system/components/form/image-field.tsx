import { useRef } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Plus, RefreshCcw } from 'lucide-react';
import { Input } from '../ui/input';

type ImageSize = [number, number];

type Props<T extends FieldValues> = {
  title: string;
  name: FieldPath<T>;
  control: Control<T>;
  description?: string;
  size?: ImageSize;
};

export const ImageField = <T extends FieldValues>({
  title,
  name,
  control,
  size,
  description,
}: Props<T>) => {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange, ...fieldProps } }) => (
        <FormItem>
          <FormLabel>{title}</FormLabel>
          <FormControl>
            <div className="flex items-center gap-1">
              {value && (
                <Image
                  src={value}
                  alt={'thumbnail'}
                  width={200}
                  height={50}
                  className="h-[50px] w-[50px] shrink-0 rounded-md object-cover"
                />
              )}
              <Button
                type="button"
                onClick={() => {
                  fileRef.current?.click();
                }}
                className="size-12"
              >
                {value ? <RefreshCcw /> : <Plus />}
              </Button>
              <Input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  onChange('');
                  // const url = await uploadFile(file);
                  // onChange(url);
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
          <FormDescription>
            {description && <span>{description}</span>}
            {size && (
              <span>
                권장 사이즈 - {size[0]}px x {size[1]}px
              </span>
            )}
            <span>이미지 포멧 - JPG, PNG</span>
          </FormDescription>
        </FormItem>
      )}
    />
  );
};
