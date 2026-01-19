"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  EmployeeWithSuggestions,
  Suggestion,
  SuggestionPriority,
  SuggestionType,
} from "@/lib/types";

// Helper functions for metric calculations
function getAllSuggestions(employees: EmployeeWithSuggestions[]): Suggestion[] {
  return employees.flatMap((e) => e.suggestions);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDays(days: number): string {
  if (days === 1) return "1 day";
  return `${Math.round(days)} days`;
}

// Metric calculation types
type MetricValues = {
  adoption: {
    value: string;
    subLabel: string;
    options: {
      "overall-completion": { value: string; breakdown: string };
      "completion-by-risk": { value: string; breakdown: string };
      "completion-by-type": { value: string; breakdown: string };
    };
  };
  "time-to-action": {
    value: string;
    subLabel: string;
    options: {
      "median-time-start": { value: string; breakdown: string };
      "median-time-complete": { value: string; breakdown: string };
      "within-sla": { value: string; breakdown: string };
    };
  };
  "overdue-burden": {
    value: string;
    subLabel: string;
    options: {
      "overdue-rate": { value: string; breakdown: string };
      "overdue-high": { value: string; breakdown: string };
      "backlog-per-100": { value: string; breakdown: string };
    };
  };
  "engagement-depth": {
    value: string;
    subLabel: string;
    options: {
      "open-actions": { value: string; breakdown: string };
      "completion-ratio": { value: string; breakdown: string };
      "priority-weighted": { value: string; breakdown: string };
      "high-risk-coverage": { value: string; breakdown: string };
    };
  };
};

function calculateMetrics(employees: EmployeeWithSuggestions[]): MetricValues {
  const allSuggestions = getAllSuggestions(employees);
  const total = allSuggestions.length;
  const completed = allSuggestions.filter(
    (s) => s.status === "completed",
  ).length;
  const overdue = allSuggestions.filter((s) => s.status === "overdue").length;
  const pending = allSuggestions.filter((s) => s.status === "pending").length;
  const inProgress = allSuggestions.filter(
    (s) => s.status === "in_progress",
  ).length;

  // Adoption metrics
  const overallCompletionRate = total > 0 ? completed / total : 0;

  const byRisk = {
    high: { completed: 0, total: 0 },
    medium: { completed: 0, total: 0 },
    low: { completed: 0, total: 0 },
  };
  for (const emp of employees) {
    const risk = emp.riskLevel;
    for (const s of emp.suggestions) {
      byRisk[risk].total++;
      if (s.status === "completed") byRisk[risk].completed++;
    }
  }

  const byType = {
    equipment: { completed: 0, total: 0 },
    exercise: { completed: 0, total: 0 },
    behavioural: { completed: 0, total: 0 },
    lifestyle: { completed: 0, total: 0 },
  };
  for (const s of allSuggestions) {
    byType[s.type].total++;
    if (s.status === "completed") byType[s.type].completed++;
  }

  // Time-to-action metrics
  const startedSuggestions = allSuggestions.filter(
    (s) => s.status === "in_progress" || s.status === "completed",
  );
  const timeToStart = startedSuggestions.map((s) =>
    daysBetween(s.dateCreated, s.dateUpdated),
  );
  const medianTimeToStart = median(timeToStart);

  const completedSuggestions = allSuggestions.filter(
    (s) => s.status === "completed" && s.dateCompleted,
  );
  const timeToComplete = completedSuggestions.map((s) =>
    daysBetween(s.dateCreated, s.dateCompleted!),
  );
  const medianTimeToComplete = median(timeToComplete);

  // SLA calculation (High = 7 days, Medium = 14, Low = 30)
  const slaLimits: Record<SuggestionPriority, number> = {
    high: 7,
    medium: 14,
    low: 30,
  };
  const withinSla = completedSuggestions.filter((s) => {
    const days = daysBetween(s.dateCreated, s.dateCompleted!);
    return days <= slaLimits[s.priority];
  }).length;
  const slaRate =
    completedSuggestions.length > 0
      ? withinSla / completedSuggestions.length
      : 0;

  // Overdue burden metrics
  const overdueRate = total > 0 ? overdue / total : 0;

  const highPriority = allSuggestions.filter((s) => s.priority === "high");
  const highPriorityOverdue = highPriority.filter(
    (s) => s.status === "overdue",
  ).length;
  const overdueHighRate =
    highPriority.length > 0 ? highPriorityOverdue / highPriority.length : 0;

  const employeeCount = employees.length;
  const backlogPer100 = employeeCount > 0 ? (overdue / employeeCount) * 100 : 0;

  // Engagement depth metrics
  const openActions = pending + inProgress + overdue;
  const openActionsPerEmployee =
    employeeCount > 0 ? openActions / employeeCount : 0;

  const completionRatios = employees.map((emp) => {
    const empTotal = emp.suggestions.length;
    const empCompleted = emp.suggestions.filter(
      (s) => s.status === "completed",
    ).length;
    return empTotal > 0 ? empCompleted / empTotal : 0;
  });
  const avgCompletionRatio =
    completionRatios.length > 0
      ? completionRatios.reduce((a, b) => a + b, 0) / completionRatios.length
      : 0;

  // Priority-weighted completion
  const weights: Record<SuggestionPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };
  let totalWeight = 0;
  let completedWeight = 0;
  for (const s of allSuggestions) {
    totalWeight += weights[s.priority];
    if (s.status === "completed") completedWeight += weights[s.priority];
  }
  const priorityWeightedCompletion =
    totalWeight > 0 ? completedWeight / totalWeight : 0;

  // High-risk coverage
  const highRiskEmployees = employees.filter((e) => e.riskLevel === "high");
  const highRiskCovered = highRiskEmployees.filter((emp) => {
    const hasOverdue = emp.suggestions.some((s) => s.status === "overdue");
    const allHighDone = emp.suggestions
      .filter((s) => s.priority === "high")
      .every((s) => s.status === "completed");
    return !hasOverdue || allHighDone;
  }).length;
  const highRiskCoverage =
    highRiskEmployees.length > 0
      ? highRiskCovered / highRiskEmployees.length
      : 0;

  return {
    adoption: {
      value: formatPercent(overallCompletionRate),
      subLabel: "Overall completion rate",
      options: {
        "overall-completion": {
          value: formatPercent(overallCompletionRate),
          breakdown: `${completed} of ${total} suggestions completed`,
        },
        "completion-by-risk": {
          value: `H: ${formatPercent(byRisk.high.total > 0 ? byRisk.high.completed / byRisk.high.total : 0)} / M: ${formatPercent(byRisk.medium.total > 0 ? byRisk.medium.completed / byRisk.medium.total : 0)} / L: ${formatPercent(byRisk.low.total > 0 ? byRisk.low.completed / byRisk.low.total : 0)}`,
          breakdown: `High: ${byRisk.high.completed}/${byRisk.high.total}, Medium: ${byRisk.medium.completed}/${byRisk.medium.total}, Low: ${byRisk.low.completed}/${byRisk.low.total}`,
        },
        "completion-by-type": {
          value: `Eq: ${formatPercent(byType.equipment.total > 0 ? byType.equipment.completed / byType.equipment.total : 0)} / Ex: ${formatPercent(byType.exercise.total > 0 ? byType.exercise.completed / byType.exercise.total : 0)}`,
          breakdown: `Equipment: ${byType.equipment.completed}/${byType.equipment.total}, Exercise: ${byType.exercise.completed}/${byType.exercise.total}, Behavioral: ${byType.behavioural.completed}/${byType.behavioural.total}, Lifestyle: ${byType.lifestyle.completed}/${byType.lifestyle.total}`,
        },
      },
    },
    "time-to-action": {
      value: formatDays(medianTimeToStart),
      subLabel: "Median time to start",
      options: {
        "median-time-start": {
          value: formatDays(medianTimeToStart),
          breakdown: `Based on ${startedSuggestions.length} started suggestions`,
        },
        "median-time-complete": {
          value: formatDays(medianTimeToComplete),
          breakdown: `Based on ${completedSuggestions.length} completed suggestions`,
        },
        "within-sla": {
          value: formatPercent(slaRate),
          breakdown: `${withinSla} of ${completedSuggestions.length} completed within SLA (H:7d, M:14d, L:30d)`,
        },
      },
    },
    "overdue-burden": {
      value: formatPercent(overdueRate),
      subLabel: "Overdue ratio",
      options: {
        "overdue-rate": {
          value: formatPercent(overdueRate),
          breakdown: `${overdue} of ${total} suggestions overdue`,
        },
        "overdue-high": {
          value: formatPercent(overdueHighRate),
          breakdown: `${highPriorityOverdue} of ${highPriority.length} high priority items overdue`,
        },
        "backlog-per-100": {
          value: backlogPer100.toFixed(1),
          breakdown: `${overdue} overdue items across ${employeeCount} employees`,
        },
      },
    },
    "engagement-depth": {
      value: formatPercent(1 - avgCompletionRatio),
      subLabel: "Open pending",
      options: {
        "open-actions": {
          value: openActionsPerEmployee.toFixed(1),
          breakdown: `${openActions} open actions across ${employeeCount} employees`,
        },
        "completion-ratio": {
          value: formatPercent(avgCompletionRatio),
          breakdown: `Average completion ratio per employee`,
        },
        "priority-weighted": {
          value: formatPercent(priorityWeightedCompletion),
          breakdown: `Weighted: High=3, Medium=2, Low=1. Score: ${completedWeight}/${totalWeight}`,
        },
        "high-risk-coverage": {
          value: formatPercent(highRiskCoverage),
          breakdown: `${highRiskCovered} of ${highRiskEmployees.length} high-risk employees covered`,
        },
      },
    },
  };
}

const metricCardsMeta = [
  {
    id: "adoption",
    label: "Adoption",
    tone: "bg-[color:var(--panel-cyan)]",
    activeTone: "bg-[#cde9fb]",
    accent: "text-[color:var(--accent)]",
    panelTone: "bg-[#e8f3ff]",
    summary: "How much of the recommended plan actually gets done.",
    options: [
      {
        id: "overall-completion",
        label: "Overall completion rate",
        description:
          "Measures how much of the recommended plan is completed overall.",
        formula: "completed / total suggestions",
        note: "If high-risk employees are not completing, risk does not fall.",
      },
      {
        id: "completion-by-risk",
        label: "Completion rate by risk level",
        description:
          "Compares completion for high, medium, and low risk employees.",
        formula:
          "completed where employee.riskLevel = high / total where employee.riskLevel = high",
        note: "Repeat for medium and low to find gaps in adoption.",
      },
      {
        id: "completion-by-type",
        label: "Completion rate by type",
        description:
          "Tracks completion for equipment, exercise, behavioral, and lifestyle actions.",
        formula:
          "completed where type = equipment / total where type = equipment",
        note: "Highlight which action types need more follow-through.",
      },
    ],
  },
  {
    id: "time-to-action",
    label: "Time-to-Action",
    tone: "bg-[color:var(--panel-muted)]",
    activeTone: "bg-[#dcf0e4]",
    accent: "text-[color:var(--success)]",
    panelTone: "bg-[#e7f4ee]",
    summary: "How quickly teams act after VIDA identifies risk.",
    options: [
      {
        id: "median-time-start",
        label: "Median time to start",
        description:
          "Measures how fast teams begin work once a suggestion is created.",
        formula:
          'median(dateUpdated - dateCreated) for status in {"in_progress","completed"}',
        note: "Treat in_progress as started to capture early momentum.",
      },
      {
        id: "median-time-complete",
        label: "Median time to complete",
        description:
          "Measures the median time it takes to fully complete suggestions.",
        formula: "median(dateCompleted - dateCreated) for status = completed",
        note: "Use this to spot long tail work that drags timelines.",
      },
      {
        id: "within-sla",
        label: "Percent completed within SLA",
        description:
          "Tracks how many completed suggestions meet priority SLAs.",
        formula: "completed within SLA / completed",
        note: "Example SLA: High = 7 days, Medium = 14, Low = 30.",
      },
    ],
  },
  {
    id: "overdue-burden",
    label: "Overdue Burden",
    tone: "bg-[#fff3e2]",
    activeTone: "bg-[#ffe5c7]",
    accent: "text-[color:var(--warning)]",
    panelTone: "bg-[#fff0dd]",
    summary: "How much unresolved risk is still hanging around.",
    options: [
      {
        id: "overdue-rate",
        label: "Overdue rate",
        description: "Shows how many total items are overdue.",
        formula: "overdue / total",
        note: "Overdue items represent risk that stays unmitigated.",
      },
      {
        id: "overdue-high",
        label: "Overdue rate (high priority)",
        description: "Highlights overdue items among high priority actions.",
        formula: "overdue where priority = high / total where priority = high",
        note: "This is the fastest way to surface critical exposure.",
      },
      {
        id: "backlog-per-100",
        label: "Overdue backlog per 100 employees",
        description: "Normalizes overdue volume against headcount.",
        formula: "(count(overdue) / employee_count) * 100",
        note: "Useful for cross-site comparisons.",
      },
    ],
  },
  {
    id: "engagement-depth",
    label: "Engagement Depth",
    tone: "bg-[color:var(--panel-lavender)]",
    activeTone: "bg-[#e1e4ff]",
    accent: "text-[color:var(--magenta)]",
    panelTone: "bg-[#f0effc]",
    summary: "Whether high-risk users are fully closing critical actions.",
    options: [
      {
        id: "open-actions",
        label: "Open actions per employee",
        description:
          "Counts how many pending, in progress, or overdue actions remain.",
        formula: 'count(status in {"pending","in_progress","overdue"})',
        note: "Stops a few easy completions from masking real backlog.",
      },
      {
        id: "completion-ratio",
        label: "Completion ratio",
        description: "Shows completed vs total actions for each employee.",
        formula: "completed / total per employee",
        note: "Use the average across employees to track follow-through.",
      },
      {
        id: "priority-weighted",
        label: "Priority-weighted completion",
        description:
          "Weights high priority work more to reflect true risk reduction.",
        formula:
          "sum(weight(priority) for completed) / sum(weight(priority) for all)",
        note: "Weights: High = 3, Medium = 2, Low = 1.",
      },
      {
        id: "high-risk-coverage",
        label: "High-risk completion coverage",
        description:
          "Tracks high-risk employees with zero overdue items or all high priority items done.",
        formula:
          "percent of high-risk employees with 0 overdue or all high priority completed",
        note: "This is the clearest signal that risk is being resolved.",
      },
    ],
  },
];

const priorityLabels: Record<SuggestionPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const typeLabels: Record<SuggestionType, string> = {
  equipment: "Equipment",
  exercise: "Exercise",
  behavioural: "Behavioral",
  lifestyle: "Lifestyle",
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type OverdueSuggestion = Suggestion & {
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
};

export default function DashboardPage() {
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [lastMetricId, setLastMetricId] = useState(metricCardsMeta[0].id);
  const [lastOptionId, setLastOptionId] = useState(
    metricCardsMeta[0].options[0].id,
  );
  const [employees, setEmployees] = useState<EmployeeWithSuggestions[]>([]);
  const [overdueSuggestions, setOverdueSuggestions] = useState<
    OverdueSuggestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/suggestions");
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      const data = (await response.json()) as EmployeeWithSuggestions[];
      setEmployees(data);

      const overdue: OverdueSuggestion[] = [];
      for (const employee of data) {
        for (const suggestion of employee.suggestions) {
          if (suggestion.status === "overdue") {
            overdue.push({
              ...suggestion,
              employeeId: employee.id,
              employeeName: employee.name,
              employeeDepartment: employee.department,
            });
          }
        }
      }

      overdue.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff =
          priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.dateUpdated.localeCompare(a.dateUpdated);
      });

      setOverdueSuggestions(overdue);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const metrics = useMemo(() => calculateMetrics(employees), [employees]);

  const selectedMetric = useMemo(
    () => metricCardsMeta.find((metric) => metric.id === selectedMetricId),
    [selectedMetricId],
  );
  const selectedOption = useMemo(() => {
    if (!selectedMetric) return null;
    return (
      selectedMetric.options.find((option) => option.id === selectedOptionId) ??
      selectedMetric.options[0] ??
      null
    );
  }, [selectedMetric, selectedOptionId]);
  const displayMetric = useMemo(
    () =>
      metricCardsMeta.find((metric) => metric.id === lastMetricId) ??
      metricCardsMeta[0],
    [lastMetricId],
  );
  const displayOption = useMemo(
    () =>
      displayMetric.options.find((option) => option.id === lastOptionId) ??
      displayMetric.options[0],
    [displayMetric, lastOptionId],
  );
  const isPanelOpen = Boolean(selectedMetric && selectedOption);
  const activeOptionId = selectedOption?.id ?? displayOption.id;

  const handleMetricSelect = (metricId: string) => {
    if (metricId === selectedMetricId) {
      setSelectedMetricId(null);
      setSelectedOptionId(null);
      return;
    }
    const nextMetric = metricCardsMeta.find((metric) => metric.id === metricId);
    if (!nextMetric) return;
    setSelectedMetricId(nextMetric.id);
    setSelectedOptionId(nextMetric.options[0]?.id ?? null);
    setLastMetricId(nextMetric.id);
    setLastOptionId(nextMetric.options[0]?.id ?? lastOptionId);
  };

  // Get current metric values
  const getMetricValue = (metricId: string) => {
    const metricData = metrics[metricId as keyof MetricValues];
    return metricData?.value ?? "--";
  };

  const getMetricSubLabel = (metricId: string) => {
    const metricData = metrics[metricId as keyof MetricValues];
    return metricData?.subLabel ?? "";
  };

  const getOptionValue = (metricId: string, optionId: string) => {
    const metricData = metrics[metricId as keyof MetricValues];
    if (!metricData) return { value: "--", breakdown: "" };
    const options = metricData.options as Record<
      string,
      { value: string; breakdown: string }
    >;
    return options[optionId] ?? { value: "--", breakdown: "" };
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-6 shadow-[0_14px_30px_rgba(9,20,17,0.08)]">
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricCardsMeta.map((metric) => {
            const isActive = metric.id === selectedMetricId;
            const isHiddenOnMobile = selectedMetricId && !isActive;
            const value = isLoading ? "..." : getMetricValue(metric.id);
            const subLabel = getMetricSubLabel(metric.id);
            return (
              <button
                key={metric.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleMetricSelect(metric.id)}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(9,20,17,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
                  isActive ? metric.activeTone : metric.tone
                } ${
                  isActive
                    ? "border-transparent shadow-[0_14px_28px_rgba(9,20,17,0.14)]"
                    : "border-white/80"
                } ${isHiddenOnMobile ? "hidden md:block" : ""}`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                    isActive
                      ? "text-[color:var(--foreground)]"
                      : "text-[color:var(--muted)]"
                  }`}
                >
                  {metric.label}
                </p>
                <p
                  className={`mt-3 text-2xl text-[color:var(--foreground)] ${
                    isActive ? "font-bold" : "font-semibold"
                  }`}
                >
                  {value}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    isActive
                      ? "text-[color:var(--foreground)] opacity-70"
                      : "text-[color:var(--muted)]"
                  }`}
                >
                  {subLabel}
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${metric.accent}`}
                >
                  {isActive ? "Hide" : "Show more"}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={`overflow-hidden transition-[max-height,opacity,transform,margin] duration-300 ease-out ${
            isPanelOpen
              ? "mt-6 max-h-[1400px] opacity-100 translate-y-0"
              : "mt-0 max-h-0 opacity-0 -translate-y-2 pointer-events-none"
          }`}
          aria-hidden={!isPanelOpen}
        >
          <div
            className={`rounded-[28px] border border-[color:var(--border)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${displayMetric.panelTone}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  {displayMetric.label} metrics
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {displayMetric.summary}
                </h2>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground)]">
                {displayMetric.options.length} options
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,_1fr)]">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_8px_18px_rgba(9,20,17,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Breakdown
                </p>
                <div className="mt-3 space-y-2">
                  {displayMetric.options.map((option) => {
                    const isSelected = option.id === activeOptionId;
                    const optionData = getOptionValue(
                      displayMetric.id,
                      option.id,
                    );
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedOptionId(option.id);
                          setLastOptionId(option.id);
                        }}
                        className={`w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] transition ${
                          isSelected
                            ? `border-white/70 ${displayMetric.tone} ${displayMetric.accent}`
                            : "border-transparent bg-white text-[color:var(--muted)] hover:border-[color:var(--border)] hover:text-[color:var(--foreground)]"
                        }`}
                      >
                        <span className="block">{option.label}</span>
                        <span
                          className={`block mt-1 text-sm normal-case tracking-normal ${isSelected ? "opacity-80" : "opacity-60"}`}
                        >
                          {isLoading ? "..." : optionData.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_8px_18px_rgba(9,20,17,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Calculation details
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {displayOption.label}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {displayOption.description}
                </p>

                {/* Calculated Value Display */}
                <div
                  className={`mt-4 rounded-xl border border-white/70 px-4 py-3 ${displayMetric.tone}`}
                >
                  <span
                    className={`font-semibold uppercase tracking-[0.2em] text-xs ${displayMetric.accent}`}
                  >
                    Current Value
                  </span>
                  <p className="mt-2 text-2xl font-bold text-[color:var(--foreground)]">
                    {isLoading
                      ? "..."
                      : getOptionValue(displayMetric.id, displayOption.id)
                          .value}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {isLoading
                      ? ""
                      : getOptionValue(displayMetric.id, displayOption.id)
                          .breakdown}
                  </p>
                </div>

                <div
                  className={`mt-4 rounded-xl border border-white/70 px-4 py-3 text-xs text-[color:var(--foreground)] ${displayMetric.tone}`}
                >
                  <span
                    className={`font-semibold uppercase tracking-[0.2em] ${displayMetric.accent}`}
                  >
                    Formula
                  </span>
                  <p className="mt-2 font-mono text-[11px] text-[color:var(--foreground)]">
                    {displayOption.formula}
                  </p>
                </div>
                {displayOption.note ? (
                  <p className="mt-3 text-xs text-[color:var(--muted)]">
                    {displayOption.note}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Suggestions Section */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] bg-white px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              Overdue Suggestions
            </p>
            <p className="text-xs text-[color:var(--muted)]">
              Suggestions that require immediate attention.
            </p>
          </div>
          <span className="rounded-full bg-[color:var(--magenta)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
            {overdueSuggestions.length} overdue
          </span>
        </div>

        {isLoading ? (
          <div className="px-5 py-8 text-center text-sm text-[color:var(--muted)]">
            Loading overdue suggestions...
          </div>
        ) : overdueSuggestions.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[color:var(--muted)]">
            No overdue suggestions. Great job!
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--border)]">
            {overdueSuggestions.map((suggestion, index) => {
              const rowTone = index % 2 === 0 ? "bg-[#fdf2f4]" : "bg-white";
              const sourceLabel =
                suggestion.source === "admin"
                  ? `Admin${suggestion.createdBy ? ` (${suggestion.createdBy})` : ""}`
                  : "VIDA";
              return (
                <Link
                  key={suggestion.id}
                  href={`/admin/suggestions?employee=${suggestion.employeeId}&suggestion=${suggestion.id}`}
                  className={`grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,_1.6fr)_minmax(0,_0.9fr)] ${rowTone} transition hover:bg-[#f9e8eb] cursor-pointer`}
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[color:var(--foreground)]">
                          {suggestion.description}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {suggestion.employeeName} &middot;{" "}
                          {suggestion.employeeDepartment}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        {typeLabels[suggestion.type]}
                      </span>
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        {sourceLabel}
                      </span>
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        {priorityLabels[suggestion.priority]} priority
                      </span>
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--magenta)]">
                        Overdue
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[color:var(--muted)]">
                    <p>
                      <span className="font-semibold text-[color:var(--foreground)]">
                        Created:
                      </span>{" "}
                      {formatDate(suggestion.dateCreated)}
                    </p>
                    <p>
                      <span className="font-semibold text-[color:var(--foreground)]">
                        Updated:
                      </span>{" "}
                      {formatDate(suggestion.dateUpdated)}
                    </p>
                    {suggestion.notes ? (
                      <p>
                        <span className="font-semibold text-[color:var(--foreground)]">
                          Notes:
                        </span>{" "}
                        {suggestion.notes}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="border-t border-[color:var(--border)] bg-white px-5 py-4">
          <Link
            href="/admin/suggestions"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted)]"
          >
            Show all suggestions
            <span className="text-[color:var(--muted)]">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
