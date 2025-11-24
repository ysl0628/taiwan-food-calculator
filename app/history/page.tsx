'use client';

import { useRouter } from 'next/navigation';
import HistoryView from '@/components/HistoryView';
import { useStore } from '@/store/useStore';

export default function HistoryPage() {
  const router = useRouter();
  const { savedCases, deleteCase, loadCase } = useStore();

  const handleLoad = (caseRecord: any) => {
    loadCase(caseRecord);
    router.push('/profile');
  };

  return (
    <HistoryView 
      savedCases={savedCases}
      onDelete={deleteCase}
      onLoad={handleLoad}
    />
  );
}

