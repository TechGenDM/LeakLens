"use client";

import React, { useState } from "react";
import { MerchantAudit } from "@/types/audit";
import {
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Copy,
  Clock,
  ShieldAlert,
  Server,
  CalendarDays,
  Zap,
  RotateCcw,
} from "lucide-react";

interface AuditLedgerTableProps {
  merchants: MerchantAudit[];
  selectedMerchant: MerchantAudit | null;
  onSelectMerchant: (merchant: MerchantAudit) => void;
  toggledKillSwitches: Record<string, boolean>;
  onToggleKillSwitch: (merchantName: string) => void;
  onToggleAllLeaks?: (killAll: boolean) => void;
}

type FilterTab =
  | "ALL_FLAGGED"
  | "PRICE_HIKES"
  | "DUPLICATES"
  | "TRIAL_CONVERSIONS"
  | "CLEAN_SUBSCRIPTIONS"
  | "ALL";

export const AuditLedgerTable: React.FC<AuditLedgerTableProps> = ({
  merchants,
  selectedMerchant,
  onSelectMerchant,
  toggledKillSwitches,
  onToggleKillSwitch,
  onToggleAllLeaks,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL_FLAGGED");
  const [hoveredBadgeMerchant, setHoveredBadgeMerchant] = useState<string | null>(null);

  // Tab counts
  const flaggedMerchants = merchants.filter(
    (m) => m.is_leak && m.merchant_category === "subscription_or_saas"
  );
  const countFlagged = flaggedMerchants.length;
  const countHikes = merchants.filter(
    (m) => m.merchant_category === "subscription_or_saas" && m.rule_flags.includes("PRICE_HIKE")
  ).length;
  const countDuplicates = merchants.filter(
    (m) => m.merchant_category === "subscription_or_saas" && m.rule_flags.includes("DUPLICATE_SAME_MONTH")
  ).length;
  const countTrials = merchants.filter(
    (m) => m.merchant_category === "subscription_or_saas" && m.rule_flags.includes("TRIAL_CONVERSION")
  ).length;
  const countCleanSubs = merchants.filter(
    (m) => !m.is_leak && m.merchant_category === "subscription_or_saas"
  ).length;
  const countAll = merchants.length;

  // Check how many leaks are currently toggled
  const killedLeaksCount = flaggedMerchants.filter((m) => toggledKillSwitches[m.merchant_name]).length;
  const allLeaksKilled = countFlagged > 0 && killedLeaksCount === countFlagged;

  const handleMasterToggle = () => {
    if (onToggleAllLeaks) {
      onToggleAllLeaks(!allLeaksKilled);
    }
  };

  // Filtered list
  const filteredMerchants = merchants.filter((m) => {
    switch (activeTab) {
      case "ALL_FLAGGED":
        return m.is_leak && m.merchant_category === "subscription_or_saas";
      case "PRICE_HIKES":
        return m.merchant_category === "subscription_or_saas" && m.rule_flags.includes("PRICE_HIKE");
      case "DUPLICATES":
        return m.merchant_category === "subscription_or_saas" && m.rule_flags.includes("DUPLICATE_SAME_MONTH");
      case "TRIAL_CONVERSIONS":
        return m.merchant_category === "subscription_or_saas" && m.rule_flags.includes("TRIAL_CONVERSION");
      case "CLEAN_SUBSCRIPTIONS":
        return !m.is_leak && m.merchant_category === "subscription_or_saas";
      case "ALL":
      default:
        return true;
    }
  });

  // Render Cadence Regularity Dots
  const renderCadenceDots = (regularity: number) => {
    let filled = 1;
    if (regularity >= 0.9) filled = 4;
    else if (regularity >= 0.7) filled = 3;
    else if (regularity >= 0.4) filled = 2;

    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-[#5A5D64]" title={`Regularity score: ${(regularity * 100).toFixed(0)}%`}>
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full inline-block ${
              i < filled ? "bg-[#111315]" : "bg-[#DFDBD0]"
            }`}
          />
        ))}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFCF9]">
      {/* Top Filter Bar */}
      <div className="px-3 sm:px-5 py-2.5 border-b border-[#DFDBD0] bg-[#FDFCF9] flex flex-wrap items-center justify-start gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A5D64] mr-0.5 shrink-0" />

          {/* Filter Tabs */}
          <button
            type="button"
            onClick={() => setActiveTab("ALL_FLAGGED")}
            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase rounded-[3px] border transition-colors flex items-center gap-1.5 ${
              activeTab === "ALL_FLAGGED"
                ? "bg-[#C93B2B] text-[#FDFCF9] border-[#C93B2B] font-bold"
                : "bg-[#FDFCF9] text-[#5A5D64] border-transparent hover:border-[#DFDBD0] hover:text-[#111315]"
            }`}
          >
            <span>ALL FLAGGED</span>
            <span className={`text-[10px] px-1 rounded-[2px] tabular-nums ${activeTab === "ALL_FLAGGED" ? "bg-black/20 text-white" : "bg-[#EFECE4] text-[#111315]"}`}>
              {countFlagged}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PRICE_HIKES")}
            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase rounded-[3px] border transition-colors flex items-center gap-1.5 ${
              activeTab === "PRICE_HIKES"
                ? "bg-[#111315] text-[#FDFCF9] border-[#111315] font-bold"
                : "bg-[#FDFCF9] text-[#5A5D64] border-transparent hover:border-[#DFDBD0] hover:text-[#111315]"
            }`}
          >
            <span>PRICE HIKES</span>
            <span className={`text-[10px] px-1 rounded-[2px] tabular-nums ${activeTab === "PRICE_HIKES" ? "bg-white/20 text-white" : "bg-[#EFECE4] text-[#111315]"}`}>
              {countHikes}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DUPLICATES")}
            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase rounded-[3px] border transition-colors flex items-center gap-1.5 ${
              activeTab === "DUPLICATES"
                ? "bg-[#111315] text-[#FDFCF9] border-[#111315] font-bold"
                : "bg-[#FDFCF9] text-[#5A5D64] border-transparent hover:border-[#DFDBD0] hover:text-[#111315]"
            }`}
          >
            <span>DUPLICATES</span>
            <span className={`text-[10px] px-1 rounded-[2px] tabular-nums ${activeTab === "DUPLICATES" ? "bg-white/20 text-white" : "bg-[#EFECE4] text-[#111315]"}`}>
              {countDuplicates}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TRIAL_CONVERSIONS")}
            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase rounded-[3px] border transition-colors flex items-center gap-1.5 ${
              activeTab === "TRIAL_CONVERSIONS"
                ? "bg-[#111315] text-[#FDFCF9] border-[#111315] font-bold"
                : "bg-[#FDFCF9] text-[#5A5D64] border-transparent hover:border-[#DFDBD0] hover:text-[#111315]"
            }`}
          >
            <span>TRIALS</span>
            <span className={`text-[10px] px-1 rounded-[2px] tabular-nums ${activeTab === "TRIAL_CONVERSIONS" ? "bg-white/20 text-white" : "bg-[#EFECE4] text-[#111315]"}`}>
              {countTrials}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CLEAN_SUBSCRIPTIONS")}
            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase rounded-[3px] border transition-colors flex items-center gap-1.5 ${
              activeTab === "CLEAN_SUBSCRIPTIONS"
                ? "bg-[#0D6E52] text-[#FDFCF9] border-[#0D6E52] font-bold"
                : "bg-[#FDFCF9] text-[#5A5D64] border-transparent hover:border-[#DFDBD0] hover:text-[#111315]"
            }`}
          >
            <span>CLEAN SUBSCRIPTIONS</span>
            <span className={`text-[10px] px-1 rounded-[2px] tabular-nums ${activeTab === "CLEAN_SUBSCRIPTIONS" ? "bg-black/20 text-white" : "bg-[#EFECE4] text-[#111315]"}`}>
              {countCleanSubs}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase rounded-[3px] border transition-colors flex items-center gap-1.5 ${
              activeTab === "ALL"
                ? "bg-[#111315] text-[#FDFCF9] border-[#111315] font-bold"
                : "bg-[#FDFCF9] text-[#5A5D64] border-transparent hover:border-[#DFDBD0] hover:text-[#111315]"
            }`}
          >
            <span>ALL MERCHANTS</span>
            <span className={`text-[10px] px-1 rounded-[2px] tabular-nums ${activeTab === "ALL" ? "bg-white/20 text-white" : "bg-[#EFECE4] text-[#111315]"}`}>
              {countAll}
            </span>
          </button>
        </div>

        {/* Master Kill/Reset Hardware Toggle Button */}
        {countFlagged > 0 && onToggleAllLeaks && (
          <div className="ml-auto shrink-0">
            <button
              type="button"
              onClick={handleMasterToggle}
              className={`px-3 py-1 text-[10px] font-mono font-bold tracking-wider uppercase rounded-[3px] border transition-all cursor-pointer flex items-center gap-1 ${
                allLeaksKilled
                  ? "bg-[#EFECE4] text-[#111315] border-[#DFDBD0] hover:bg-[#DFDBD0]"
                  : "bg-[#0D6E52] text-[#FDFCF9] border-[#0D6E52] hover:bg-[#09523d] shadow-sm"
              }`}
            >
              {allLeaksKilled ? (
                <>
                  <RotateCcw className="w-3 h-3" />
                  <span>[ RESET SIMULATOR ]</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  <span>[ KILL ALL {countFlagged} LEAKS ]</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Merchant Ledger Table Rows (Height-Balanced Scroll Container) */}
      <div className="divide-y divide-[#DFDBD0] overflow-y-auto max-h-[760px] scrollbar-thin scrollbar-thumb-[#DFDBD0]">
        {filteredMerchants.length === 0 ? (
          <div className="p-12 text-center text-[#5A5D64] font-mono text-xs">
            NO MERCHANTS FOUND UNDER THIS FILTER CATEGORY.
          </div>
        ) : (
          filteredMerchants.map((merchant) => {
            const isSubscription = merchant.merchant_category === "subscription_or_saas";
            const isKilled = toggledKillSwitches[merchant.merchant_name] || false;
            const isSelected = selectedMerchant?.merchant_name === merchant.merchant_name;
            const isFlaggedLeak = merchant.is_leak && isSubscription;

            const riskPct = merchant.tabpfn_leak_prob * 100;
            const riskBadgeColor =
              !isSubscription
                ? "bg-[#EFECE4] text-[#5A5D64] border-[#DFDBD0]"
                : riskPct >= 70
                ? "bg-[#FCECE9] text-[#C93B2B] border-[#C93B2B]/40"
                : riskPct >= 40
                ? "bg-[#FEF3C7] text-[#B45309] border-[#B45309]/40"
                : "bg-[#E6F4EF] text-[#0D6E52] border-[#0D6E52]/40";

            return (
              <div
                key={merchant.merchant_name}
                onClick={() => onSelectMerchant(merchant)}
                className={`group relative p-3.5 sm:px-6 flex items-center justify-between gap-4 cursor-pointer transition-colors duration-150 border-l-[3px] ${
                  isSelected
                    ? "border-l-[#111315] bg-[#EFECE4]/60"
                    : isKilled
                    ? "border-l-[#0D6E52] bg-[#E6F4EF]/35"
                    : isFlaggedLeak
                    ? "border-l-[#C93B2B] bg-[#FCECE9]/15 hover:bg-[#FCECE9]/30"
                    : "border-l-transparent hover:bg-[#F6F4EE]/60"
                }`}
              >
                {/* Left: Merchant Name + Raw Sample + Badges */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Merchant Name */}
                    <span
                      className={`font-sans font-bold text-sm tracking-tight ${
                        isKilled ? "line-through text-[#5A5D64]" : "text-[#111315]"
                      }`}
                    >
                      {merchant.merchant_name}
                    </span>

                    {/* Cadence Dots */}
                    <div className="flex items-center gap-1.5 pl-0.5">
                      {renderCadenceDots(merchant.cadence_regularity)}
                      <span className="text-[10px] font-mono text-[#5A5D64] tabular-nums">
                        {merchant.cadence_days > 0 ? `${merchant.cadence_days}d` : "pos"}
                      </span>
                    </div>

                    {/* Rule Badges (SaaS only) */}
                    {isSubscription && merchant.rule_flags.includes("PRICE_HIKE") && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-[#FCECE9] text-[#C93B2B] border border-[#C93B2B]/40 uppercase tracking-tight flex items-center gap-1">
                        <TrendingUp className="w-2.5 h-2.5" />
                        PRICE HIKE +{(merchant.price_change_pct * 100).toFixed(1)}% (${merchant.historical_median.toFixed(0)} &rarr; ${merchant.monthly_cost.toFixed(0)})
                      </span>
                    )}

                    {isSubscription && merchant.rule_flags.includes("DUPLICATE_SAME_MONTH") && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/40 uppercase tracking-tight flex items-center gap-1">
                        <Copy className="w-2.5 h-2.5" />
                        BILLED 2X IN CYCLE
                      </span>
                    )}

                    {isSubscription && merchant.rule_flags.includes("IDLE_INFRA_CREEP") && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/40 uppercase tracking-tight flex items-center gap-1">
                        <Server className="w-2.5 h-2.5" />
                        {merchant.merchant_name.toLowerCase().includes("wework")
                          ? "IDLE SEAT / UNUSED DESK"
                          : "IDLE INFRA CREEP"}
                      </span>
                    )}

                    {isSubscription && merchant.rule_flags.includes("ANNUAL_SURPRISE_RENEWAL") && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-[#FCECE9] text-[#C93B2B] border border-[#C93B2B]/40 uppercase tracking-tight flex items-center gap-1">
                        <CalendarDays className="w-2.5 h-2.5" />
                        ANNUAL AUTO-RENEWAL
                      </span>
                    )}

                    {isSubscription && merchant.rule_flags.includes("TRIAL_CONVERSION") && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-[#FCECE9] text-[#C93B2B] border border-[#C93B2B]/40 uppercase tracking-tight flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        TRIAL CONVERTED (${merchant.monthly_cost.toFixed(0)}/MO)
                      </span>
                    )}

                    {isSubscription &&
                      !merchant.is_leak &&
                      merchant.tabpfn_leak_prob < 0.50 &&
                      !merchant.rule_flags.some((f) =>
                        ["PRICE_HIKE", "DUPLICATE_SAME_MONTH", "TRIAL_CONVERSION", "IDLE_INFRA_CREEP", "ANNUAL_SURPRISE_RENEWAL"].includes(f)
                      ) &&
                      merchant.rule_flags.includes("RECURRING_SUB") && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#E6F4EF] text-[#0D6E52] border border-[#0D6E52]/40 uppercase tracking-tight flex items-center gap-1 font-semibold">
                          <Clock className="w-2.5 h-2.5" />
                          CLEAN RECURRING
                        </span>
                      )}

                    {/* TabPFN Risk Badge */}
                    <div
                      className="relative inline-block"
                      onMouseEnter={() => setHoveredBadgeMerchant(merchant.merchant_name)}
                      onMouseLeave={() => setHoveredBadgeMerchant(null)}
                    >
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[2px] border tabular-nums uppercase flex items-center gap-1 cursor-help ${riskBadgeColor}`}
                      >
                        {isSubscription ? `TabPFN Risk: ${riskPct.toFixed(1)}%` : "ESSENTIAL EXPENSE"}
                        {isSubscription && <HelpCircle className="w-2.5 h-2.5 opacity-60" />}
                      </span>

                      {/* Decomposition Popover */}
                      {hoveredBadgeMerchant === merchant.merchant_name && merchant.tabpfn_features && isSubscription && (
                        <div className="absolute left-0 bottom-full mb-1.5 z-50 w-72 p-3 bg-[#111315] text-[#FDFCF9] rounded-[4px] shadow-xl text-[10px] font-mono space-y-1.5 border border-[#DFDBD0]/30 pointer-events-none">
                          <div className="flex items-center justify-between pb-1 border-b border-[#DFDBD0]/20 text-[#DFDBD0]">
                            <span className="font-bold text-[#FDFCF9]">TabPFN-3.5 IN-CONTEXT VECTOR</span>
                            <span className="text-[#0D6E52]">PRIOR EMBEDDING</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5 text-[10px]">
                            <span className="text-[#5A5D64]">AMOUNT Z-SCORE:</span>
                            <span className="text-right text-[#FDFCF9] tabular-nums">{merchant.tabpfn_features.amount_zscore.toFixed(3)}</span>

                            <span className="text-[#5A5D64]">CADENCE REGULARITY:</span>
                            <span className="text-right text-[#FDFCF9] tabular-nums">{(merchant.tabpfn_features.cadence_regularity * 100).toFixed(0)}%</span>

                            <span className="text-[#5A5D64]">PRICE DRIFT PCT:</span>
                            <span className="text-right text-[#FDFCF9] tabular-nums">+{(merchant.tabpfn_features.price_drift_pct * 100).toFixed(1)}%</span>

                            <span className="text-[#5A5D64]">MICRO-CHARGE (&lt;$15):</span>
                            <span className="text-right text-[#FDFCF9]">{merchant.tabpfn_features.is_micro_charge ? "YES" : "NO"}</span>

                            <span className="text-[#5A5D64]">90D CHARGES COUNT:</span>
                            <span className="text-right text-[#FDFCF9] tabular-nums">{merchant.tabpfn_features.charge_count_90d} charges</span>

                            <span className="text-[#5A5D64]">DAYS FIRST SEEN:</span>
                            <span className="text-right text-[#FDFCF9] tabular-nums">{merchant.tabpfn_features.days_since_first_seen}d ago</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Raw Bank String */}
                  <div className="mt-1 flex items-center gap-2 text-xs font-mono text-[#5A5D64]">
                    <span className="text-[10px] bg-[#EFECE4] px-1 py-0.2 rounded-[2px] text-[#111315]/80">RAW</span>
                    <span className="truncate max-w-md">{merchant.raw_description_sample}</span>
                    <span className="text-[#DFDBD0]">&bull;</span>
                    <span className="text-[11px] tabular-nums">
                      {isSubscription ? `Next: ${merchant.next_predicted_date}` : `${merchant.tx_count} tx in 90d`}
                    </span>
                  </div>
                </div>

                {/* Right: Amounts & Kill-Switch */}
                <div className="flex items-center gap-3.5 shrink-0">
                  <div className="text-right">
                    <div
                      className={`font-mono text-base font-bold tabular-nums tracking-tight ${
                        isKilled
                          ? "line-through text-[#5A5D64]"
                          : isFlaggedLeak
                          ? "text-[#C93B2B]"
                          : "text-[#111315]"
                      }`}
                    >
                      {merchant.rule_flags.includes("ANNUAL_SURPRISE_RENEWAL") ? (
                        <>
                          ${merchant.total_spent_90d.toFixed(2)}
                          <span className="text-[10px] font-normal text-[#5A5D64]">/yr</span>
                        </>
                      ) : (
                        <>
                          ${merchant.monthly_cost.toFixed(2)}
                          <span className="text-[10px] font-normal text-[#5A5D64]">
                            {isSubscription ? "/mo" : " latest"}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-[#5A5D64] tabular-nums">
                      {merchant.rule_flags.includes("ANNUAL_SURPRISE_RENEWAL") ? (
                        <span>(${merchant.monthly_cost.toFixed(2)}/mo eq.)</span>
                      ) : (
                        <span>${merchant.total_spent_90d.toFixed(2)} total in 90d</span>
                      )}
                    </div>
                  </div>

                  {/* Switch / Tag */}
                  {isSubscription ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleKillSwitch(merchant.merchant_name);
                      }}
                      className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded-[3px] border transition-all duration-150 cursor-pointer active:translate-y-px flex items-center gap-1 ${
                        isKilled
                          ? "bg-[#0D6E52] text-[#FDFCF9] border-[#0D6E52] shadow-inner"
                          : "bg-[#FDFCF9] text-[#111315] border-[#DFDBD0] hover:border-[#C93B2B] hover:text-[#C93B2B]"
                      }`}
                    >
                      <span>{isKilled ? "[ KILLED ✓ ]" : "[ KILL SWITCH ]"}</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider text-[#5A5D64] bg-[#EFECE4] border border-[#DFDBD0] rounded-[3px] uppercase cursor-default select-none">
                      ESSENTIAL / POS
                    </span>
                  )}

                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-150 ${
                      isSelected ? "text-[#111315] translate-x-0.5" : "text-[#DFDBD0] group-hover:text-[#5A5D64]"
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
