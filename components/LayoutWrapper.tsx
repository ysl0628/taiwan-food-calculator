"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { useStore } from "@/store/useStore";
import { User, Menu, X, Info } from "./Icons";
import {
  CaseRecord,
  DailyRecord,
  MEAL_TIMES,
  FOOD_GROUPS,
  FoodItem,
} from "@/types";
import { WORKFLOW_NAV_ITEMS } from "./navItems";
import ExcelImporter from "./ExcelImporter";
import { ga } from "@/utils/ga";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isLoadingFoods,
    foodDB,
    setFoodDB,
    setIsLoadingFoods,
    initializeDemoCase,
    savedCases,
    addExtraFoods,
  } = useStore();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track page view on pathname change
  useEffect(() => {
    if (pathname) {
      ga.pageView(pathname);
    }
  }, [pathname]);

  // Initialize demo record
  const safeDemoRecord: DailyRecord = useMemo(() => {
    if (foodDB.length === 0) {
      const initialRecord: DailyRecord = {} as DailyRecord;
      MEAL_TIMES.forEach((m) => {
        initialRecord[m.id] = [];
      });
      return initialRecord;
    }

    const findFood = (predicate: (f: any) => boolean) => {
      return foodDB.find(predicate);
    };

    return {
      breakfast: [
        foodDB[0] ? { ...foodDB[0], quantity: 2 } : null,
        findFood((f: any) => f.name.includes("雞蛋") || f.name.includes("蛋"))
          ? {
              ...findFood(
                (f: any) => f.name.includes("雞蛋") || f.name.includes("蛋")
              )!,
              quantity: 1,
            }
          : null,
      ].filter((item): item is any => item !== null),
      morning_snack: [],
      lunch: [
        findFood((f: any) => f.name.includes("糙米") || f.name.includes("米飯"))
          ? {
              ...findFood(
                (f: any) => f.name.includes("糙米") || f.name.includes("米飯")
              )!,
              quantity: 1.5,
            }
          : null,
        findFood((f: any) => f.name.includes("雞胸") || f.name.includes("雞肉"))
          ? {
              ...findFood(
                (f: any) => f.name.includes("雞胸") || f.name.includes("雞肉")
              )!,
              quantity: 1.2,
            }
          : null,
        findFood((f: any) => f.category === "蔬菜")
          ? { ...findFood((f: any) => f.category === "蔬菜")!, quantity: 2 }
          : null,
      ].filter((item): item is any => item !== null),
      afternoon_snack: [
        findFood((f: any) => f.name.includes("香蕉"))
          ? { ...findFood((f: any) => f.name.includes("香蕉"))!, quantity: 1 }
          : null,
      ].filter((item): item is any => item !== null),
      dinner: [
        findFood((f: any) => f.name.includes("地瓜") || f.name.includes("甘藷"))
          ? {
              ...findFood(
                (f: any) => f.name.includes("地瓜") || f.name.includes("甘藷")
              )!,
              quantity: 1.5,
            }
          : null,
        findFood((f: any) => f.name.includes("鮭魚") || f.name.includes("魚"))
          ? {
              ...findFood(
                (f: any) => f.name.includes("鮭魚") || f.name.includes("魚")
              )!,
              quantity: 1,
            }
          : null,
      ].filter((item): item is any => item !== null),
      evening_snack: [],
    };
  }, [foodDB]);

  // Initialize demo portions
  const demoPortions = useMemo(() => {
    const initialPortions: any = {};
    FOOD_GROUPS.forEach((g) => {
      initialPortions[g.id] = {};
      MEAL_TIMES.forEach((m) => {
        initialPortions[g.id][m.id] = 0;
      });
    });
    const portions = JSON.parse(JSON.stringify(initialPortions));
    portions.starch.breakfast = 3;
    portions.meat_med.breakfast = 1;
    portions.starch.lunch = 3;
    portions.meat_low.lunch = 2;
    portions.veg.lunch = 2;
    return portions;
  }, []);

  // Load food data on mount
  useEffect(() => {
    const loadFoods = async () => {
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const response = await fetch(`${basePath}/foods.json`);
        if (response.ok) {
          const data = await response.json();
          setFoodDB(data);
        } else {
          console.error(
            "Failed to load food data",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error loading food data:", error);
      } finally {
        setIsLoadingFoods(false);
      }
    };
    loadFoods();
  }, [setFoodDB, setIsLoadingFoods]);

  // Initialize demo case when foodDB is loaded
  useEffect(() => {
    if (foodDB.length > 0 && savedCases.length === 0) {
      const allItems = Object.values(safeDemoRecord).flat();
      const actual = allItems.reduce<{
        cal: number;
        p: number;
        f: number;
        c: number;
      }>(
        (acc, item) => ({
          cal: acc.cal + item.cal * item.quantity,
          p: acc.p + item.p * item.quantity,
          f: acc.f + item.f * item.quantity,
          c: acc.c + item.c * item.quantity,
        }),
        { cal: 0, p: 0, f: 0, c: 0 }
      );

      const demoCase: CaseRecord = {
        id: "demo-case-001",
        timestamp: Date.now() - 172800000,
        profile: {
          name: "範例個案 - 陳大明",
          height: 176,
          weight: 82,
          age: 45,
          gender: "male",
          activityLevel: "moderate",
          notes: "輕微高血壓，建議控制鈉攝取量 (<2300mg)。喜好麵食。",
        },
        plan: {
          targetCalories: 2200,
          targetP: 110,
          targetF: 73,
          targetC: 275,
          portions: demoPortions,
        },
        record: safeDemoRecord,
        summary: {
          calories: { target: 2200, actual: actual.cal },
          protein: { target: 110, actual: actual.p },
          fat: { target: 73, actual: actual.f },
          carb: { target: 275, actual: actual.c },
        },
      };
      initializeDemoCase(demoCase);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodDB.length, savedCases.length]);

  if (isLoadingFoods) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">載入食材資料中...</p>
        </div>
      </div>
    );
  }

  const handleMobileImport = (items: FoodItem[]) => {
    addExtraFoods(items);
    setIsMobileMenuOpen(false);
  };

  // Mobile Header
  const MobileHeader = () => (
    <div className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-800">
          Nutri<span className="text-blue-600">Pro</span>
        </h1>
      </div>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        aria-label="開啟選單"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  );

  const MobileMenu = () => (
    <div className="lg:hidden fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div className="absolute inset-y-0 right-0 w-72 max-w-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">選單</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="關閉選單"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Workflow
            </h3>
            <div className="space-y-2">
              {WORKFLOW_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => {
                      ga.pageView(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 ${
                        isActive ? "text-blue-200" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              其他
            </h3>
            <Link
              href="/about"
              onClick={() => {
                ga.pageView("/about");
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                pathname === "/about"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              <Info
                className={`w-4 h-4 ${
                  pathname === "/about" ? "text-blue-200" : "text-slate-400"
                }`}
              />
              <span>關於</span>
            </Link>
          </div>
          {/* <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              資料匯入
            </h3>
            <ExcelImporter collapsed onImport={handleMobileImport} />
          </div> */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row">
      <Sidebar />
      <MobileHeader />
      {isMobileMenuOpen && <MobileMenu />}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
