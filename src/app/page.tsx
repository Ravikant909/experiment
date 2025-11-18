'use client';

import { TippingCalculator } from '@/components/tipping-calculator';
import { UserProfile } from '@/components/user-profile';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="absolute top-4 right-4">
        <UserProfile />
      </div>
      <TippingCalculator />
    </main>
  );
}
