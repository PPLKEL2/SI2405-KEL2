"use client";

import React, { useState } from "react";
import LandingView from "../components/LandingView";
import DashboardSidebar, { DashboardTab } from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import MaintenanceCalculatorView from "../components/MaintenanceCalculatorView";
import FuelForm from "../components/FuelForm";
import ResultSection from "../components/ResultSection";
import AssumptionsInfo from "../components/AssumptionsInfo";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

import {
  CalculatorInput,
  ValidationErrors,
  CalculationResult,
  FuelPreset,
} from "../types/calculator";
import {
  validateCalculatorInputs,
  calculateFuelCost,
} from "../utils/calculator";

export default function Home() {
  // Main view: "landing" or "dashboard"
  const [currentView, setCurrentView] = useState<"landing" | "dashboard">("dashboard");

  // Dashboard active sub-tab (defaults to "biaya-bbm" which is Frame 08 Kalkulator BBM & Perawatan)
  const [activeTab, setActiveTab] = useState<DashboardTab>("biaya-bbm");

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fallback / legacy state for basic manual fuel calculator (KEL2-54 original)
  const [showManualBasicForm, setShowManualBasicForm] = useState(false);
  const [input, setInput] = useState<CalculatorInput>({
    dailyDistance: "60",
    vehicleEfficiency: "12",
    fuelTypeId: "pertalite",
    fuelTypeName: "Pertalite (RON 90)",
    fuelPricePerLiter: "10000",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<CalculationResult | null>(() =>
    calculateFuelCost(60, 12, 10000, "Pertalite (RON 90)")
  );

  const handleInputChange = (field: keyof CalculatorInput, value: string) => {
    setInput((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof ValidationErrors];
        return next;
      });
    }
  };

  const handleSelectPreset = (preset: FuelPreset) => {
    setInput((prev) => ({
      ...prev,
      fuelTypeId: preset.id,
      fuelTypeName: preset.name,
      fuelPricePerLiter:
        preset.defaultPrice > 0 ? String(preset.defaultPrice) : prev.fuelPricePerLiter,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCalculatorInputs(input);
    if (!validation.isValid || !validation.parsedValues) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    const calcResult = calculateFuelCost(
      validation.parsedValues.distance,
      validation.parsedValues.efficiency,
      validation.parsedValues.price,
      input.fuelTypeName || "BBM Kustom"
    );
    setResult(calcResult);
  };

  const handleReset = () => {
    setInput({
      dailyDistance: "",
      vehicleEfficiency: "",
      fuelTypeId: "pertalite",
      fuelTypeName: "Pertalite (RON 90)",
      fuelPricePerLiter: "10000",
    });
    setErrors({});
    setResult(null);
  };

  const handleLoadExample = () => {
    setInput({
      dailyDistance: "60",
      vehicleEfficiency: "12",
      fuelTypeId: "pertalite",
      fuelTypeName: "Pertalite (RON 90)",
      fuelPricePerLiter: "10000",
    });
    setErrors({});
    const calcResult = calculateFuelCost(60, 12, 10000, "Pertalite (RON 90)");
    setResult(calcResult);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A]">
      {currentView === "landing" ? (
        /* ================= 01 LANDING VIEW ================= */
        <div className="flex min-h-screen flex-col">
          <Navbar
            activeTab="landing"
            onSelectTab={(tab) => {
              if (tab === "calculator") {
                setCurrentView("dashboard");
                setActiveTab("biaya-bbm");
              } else {
                setCurrentView("landing");
              }
            }}
          />
          <main className="flex-1">
            <LandingView
              onNavigateToCalculator={() => {
                setCurrentView("dashboard");
                setActiveTab("biaya-bbm");
              }}
            />
          </main>
          <Footer
            onNavigateToCalculator={() => {
              setCurrentView("dashboard");
              setActiveTab("biaya-bbm");
            }}
            onNavigateToLanding={() => setCurrentView("landing")}
          />
        </div>
      ) : (
        /* ================= DASHBOARD VIEW (FIGMA FRAME 08 & 09) ================= */
        <div className="flex min-h-screen">
          {/* Left Sidebar */}
          <DashboardSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            onBackToLanding={() => setCurrentView("landing")}
          />

          {/* Right Main Content */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Top Header */}
            <DashboardHeader
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onBackToLanding={() => setCurrentView("landing")}
            />

            {/* Main Scrollable Area */}
            <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1300px] w-full mx-auto">
              {/* Tab: BIAYA BBM & PERAWATAN (FRAME 08) */}
              {activeTab === "biaya-bbm" && (
                <div className="space-y-8">
                  {/* Mode switcher pill: Biaya & Perawatan Figma vs Form Manual Bebas */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Frame 08 · Kalkulator BBM &amp; Perawatan
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowManualBasicForm(false)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          !showManualBasicForm
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Estimasi Standar &amp; Perawatan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowManualBasicForm(true)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          showManualBasicForm
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Formulir Manual Bebas (KEL2-54)
                      </button>
                    </div>
                  </div>

                  {!showManualBasicForm ? (
                    <MaintenanceCalculatorView />
                  ) : (
                    /* Basic manual form view */
                    <div className="space-y-6">
                      <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
                        <section aria-label="Parameter BBM" className="lg:sticky lg:top-24">
                          <FuelForm
                            input={input}
                            errors={errors}
                            onChange={handleInputChange}
                            onSelectPreset={handleSelectPreset}
                            onSubmit={handleSubmit}
                            onReset={handleReset}
                            onLoadExample={handleLoadExample}
                          />
                        </section>
                        <section aria-label="Hasil Estimasi">
                          <ResultSection
                            result={result}
                            onLoadExample={handleLoadExample}
                          />
                        </section>
                      </div>
                      <section aria-label="Asumsi dan Metodologi">
                        <AssumptionsInfo />
                      </section>
                    </div>
                  )}
                </div>
              )}

              {/* Other tabs fallback view */}
              {activeTab !== "biaya-bbm" && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 capitalize">
                      Modul {activeTab.replace("-", " ")}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                      Halaman ini berfokus pada Kalkulator Biaya BBM &amp; Perawatan Kendaraan Konvensional.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("biaya-bbm")}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                    >
                      Buka Biaya BBM &amp; Perawatan
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
