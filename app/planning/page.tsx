'use client';

import { useRouter } from 'next/navigation';
import PlanningView from '@/components/PlanningView';
import { useStore } from '@/store/useStore';

export default function PlanningPage() {
  const router = useRouter();
  const { dietPlan, setDietPlan, tdee } = useStore();

  return (
    <PlanningView 
      plan={dietPlan} 
      tdee={tdee} 
      onUpdate={setDietPlan} 
      onNext={() => router.push('/calculator')}
    />
  );
}

