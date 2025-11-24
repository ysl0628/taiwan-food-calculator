'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function Home() {
  const router = useRouter();
  const { setFoodDB, setIsLoadingFoods } = useStore();

  // Load food data from JSON file
  useEffect(() => {
    const loadFoods = async () => {
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const response = await fetch(`${basePath}/foods.json`);
        if (response.ok) {
          const data = await response.json();
          setFoodDB(data);
        } else {
          console.error('Failed to load food data', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error loading food data:', error);
      } finally {
        setIsLoadingFoods(false);
      }
    };
    loadFoods();
  }, [setFoodDB, setIsLoadingFoods]);

  // Redirect to profile page
  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">載入中...</p>
      </div>
    </div>
  );
}
