"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LandingView from "../components/LandingView";
import FuelForm from "../components/FuelForm";
import ResultSection from "../components/ResultSection";
import AssumptionsInfo from "../components/AssumptionsInfo";
import { CalculatorInput, ValidationErrors, CalculationResult, FuelPreset } from "../types/calculator";
import { validateCalculatorInputs, calculateFuelCost } from "../utils/calculator";

export default function Home() {
  // Navigation view state: "landing" (01 Landing) or "calculator" (08 Kalkulator BBM)
  const [currentView, setCurrentView] = useState<"landing" | "calculator">("landing");

  // Calculator State
  const [input, setInput] = useState<CalculatorInput>({
    dailyDistance: "",
    vehicleEfficiency: "",
    fuelTypeId: "pertalite",
    fuelTypeName: "Pertalite (RON 90)",
    fuelPricePerLiter: "10000",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleInputChange = (field: keyof CalculatorInput, value: string) => {
    setInput((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user begins typing
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
      fuelPricePerLiter: preset.defaultPrice > 0 ? String(preset.defaultPrice) : prev.fuelPricePerLiter,
    }));

    if (errors.fuelPricePerLiter) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.fuelPricePerLiter;
        return next;
      });
    }
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
    const exampleInput: CalculatorInput = {
      dailyDistance: "60",
      vehicleEfficiency: "12",
      fuelTypeId: "pertalite",
      fuelTypeName: "Pertalite (RON 90)",
      fuelPricePerLiter: "10000",
    };

    setInput(exampleInput);
    setErrors({});

    const calcResult = calculateFuelCost(60, 12, 10000, "Pertalite (RON 90)");
    setResult(calcResult);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans text-[#0F172A]">
      {/* Sticky Navbar */}
      <Navbar
        activeTab={currentView}
        onSelectTab={(tab) => setCurrentView(tab)}
      />

      <main className="flex-1">
        {currentView === "landing" ? (
          /* 01 Landing Page */
          <LandingView
            onNavigateToCalculator={() => setCurrentView("calculator")}
          />
        ) : (
          /* 08 Kalkulator BBM (KEL2-54) */
          <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 space-y-6">
            {/* Top Navigation Breadcrumb */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <button
                type="button"
                onClick={() => setCurrentView("landing")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
              >
                ← Kembali ke Beranda
              </button>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Frame 08 · Kalkulator BBM
              </span>
            </div>

            {/* Title Header matching Figma zn */}
            <div className="flex flex-col gap-1.5 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Kalkulator Biaya BBM
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                  30 Hari/Bulan &amp; 365 Hari/Tahun
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Kalkulator Biaya BBM Kendaraan
              </h1>
              <p className="max-w-2xl text-xs text-slate-500 sm:text-sm leading-relaxed">
                Perkirakan berapa sebenarnya kebutuhan liter dan biaya yang Anda keluarkan setiap hari, bulan, dan tahun untuk kendaraan BBM konvensional berdasarkan jarak tempuh dan efisiensi konsumsi bahan bakar.
              </p>
            </div>

            {/* Two-column Layout matching Figma Nr */}
            <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
              {/* Left Column: Form Parameters */}
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

              {/* Right Column: Results Section */}
              <section aria-label="Hasil Estimasi">
                <ResultSection
                  result={result}
                  onLoadExample={handleLoadExample}
                />
              </section>
            </div>

            {/* Bottom Section: Assumptions & Formulas */}
            <section aria-label="Asumsi dan Metodologi">
              <AssumptionsInfo />
            </section>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigateToCalculator={() => setCurrentView("calculator")}
        onNavigateToLanding={() => setCurrentView("landing")}
      />
    </div>
  );
}
