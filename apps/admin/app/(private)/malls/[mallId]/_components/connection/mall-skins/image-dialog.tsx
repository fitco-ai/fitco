import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import Image from 'next/image';

export default function ImageDialog({
  image,
  skinName,
}: { image: string; skinName: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="size-fit p-0">
          <Image
            src={image}
            alt={skinName}
            width={50}
            height={50}
            className="object-center"
            unoptimized
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>스킨 이미지</DialogTitle>
          <DialogDescription>스킨 썸네일 이미지입니다.</DialogDescription>
        </DialogHeader>
        <Image
          src={image}
          alt={skinName}
          width={300}
          height={300}
          className="mx-auto size-[300px] object-center"
        />
      </DialogContent>
    </Dialog>
  );
}
