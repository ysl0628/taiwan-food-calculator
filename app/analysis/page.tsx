'use client';

import { useRouter } from 'next/navigation';
import AnalysisView from '@/components/AnalysisView';
import { useStore } from '@/store/useStore';

export default function AnalysisPage() {
  const router = useRouter();
  const { dietPlan, dailyRecord, removeFromLog, saveCase } = useStore();

  const handleSave = () => {
    saveCase();
    router.push('/history');
    alert('儲存成功！');
  };

  return (
    <AnalysisView 
      plan={dietPlan}
      dailyRecord={dailyRecord}
      onSave={handleSave}
      onRemoveFromLog={removeFromLog}
    />
  );
}

