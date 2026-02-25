'use client';

import * as React from 'react';
import { cn } from '@repo/design-system/lib/utils';
import { useRef, useState } from 'react';

interface InputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode;
}

function Input({ className, type, icon, ...props }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasFile, setHasFile] = useState(false);

  const handleChange = () => {
    const fileList = inputRef.current?.files;
    setHasFile(Boolean(fileList && fileList.length > 0));
  };

  if (type === 'file') {
    return (
      <input
        ref={inputRef}
        type="file"
        data-slot="input"
        onChange={(e) => {
          handleChange();
          props.onChange?.(e);
        }}
        className={cn(
          'file:mt-[3px] file:inline-flex file:h-9 file:cursor-pointer file:rounded-[6px] file:border-0 file:bg-coolgray-100 file:px-1.5 file:font-medium file:text-black-900 file:text-sm',
          'flex h-[44px] w-full min-w-0 rounded-md border border-coolgray-200 bg-transparent px-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
          'focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          {
            'text-coolgray-600': !hasFile,
          },
          className
        )}
        {...props}
      />
    );
  }

  const isFilled = props.value != null && props.value !== '';

  return (
    <div className="relative w-full">
        {icon && (
            <div
                className={cn(
                    '-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 w-[16px] h-[16px]',
                    getIconColorClass(props.disabled, isFilled)
                )}
            >
                {icon}
            </div>
        )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          'flex h-[44px] w-full min-w-0 rounded-md border border-input bg-transparent',
          'text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
          'focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          {
            'pr-3 pl-9': icon,
            'px-3': !icon,
          },
          className
        )}
        {...props}
      />
    </div>
  );
}

function getIconColorClass(disabled?: boolean, isFilled?: boolean) {
  if (disabled) {
    return 'text-muted-foreground';
  }
  if (isFilled) {
    return 'text-foreground';
  }
  return 'text-muted-foreground';
}

export { Input };
