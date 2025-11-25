'use client';

import React from 'react';
import { Info, ChefHat, FileSpreadsheet, Activity } from '@/components/Icons';

export default function AboutPage() {
  return (
    <div className="w-full mx-auto p-4 lg:p-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">關於 NutriPro</h1>
            <p className="text-sm text-slate-500">台灣飲食紀錄與熱量計算專業版</p>
          </div>
        </div>

        {/* Description */}
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed">
            NutriPro 是一個專為營養師設計的專業工具，提供完整的個案評估、熱量設計、飲食紀錄追蹤和成效分析功能。
            幫助營養師更有效率地管理個案資料，提供精準的營養建議。本系統使用台灣食品營養成分資料庫，包含超過 2,000 種食物的完整營養資訊，並可以搜尋食物名稱、俗名或食品分類取得食物資訊。
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800">個案評估</h3>
            </div>
            <p className="text-sm text-slate-600">計算 TDEE、BMI 等基礎代謝指標</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-800">熱量設計</h3>
            </div>
            <p className="text-sm text-slate-600">制定個人化飲食計劃與份數分配</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-800">飲食紀錄</h3>
            </div>
            <p className="text-sm text-slate-600">記錄每日飲食內容與熱量攝取</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-800">成效分析</h3>
            </div>
            <p className="text-sm text-slate-600">分析營養攝取是否符合目標</p>
          </div>
        </div>

        {/* Data Source */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-slate-500" />
            資料來源
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            本系統使用衛生福利部食藥署
            <a href="https://consumer.fda.gov.tw/Food/TFND.aspx?nodeID=178" target="_blank" rel="noreferrer" className="text-blue-600 underline mx-1">
              食品營養成分資料庫
            </a>
            ，涵蓋 2,000+ 種食物的完整營養資訊（含基本營養素、維生素、礦物質、脂肪酸、胺基酸等）。資料版本：<strong>2025/07/10</strong>。
          </p>
        </div>

        {/* Technical Info */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3">技術資訊</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500">框架</span>
              <p className="font-medium text-slate-700">Next.js 15</p>
            </div>
            <div>
              <span className="text-slate-500">語言</span>
              <p className="font-medium text-slate-700">TypeScript</p>
            </div>
            <div>
              <span className="text-slate-500">樣式</span>
              <p className="font-medium text-slate-700">Tailwind CSS</p>
            </div>
            <div>
              <span className="text-slate-500">狀態管理</span>
              <p className="font-medium text-slate-700">Zustand</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3">聯絡資訊</h3>
          <p className="text-sm text-slate-600 mb-4">如有任何問題或建議，請聯絡我們。</p>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              GitHub：<a href="https://github.com/ysl0628" className="text-blue-600 underline" target="_blank" rel="noreferrer">github.com/ysl0628</a>
            </p>
            <p>
              Email：<a href="mailto:yihsinlan@gmail.com" className="text-blue-600 underline">yihsinlan@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Version */}
        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">Taiwan NutriCalc Pro v1.1.0</p>
          <p className="text-xs text-slate-400 mt-1">© 2025 Renee Lan</p>
        </div>
      </div>
    </div>
  );
}

