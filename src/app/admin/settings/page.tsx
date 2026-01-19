"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifyOverdue, setNotifyOverdue] = useState(true);
  const [notifyNewSuggestions, setNotifyNewSuggestions] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState("medium");
  const [slaHigh, setSlaHigh] = useState("7");
  const [slaMedium, setSlaMedium] = useState("14");
  const [slaLow, setSlaLow] = useState("30");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <section className="space-y-6">
      {/* General Settings */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <div className="border-b border-[color:var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
            General Settings
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Configure your dashboard preferences and defaults.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Default priority for new suggestions
              </span>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm text-[color:var(--foreground)] focus:border-[color:var(--accent)] focus:outline-none"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Admin email for suggestions
              </span>
              <input
                type="email"
                value="hsmanager@company.com"
                disabled
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 py-2.5 text-sm text-[color:var(--muted)] focus:outline-none"
              />
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                Contact your administrator to change this.
              </p>
            </label>
          </div>
        </div>
      </div>

      {/* SLA Configuration */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <div className="border-b border-[color:var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
            SLA Configuration
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Set the number of days before suggestions become overdue based on
            priority.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              High priority SLA (days)
            </span>
            <input
              type="number"
              value={slaHigh}
              onChange={(e) => setSlaHigh(e.target.value)}
              min="1"
              max="90"
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm text-[color:var(--foreground)] focus:border-[color:var(--accent)] focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Medium priority SLA (days)
            </span>
            <input
              type="number"
              value={slaMedium}
              onChange={(e) => setSlaMedium(e.target.value)}
              min="1"
              max="90"
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm text-[color:var(--foreground)] focus:border-[color:var(--accent)] focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Low priority SLA (days)
            </span>
            <input
              type="number"
              value={slaLow}
              onChange={(e) => setSlaLow(e.target.value)}
              min="1"
              max="90"
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm text-[color:var(--foreground)] focus:border-[color:var(--accent)] focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <div className="border-b border-[color:var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Manage how you receive alerts and updates.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                Overdue alerts
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Get notified when suggestions become overdue.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyOverdue}
              onClick={() => setNotifyOverdue(!notifyOverdue)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifyOverdue
                  ? "bg-[color:var(--accent)]"
                  : "bg-[color:var(--border)]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notifyOverdue ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                New suggestion alerts
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Get notified when VIDA creates new suggestions.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyNewSuggestions}
              onClick={() => setNotifyNewSuggestions(!notifyNewSuggestions)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifyNewSuggestions
                  ? "bg-[color:var(--accent)]"
                  : "bg-[color:var(--border)]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notifyNewSuggestions ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                Weekly digest
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Receive a weekly summary of metrics and activity.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyWeeklyDigest}
              onClick={() => setNotifyWeeklyDigest(!notifyWeeklyDigest)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifyWeeklyDigest
                  ? "bg-[color:var(--accent)]"
                  : "bg-[color:var(--border)]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notifyWeeklyDigest ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Export for Presentations */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <div className="border-b border-[color:var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
            Export for Presentations
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Download presentation-ready charts and summaries. Drag and drop
            directly into PowerPoint or Google Slides.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Charts & Visuals (PNG)
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex flex-col items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white px-4 py-5 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--panel-cyan)]">
                <span className="text-xl">📊</span>
              </span>
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                KPI Summary Card
              </span>
              <span className="text-xs text-[color:var(--muted)]">
                All 4 metrics at a glance
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex flex-col items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white px-4 py-5 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--panel-muted)]">
                <span className="text-xl">🥧</span>
              </span>
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Status Breakdown
              </span>
              <span className="text-xs text-[color:var(--muted)]">
                Pie chart by status
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex flex-col items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white px-4 py-5 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff3e2]">
                <span className="text-xl">📈</span>
              </span>
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Risk by Department
              </span>
              <span className="text-xs text-[color:var(--muted)]">
                Bar chart comparison
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex flex-col items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white px-4 py-5 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--panel-lavender)]">
                <span className="text-xl">📉</span>
              </span>
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Completion Trend
              </span>
              <span className="text-xs text-[color:var(--muted)]">
                Last 12 weeks
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Executive Summaries
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-white px-4 py-4 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--panel-cyan)] text-lg">
                📋
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  Monthly Health Report
                </p>
                <p className="text-xs text-[color:var(--muted)]">
                  1-page PDF with key metrics and highlights
                </p>
              </div>
              <span className="rounded-full bg-[color:var(--panel-muted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                PDF
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-white px-4 py-4 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3e2] text-lg">
                ⚠️
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  Overdue Action List
                </p>
                <p className="text-xs text-[color:var(--muted)]">
                  Printable list for team meetings
                </p>
              </div>
              <span className="rounded-full bg-[color:var(--panel-muted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                PDF
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-white px-4 py-4 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--panel-lavender)] text-lg">
                👥
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  High-Risk Employee Summary
                </p>
                <p className="text-xs text-[color:var(--muted)]">
                  Anonymized overview for leadership
                </p>
              </div>
              <span className="rounded-full bg-[color:var(--panel-muted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                PDF
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-white px-4 py-4 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--panel-muted)] text-lg">
                🎯
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  Quarterly Review Deck
                </p>
                <p className="text-xs text-[color:var(--muted)]">
                  5-slide PowerPoint template with data
                </p>
              </div>
              <span className="rounded-full bg-[color:var(--panel-muted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                PPTX
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Raw Data
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="text-lg">📄</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  All Suggestions
                </p>
                <p className="text-xs text-[color:var(--muted)]">CSV</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="text-lg">📄</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  Employee List
                </p>
                <p className="text-xs text-[color:var(--muted)]">CSV</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
            >
              <span className="text-lg">📄</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  Full Data Backup
                </p>
                <p className="text-xs text-[color:var(--muted)]">JSON</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <div className="border-b border-[color:var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
            Help & Support
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Get assistance and learn more about VIDA Admin.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-white px-4 py-4 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--panel-cyan)] text-lg">
              📖
            </span>
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                Documentation
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Learn how to use VIDA Admin effectively.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-white px-4 py-4 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--panel-muted)] text-lg">
              🎓
            </span>
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                Video Tutorials
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Watch step-by-step guides and tips.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-white px-4 py-4 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--panel-lavender)] text-lg">
              💬
            </span>
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                Contact Support
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Get help from our support team.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-white px-4 py-4 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3e2] text-lg">
              🐛
            </span>
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                Report an Issue
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Let us know if something isn&apos;t working.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setShowExportModal(false)}
            className="absolute inset-0"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_20px_40px_rgba(9,20,17,0.2)]"
          >
            <div className="text-center">
              <span className="text-4xl">📦</span>
              <h3 className="mt-4 text-lg font-semibold text-[color:var(--foreground)]">
                Export Feature Coming Soon
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                This feature is currently under development. You&apos;ll be able
                to export your data in various formats for reporting and backup
                purposes.
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-full bg-[color:var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-soft)]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Help Modal */}
      {showHelpModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setShowHelpModal(false)}
            className="absolute inset-0"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_20px_40px_rgba(9,20,17,0.2)]"
          >
            <div className="text-center">
              <span className="text-4xl">🚧</span>
              <h3 className="mt-4 text-lg font-semibold text-[color:var(--foreground)]">
                Help Center Coming Soon
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Our comprehensive help center is being built. Soon you&apos;ll
                have access to documentation, tutorials, and direct support
                channels.
              </p>
              <p className="mt-4 text-sm text-[color:var(--muted)]">
                In the meantime, contact us at:{" "}
                <span className="font-medium text-[color:var(--accent)]">
                  support@vida.com
                </span>
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-full bg-[color:var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-soft)]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
