
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, PanelLeftClose, PanelLeft, Info } from './Icons';
import { FoodItem } from '@/types';
// import ExcelImporter from './ExcelImporter';
import { useStore } from '@/store/useStore';
import { WORKFLOW_NAV_ITEMS } from './navItems';
import { ga } from '@/utils/ga';

interface SidebarProps {
  onImport?: (items: FoodItem[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onImport }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const addExtraFoods = useStore((state) => state.addExtraFoods);
  
  const handleImport = (items: FoodItem[]) => {
    addExtraFoods(items);
    if (onImport) onImport(items);
  };

  return (
    <div 
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className={`h-16 flex items-center border-b border-slate-100 transition-all flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg shadow-slate-500/20 flex-shrink-0">
                 <ChefHat className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 whitespace-nowrap overflow-hidden">
                Nutri<span className="text-blue-600">Pro</span>
              </h1>
            </div>
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors flex-shrink-0"
              title="收合選單"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="w-full h-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            title="展開選單"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {!isCollapsed && (
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 animate-in fade-in duration-200">
            Workflow
          </div>
        )}
        
        {WORKFLOW_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={isCollapsed ? item.label : ''}
              onClick={() => ga.pageView(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group
                ${isActive 
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              
              {!isCollapsed && (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* About Link */}
      <div className="px-3 pb-2">
        <Link
          href="/about"
          title={isCollapsed ? '關於' : ''}
          onClick={() => ga.pageView('/about')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group
            ${pathname === '/about' 
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <Info className={`w-5 h-5 flex-shrink-0 ${pathname === '/about' ? 'text-blue-400' : 'text-slate-400'}`} />
          
          {!isCollapsed && (
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">關於</span>
          )}

          {/* Tooltip for collapsed mode */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
              關於
            </div>
          )}
        </Link>
      </div>

      {/* Footer Actions */}
      {/* <div className={`px-3 pb-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!isCollapsed && (
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 whitespace-nowrap">
            Data Source
          </div>
        )}
        
        <div className="w-full flex justify-center">
           <ExcelImporter 
              onImport={handleImport} 
              collapsed={isCollapsed}
              className={isCollapsed ? '' : 'w-full justify-center'} 
            />
        </div>
      </div> */}

      {/* Info Box - Only visible when expanded */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100">
          <div className="bg-blue-50 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
            <h4 className="text-xs font-bold text-blue-800 mb-1">專業版功能</h4>
            <p className="text-[10px] text-blue-600/80 leading-relaxed">
              請依照順序完成：<br/>1. 評估 -&gt; 2. 設計 -&gt; 3. 紀錄 -&gt; 4. 分析
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
