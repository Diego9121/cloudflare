'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminProtectedProps {
  children: React.ReactNode;
}

export function AdminProtected({ children }: AdminProtectedProps) {
  const router = useRouter();

  useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin');
    }
  }, [router]);

  return <>{children}</>;
}
