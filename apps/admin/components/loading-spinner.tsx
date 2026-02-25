import { LoaderCircleIcon } from 'lucide-react';

export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <LoaderCircleIcon className="inline-block animate-spin" />
      {message && <div className="text-gray-700">{message}</div>}
    </div>
  );
}
