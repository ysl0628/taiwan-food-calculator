'use client';

import { useRouter } from 'next/navigation';
import CalculatorView from '@/components/CalculatorView';
import { useStore } from '@/store/useStore';

export default function CalculatorPage() {
  const router = useRouter();
  const { 
    dietPlan, 
    visibleNutrients, 
    setVisibleNutrients, 
    extraFoods, 
    dailyRecord, 
    addToLog, 
    removeFromLog, 
    foodDB 
  } = useStore();

  return (
    <CalculatorView 
      dietPlan={dietPlan}
      visibleNutrients={visibleNutrients}
      setVisibleNutrients={setVisibleNutrients}
      extraFoods={extraFoods}
      dailyRecord={dailyRecord}
      onAddToLog={addToLog}
      onRemoveFromLog={removeFromLog}
      onGoToAnalysis={() => router.push('/analysis')}
      foodDB={foodDB}
    />
  );
}

