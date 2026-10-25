/**
 * Type definitions matching the LeakLens FastAPI backend JSON contracts.
 */

export type RuleFlag =
  | "PRICE_HIKE"
  | "DUPLICATE_SAME_MONTH"
  | "TRIAL_CONVERSION"
  | "IDLE_INFRA_CREEP"
  | "ANNUAL_SURPRISE_RENEWAL"
  | "RECURRING_SUB";

export interface TransactionItem {
  date: string;
  amount: number;
  raw_description: string;
}

export interface TabPFNFeatures {
  amount_zscore: number;
  cadence_regularity: number;
  price_drift_pct: number;
  is_micro_charge: number;
  charge_count_90d: number;
  days_since_first_seen: number;
  is_trial_conversion_pattern: number;
}

export interface MerchantAudit {
  merchant_name: string;
  merchant_clean: string;
  merchant_category: "essential_living" | "subscription_or_saas";
  raw_description_sample: string;
  monthly_cost: number;
  avg_tx_amount?: number;
  total_spent_90d: number;
  tx_count: number;
  cadence_days: number;
  cadence_regularity: number;
  price_change_pct: number;
  historical_median: number;
  rule_flags: RuleFlag[];
  tabpfn_leak_prob: number;
  is_leak: boolean;
  next_predicted_date: string;
  tx_history: TransactionItem[];
  tabpfn_features?: TabPFNFeatures;
}

export interface ForecastPoint {
  week: number;
  day_offset: number;
  date: string;
  p10: number;
  p50: number;
  p90: number;
  reclaimed_p50: number;
  cumulative_saved: number;
}

export interface AuditSummary {
  total_monthly_leak: number;
  annual_projected_leak: number;
  three_year_compounded_savings: number;
  flagged_merchants_count: number;
  clean_merchants_count: number;
  total_merchants_count: number;
  total_expense_volume: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface AuditResponse {
  source: string;
  execution_mode: string;
  rows_processed: number;
  inference_ms: number;
  total_latency_ms: number;
  summary: AuditSummary;
  merchants: MerchantAudit[];
  forecast_90d: ForecastPoint[];
}

export interface PersonaMetadata {
  id: string;
  title: string;
  tagline: string;
  row_count: number;
  default_starting_balance: number;
  description: string;
  filename: string;
}

export interface ActionDraftRequest {
  merchant_name: string;
  monthly_cost: number;
  merchant_category?: string;
  price_change_pct?: number;
  historical_median?: number;
  rule_flags?: string[];
  raw_description_sample?: string;
  next_predicted_date?: string;
  tx_history?: TransactionItem[];
}

export interface ActionDraftResponse {
  cancellation_email: string;
  negotiation_script: string;
  ics_content: string;
  model_used: string;
}
