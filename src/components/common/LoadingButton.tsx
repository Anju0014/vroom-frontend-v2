'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useLoadingStore } from '@/store/loading/loadingStore';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void | Promise<void>; // now optional
}

export default function LoadingButton({ children, onClick, ...rest }: LoadingButtonProps) {
  const setLoading = useLoadingStore((state) => state.setLoading);

  const handleClick = async () => {
    if (!onClick) return; // do nothing if no click handler
    try {
      setLoading(true);
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button {...rest} onClick={handleClick}>
      {children}
    </button>
  );
}
