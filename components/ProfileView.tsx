
import React from 'react';
import { UserProfile, ActivityLevel } from '@/types';
import { User, Activity, Scale, ArrowRight, Flame } from './Icons';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onNext: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdate, onNext }) => {

  const handleChange = (field: keyof UserProfile, value: any) => {
    onUpdate({ ...profile, [field]: value });
  };

  // --- Calculations ---
  
  // 1. Basic Data
  const heightM = profile.height / 100;
  const weight = profile.weight;
  
  // 2. BMI
  const bmiNum = heightM > 0 ? weight / (heightM * heightM) : 0;
  const bmi = bmiNum > 0 ? bmiNum.toFixed(1) : '-';

  let bmiStatus = '';
  let bmiColor = 'text-slate-400 bg-slate-100';
  
  if (bmiNum > 0) {
    if (bmiNum < 18.5) { bmiStatus = '過輕'; bmiColor = 'text-blue-600 bg-blue-50'; }
    else if (bmiNum < 24) { bmiStatus = '正常'; bmiColor = 'text-emerald-600 bg-emerald-50'; }
    else if (bmiNum < 27) { bmiStatus = '過重'; bmiColor = 'text-orange-600 bg-orange-50'; }
    else if (bmiNum < 30) { bmiStatus = '輕度肥胖'; bmiColor = 'text-red-500 bg-red-50'; }
    else if (bmiNum < 35) { bmiStatus = '中度肥胖'; bmiColor = 'text-red-600 bg-red-50'; }
    else { bmiStatus = '重度肥胖'; bmiColor = 'text-red-700 bg-red-100'; }
  }

  // 3. IBW (Ideal Body Weight) = 22 * H^2
  const ibwVal = 22 * heightM * heightM;
  const ibw = heightM > 0 ? ibwVal.toFixed(1) : '-';

  // 4. IBW Range (BMI 18.5 ~ 23.9)
  const ibwMin = heightM > 0 ? (18.5 * heightM * heightM).toFixed(1) : '-';
  const ibwMax = heightM > 0 ? (23.9 * heightM * heightM).toFixed(1) : '-';

  // 5. ABW (Adjusted Body Weight) = (Actual - IBW) * 0.25 + IBW
  // Useful for obese patients calculation
  const abwVal = (weight - ibwVal) * 0.25 + ibwVal;
  const abw = heightM > 0 ? abwVal.toFixed(1) : '-';

  // 6. BMR (Mifflin-St Jeor)
  let bmr = 0;
  if (profile.height && profile.weight && profile.age) {
    const s = profile.gender === 'male' ? 5 : -161;
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + s;
  }

  // 7. TDEE
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const tdee = Math.round(bmr * multipliers[profile.activityLevel]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 md:flex-row flex-col">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-6 h-6" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800">個案評估 (Assessment)</h2>
            <p className="text-slate-500">輸入基本資料以進行體位分析與熱量計算</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form (4 cols) */}
        <div className="lg:col-span-4 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">基本資料</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">姓名 / 代號</label>
              <input 
                type="text" 
                value={profile.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="請輸入個案名稱"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">性別</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleChange('gender', 'male')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${profile.gender === 'male' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  男性
                </button>
                <button 
                   onClick={() => handleChange('gender', 'female')}
                   className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${profile.gender === 'female' ? 'bg-pink-50 border-pink-200 text-pink-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  女性
                </button>
              </div>
            </div>

            {/* Age in its own row */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">年齡</label>
                <input 
                    type="number" 
                    value={profile.age || ''}
                    onChange={(e) => handleChange('age', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                />
            </div>

            {/* Height and Weight in same row */}
            <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">身高 (cm)</label>
                    <input 
                        type="number" 
                        value={profile.height || ''}
                        onChange={(e) => handleChange('height', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                    />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">體重 (kg)</label>
                  <input 
                    type="number" 
                    value={profile.weight || ''}
                    onChange={(e) => handleChange('weight', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                  />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">活動量</label>
                <select 
                value={profile.activityLevel}
                onChange={(e) => handleChange('activityLevel', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                <option value="sedentary">久坐 (辦公室, 無運動)</option>
                <option value="light">輕度 (每週運動 1-3 天)</option>
                <option value="moderate">中度 (每週運動 3-5 天)</option>
                <option value="active">高度 (每週運動 6-7 天)</option>
                <option value="very_active">極度 (勞力, 劇烈運動)</option>
                </select>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis & Results (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* Body Composition Analysis Grid */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" /> 體位分析
                  </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-slate-100">
                  {/* BMI */}
                  <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors">
                      <span className="text-xs text-slate-400 font-bold uppercase mb-1">BMI</span>
                      <span className="text-2xl font-black text-slate-800 font-mono mb-1">{bmi}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bmiColor}`}>
                          {bmiStatus || '-'}
                      </span>
                  </div>

                  {/* IBW */}
                  <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors">
                      <span className="text-xs text-slate-400 font-bold uppercase mb-1">理想體重 (IBW)</span>
                      <span className="text-2xl font-bold text-slate-700 font-mono mb-1">{ibw}</span>
                      <span className="text-xs text-slate-400">kg</span>
                      <span className="text-[10px] text-slate-300 mt-1">(22 × H²)</span>
                  </div>

                  {/* Range */}
                  <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors">
                      <span className="text-xs text-slate-400 font-bold uppercase mb-1">理想範圍</span>
                      <span className="text-lg font-bold text-slate-700 font-mono mb-1 whitespace-nowrap">{ibwMin} ~ {ibwMax}</span>
                      <span className="text-xs text-slate-400">kg</span>
                      <span className="text-[10px] text-slate-300 mt-1">(BMI 18.5~23.9)</span>
                  </div>

                  {/* ABW */}
                  <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors">
                      <span className="text-xs text-slate-400 font-bold uppercase mb-1">調整體重 (ABW)</span>
                      <span className="text-2xl font-bold text-slate-700 font-mono mb-1">{abw}</span>
                      <span className="text-xs text-slate-400">kg</span>
                      <span className="text-[10px] text-slate-300 mt-1">(肥胖計算用)</span>
                  </div>
              </div>
           </div>

           {/* Energy Calculation Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 flex-shrink-0">
                    <Activity className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">基礎代謝率 (BMR)</div>
                    <div className="text-2xl font-bold text-slate-800 font-mono">{Math.round(bmr)} <span className="text-sm text-slate-400 font-normal">kcal</span></div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Flame className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">每日總消耗 (TDEE)</div>
                    <div className="text-3xl font-bold text-blue-600 font-mono leading-none">{tdee} <span className="text-sm text-slate-400 font-normal">kcal</span></div>
                 </div>
              </div>
           </div>

           {/* Notes */}
           <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">備註 / 病歷摘要</label>
              <textarea 
                value={profile.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm h-24 resize-none"
                placeholder="輸入個案飲食偏好、病史或備註..."
              />
           </div>

           <div className="pt-2">
             <button 
               onClick={onNext}
               className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-[0.98]"
             >
               下一步：設定熱量設計
               <ArrowRight className="w-4 h-4" />
             </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileView;
