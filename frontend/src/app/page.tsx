"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { LedgerHeader } from "@/components/LedgerHeader";
import { ExecutiveSummaryBanner } from "@/components/ExecutiveSummaryBanner";
import { CsvDeconstructTransition } from "@/components/CsvDeconstructTransition";
import { AuditLedgerTable } from "@/components/AuditLedgerTable";
import { RunwayForecastChart } from "@/components/RunwayForecastChart";
import { ActionStudioDrawer } from "@/components/ActionStudioDrawer";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import { runAuditByPersona, runAuditByFile } from "@/lib/api";
import { AuditResponse, MerchantAudit } from "@/types/audit";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [currentPersona, setCurrentPersona] = useState<string>("persona_dev");
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantAudit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isXRayOpen, setIsXRayOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set of merchant names with active kill-switches
  const [toggledKillSwitches, setToggledKillSwitches] = useState<Record<string, boolean>>({});

  // Fetch persona audit from FastAPI backend
  const loadAudit = useCallback(async (personaId: string) => {
    setIsLoading(true);
    setIsTransitioning(true);
    setError(null);

    const startTime = Date.now();
    try {
      const data = await runAuditByPersona(personaId);
      setAuditData(data);
      setCurrentPersona(personaId);

      // Auto-toggle top 2 highest-confidence leaks to KILLED on load so simulator is alive immediately
      const flaggedLeaks = data.merchants
        .filter((m) => m.is_leak && m.merchant_category === "subscription_or_saas")
        .sort((a, b) => b.tabpfn_leak_prob - a.tabpfn_leak_prob);

      const initialKilled: Record<string, boolean> = {};
      flaggedLeaks.slice(0, 2).forEach((m) => {
        initialKilled[m.merchant_name] = true;
      });
      setToggledKillSwitches(initialKilled);

      // Auto-select first flagged leak (or first merchant)
      const firstLeak = data.merchants.find((m) => m.is_leak) || data.merchants[0] || null;
      setSelectedMerchant(firstLeak);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load audit");
    } finally {
      setIsLoading(false);
      // Ensure the scanline animation is visible for at least 550ms
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 550 - elapsed);
      setTimeout(() => {
        setIsTransitioning(false);
      }, remaining);
    }
  }, []);

  // Auto-load persona_dev on initial mount
  useEffect(() => {
    loadAudit("persona_dev");
  }, [loadAudit]);

  const handleSelectPersona = (personaId: string) => {
    if (personaId === currentPersona && auditData) return;
    loadAudit(personaId);
  };

  const handleUploadCsv = async (file: File) => {
    setIsLoading(true);
    setIsTransitioning(true);
    setError(null);
    const startTime = Date.now();

    try {
      const data = await runAuditByFile(file);
      setAuditData(data);
      setCurrentPersona("custom_upload");

      // Auto-toggle top 2 highest-confidence leaks to KILLED on load
      const flaggedLeaks = data.merchants
        .filter((m) => m.is_leak && m.merchant_category === "subscription_or_saas")
        .sort((a, b) => b.tabpfn_leak_prob - a.tabpfn_leak_prob);

      const initialKilled: Record<string, boolean> = {};
      flaggedLeaks.slice(0, 2).forEach((m) => {
        initialKilled[m.merchant_name] = true;
      });
      setToggledKillSwitches(initialKilled);

      const firstLeak = data.merchants.find((m) => m.is_leak) || data.merchants[0] || null;
      setSelectedMerchant(firstLeak);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process uploaded CSV");
    } finally {
      setIsLoading(false);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 550 - elapsed);
      setTimeout(() => {
        setIsTransitioning(false);
      }, remaining);
    }
  };

  const handleToggleKillSwitch = (merchantName: string) => {
    setToggledKillSwitches((prev) => ({
      ...prev,
      [merchantName]: !prev[merchantName],
    }));
  };

  const handleToggleAllLeaks = (killAll: boolean) => {
    if (!auditData) return;
    const nextState: Record<string, boolean> = { ...toggledKillSwitches };
    auditData.merchants
      .filter((m) => m.is_leak && m.merchant_category === "subscription_or_saas")
      .forEach((m) => {
        nextState[m.merchant_name] = killAll;
      });
    setToggledKillSwitches(nextState);
  };

  // Reclaimed Monthly Savings dynamically calculated from active kill-switches
  const reclaimedMonthlySavings = useMemo(() => {
    if (!auditData) return 0;
    return Object.entries(toggledKillSwitches).reduce((acc, [mName, isKilled]) => {
      if (!isKilled) return acc;
      const m = auditData.merchants.find((x) => x.merchant_name === mName);
      return acc + (m ? m.monthly_cost : 0);
    }, 0);
  }, [auditData, toggledKillSwitches]);

  // Annualized reclaimed cash
  const reclaimedAnnualCash = useMemo(() => {
    return reclaimedMonthlySavings * 12;
  }, [reclaimedMonthlySavings]);

  // Total monthly recurring burn from all identified subscriptions
  const monthlyRecurringBurn = useMemo(() => {
    if (!auditData) return 0;
    return auditData.merchants
      .filter((m) => m.rule_flags.includes("RECURRING_SUB") || m.is_leak)
      .reduce((acc, m) => acc + m.monthly_cost, 0);
  }, [auditData]);

  // Extract raw sample strings for the 550ms transition scanline
  const rawSampleLines = useMemo(() => {
    if (!auditData || !auditData.merchants.length) return undefined;
    const lines: string[] = [];
    auditData.merchants.slice(0, 10).forEach((m) => {
      if (m.tx_history && m.tx_history.length > 0) {
        const lastTx = m.tx_history[m.tx_history.length - 1];
        lines.push(`${lastTx.date} | ${lastTx.raw_description.padEnd(35, " ")} | $${lastTx.amount.toFixed(2)}`);
      }
    });
    return lines.length ? lines : undefined;
  }, [auditData]);

  return (
    <div className="min-h-screen bg-[#F6F4EE] flex flex-col font-sans selection:bg-[#111315] selection:text-[#FDFCF9]">
      {/* 1. Exposed Top Structural Bar */}
      <LedgerHeader
        currentPersona={currentPersona}
        onSelectPersona={handleSelectPersona}
        onUploadCsv={handleUploadCsv}
        onOpenXRay={() => setIsXRayOpen(true)}
        executionMode={auditData?.execution_mode || "LOCAL OPEN-WEIGHTS (TabPFN-3.5)"}
        inferenceMs={auditData?.inference_ms || 0}
        rowsAnalyzed={auditData?.rows_processed || 0}
        isLoading={isLoading}
      />

      {/* Error Notice */}
      {error && (
        <div className="bg-[#FCECE9] border-b border-[#C93B2B]/30 px-6 py-2.5 text-xs text-[#C93B2B] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>COMMUNICATION FAULT: {error}</span>
          </div>
          <button
            onClick={() => loadAudit(currentPersona)}
            className="underline uppercase font-bold hover:text-[#111315]"
          >
            Retry Audit
          </button>
        </div>
      )}

      {/* 2. Full-Width Architectural Executive Summary Banner */}
      <ExecutiveSummaryBanner
        rowsAnalyzed={auditData?.rows_processed || 180}
        flaggedCount={auditData?.summary.flagged_merchants_count || 0}
        annualLeakEstimate={auditData?.summary.annual_projected_leak || 0}
        monthlyRecurringBurn={monthlyRecurringBurn}
        reclaimedAnnualCash={reclaimedAnnualCash}
        threeYearCompoundedSaved={auditData?.summary.three_year_compounded_savings || 0}
      />

      {/* 3. Main 12-Column Swiss Grid Architecture */}
      <main className="flex-1 w-full relative grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#DFDBD0] border-b border-[#DFDBD0]">
        {/* Crisp 550ms Raw-to-Refined Scanline Overlay */}
        <CsvDeconstructTransition
          isVisible={isTransitioning}
          rawSampleLines={rawSampleLines}
          sourceName={currentPersona.toUpperCase()}
        />

        {/* Left 7 Columns — The Interactive Audit Ledger Table */}
        <section className="lg:col-span-7 bg-[#FDFCF9] flex flex-col min-h-[500px]">
          <AuditLedgerTable
            merchants={auditData?.merchants || []}
            selectedMerchant={selectedMerchant}
            onSelectMerchant={setSelectedMerchant}
            toggledKillSwitches={toggledKillSwitches}
            onToggleKillSwitch={handleToggleKillSwitch}
            onToggleAllLeaks={handleToggleAllLeaks}
          />
        </section>

        {/* Right 5 Columns — 90-Day TabPFN Runway Chart & Action Studio Drawer */}
        <section className="lg:col-span-5 bg-[#FDFCF9] flex flex-col divide-y divide-[#DFDBD0] lg:sticky lg:top-0 lg:self-start">
          {/* Top-Right: 90-Day Runway Forecast Chart */}
          <RunwayForecastChart
            forecastData={auditData?.forecast_90d || []}
            reclaimedMonthlySavings={reclaimedMonthlySavings}
          />

          {/* Bottom-Right: Cancellation & Action Studio Drawer */}
          <ActionStudioDrawer selectedMerchant={selectedMerchant} />
        </section>
      </main>

      {/* 4. Architecture & Open-Weights X-Ray Modal */}
      <ArchitectureModal
        isOpen={isXRayOpen}
        onClose={() => setIsXRayOpen(false)}
        rowsAnalyzed={auditData?.rows_processed || 0}
        inferenceMs={auditData?.inference_ms || 0}
        executionMode={auditData?.execution_mode || "LOCAL OPEN-WEIGHTS (TabPFN-3.5)"}
        currentPersona={currentPersona}
      />
    </div>
  );
}
