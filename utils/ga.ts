// Google Analytics 4 Event Tracking Utility

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * 發送 GA4 事件
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * 核心轉換事件
 */
export const ga = {
  // 完成個案評估
  completeProfileAssessment: () => {
    trackEvent('complete_profile_assessment');
  },

  // 完成熱量設計
  completeDietPlanning: () => {
    trackEvent('complete_diet_planning');
  },

  // 儲存個案
  saveCase: () => {
    trackEvent('save_case');
  },

  // 加入日記
  addToLog: (mealTime?: string) => {
    trackEvent('add_to_log', mealTime ? { meal_time: mealTime } : undefined);
  },

  // 查看食物詳情
  viewFoodDetail: () => {
    trackEvent('view_food_detail');
  },

  // 查看分析
  viewAnalysis: () => {
    trackEvent('view_analysis');
  },

  // 頁面切換
  pageView: (pageName: string) => {
    trackEvent('page_view', { page_name: pageName });
  },

  // 匯出 Excel
  exportExcel: (exportType: 'single' | 'summary') => {
    trackEvent('export_excel', { export_type: exportType });
  },

  // 載入個案
  loadCase: () => {
    trackEvent('load_case');
  },
};

