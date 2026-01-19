"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  EmployeeWithSuggestions,
  Suggestion,
  SuggestionStatus,
  SuggestionPriority,
  SuggestionType,
} from "@/lib/types";

const ADMIN_EMAIL = "hsmanager@company.com";

const priorityRank: Record<SuggestionPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const statusRank: Record<SuggestionStatus, number> = {
  overdue: 4,
  pending: 3,
  in_progress: 2,
  completed: 1,
};

const statusStyles: Record<SuggestionStatus, string> = {
  pending: "text-[color:var(--warning)]",
  completed: "text-[color:var(--success)]",
  in_progress: "text-[color:var(--accent)]",
  overdue: "text-[color:var(--magenta)]",
};

const statusLabels: Record<SuggestionStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  in_progress: "In progress",
  overdue: "Overdue",
};

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

const suggestionTypes: SuggestionType[] = [
  "equipment",
  "exercise",
  "behavioural",
  "lifestyle",
];

const suggestionPriorities: SuggestionPriority[] = ["high", "medium", "low"];

const suggestionStatuses: SuggestionStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "overdue",
];

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type NoteDialogState = {
  suggestionId: string;
  employeeName: string;
  suggestionDescription: string;
  currentNote: string;
};

type SuggestionDialogState = {
  mode: "add" | "edit";
  employeeId: string;
  employeeName: string;
  suggestion?: Suggestion;
};

type SuggestionFormData = {
  type: SuggestionType;
  description: string;
  priority: SuggestionPriority;
  status: SuggestionStatus;
  notes: string;
};

const defaultFormData: SuggestionFormData = {
  type: "equipment",
  description: "",
  priority: "medium",
  status: "pending",
  notes: "",
};

export default function SuggestionsPage() {
  const searchParams = useSearchParams();
  const [employees, setEmployees] = useState<EmployeeWithSuggestions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightedSuggestionId, setHighlightedSuggestionId] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SuggestionStatus>(
    "all",
  );
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | SuggestionPriority
  >("all");
  const [nameSortDirection, setNameSortDirection] = useState<"asc" | "desc">(
    "asc",
  );
  const [noteDialog, setNoteDialog] = useState<NoteDialogState | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [suggestionDialog, setSuggestionDialog] =
    useState<SuggestionDialogState | null>(null);
  const [suggestionForm, setSuggestionForm] =
    useState<SuggestionFormData>(defaultFormData);
  const [isSavingSuggestion, setIsSavingSuggestion] = useState(false);

  // Read query params for auto-expanding employee and highlighting suggestion
  const employeeIdParam = searchParams.get("employee");
  const suggestionIdParam = searchParams.get("suggestion");

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/suggestions");
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      const data = (await response.json()) as EmployeeWithSuggestions[];
      setEmployees(data);
      setError(null);

      // Auto-expand employee if specified in URL
      if (employeeIdParam) {
        setExpandedId(employeeIdParam);
      }
      // Highlight suggestion if specified
      if (suggestionIdParam) {
        setHighlightedSuggestionId(suggestionIdParam);
        // Clear highlight after a few seconds
        setTimeout(() => setHighlightedSuggestionId(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [employeeIdParam, suggestionIdParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Note dialog handlers
  const handleOpenNoteDialog = (
    suggestion: Suggestion,
    employeeName: string,
  ) => {
    setNoteDialog({
      suggestionId: suggestion.id,
      employeeName,
      suggestionDescription: suggestion.description,
      currentNote: suggestion.notes,
    });
    setNoteText(suggestion.notes);
  };

  const handleCloseNoteDialog = () => {
    setNoteDialog(null);
    setNoteText("");
  };

  const handleSaveNote = async () => {
    if (!noteDialog) return;

    setIsSavingNote(true);
    try {
      const response = await fetch(
        `/api/suggestions/${noteDialog.suggestionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: noteText }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      setEmployees((prev) =>
        prev.map((employee) => ({
          ...employee,
          suggestions: employee.suggestions.map((s) =>
            s.id === noteDialog.suggestionId
              ? { ...s, notes: noteText, dateUpdated: new Date().toISOString() }
              : s,
          ),
        })),
      );

      handleCloseNoteDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Suggestion dialog handlers
  const handleOpenAddSuggestion = (
    employeeId: string,
    employeeName: string,
  ) => {
    setSuggestionDialog({
      mode: "add",
      employeeId,
      employeeName,
    });
    setSuggestionForm(defaultFormData);
  };

  const handleOpenEditSuggestion = (
    suggestion: Suggestion,
    employeeId: string,
    employeeName: string,
  ) => {
    setSuggestionDialog({
      mode: "edit",
      employeeId,
      employeeName,
      suggestion,
    });
    setSuggestionForm({
      type: suggestion.type,
      description: suggestion.description,
      priority: suggestion.priority,
      status: suggestion.status,
      notes: suggestion.notes,
    });
  };

  const handleCloseSuggestionDialog = () => {
    setSuggestionDialog(null);
    setSuggestionForm(defaultFormData);
  };

  const handleSaveSuggestion = async () => {
    if (!suggestionDialog || !suggestionForm.description.trim()) return;

    setIsSavingSuggestion(true);
    try {
      if (suggestionDialog.mode === "add") {
        const response = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: suggestionDialog.employeeId,
            type: suggestionForm.type,
            description: suggestionForm.description,
            priority: suggestionForm.priority,
            status: suggestionForm.status,
            notes: suggestionForm.notes,
            source: "admin",
            createdBy: ADMIN_EMAIL,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create suggestion");
        }

        const newSuggestion = (await response.json()) as Suggestion;

        setEmployees((prev) =>
          prev.map((employee) =>
            employee.id === suggestionDialog.employeeId
              ? {
                  ...employee,
                  suggestions: [...employee.suggestions, newSuggestion],
                }
              : employee,
          ),
        );
      } else {
        const response = await fetch(
          `/api/suggestions/${suggestionDialog.suggestion!.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: suggestionForm.type,
              description: suggestionForm.description,
              priority: suggestionForm.priority,
              status: suggestionForm.status,
              notes: suggestionForm.notes,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update suggestion");
        }

        const updatedSuggestion = (await response.json()) as Suggestion;

        setEmployees((prev) =>
          prev.map((employee) => ({
            ...employee,
            suggestions: employee.suggestions.map((s) =>
              s.id === suggestionDialog.suggestion!.id ? updatedSuggestion : s,
            ),
          })),
        );
      }

      handleCloseSuggestionDialog();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save suggestion",
      );
    } finally {
      setIsSavingSuggestion(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const withSuggestions = employees.reduce<
      (EmployeeWithSuggestions & { sortedSuggestions: Suggestion[] })[]
    >((accumulator, employee) => {
      const employeeTarget =
        `${employee.name} ${employee.department}`.toLowerCase();
      const employeeMatch =
        !normalizedSearch || employeeTarget.includes(normalizedSearch);
      const filteredSuggestions = employee.suggestions.filter((suggestion) => {
        const statusMatch =
          statusFilter === "all" || suggestion.status === statusFilter;
        const priorityMatch =
          priorityFilter === "all" || suggestion.priority === priorityFilter;
        if (!statusMatch || !priorityMatch) return false;
        if (!normalizedSearch || employeeMatch) return true;
        const suggestionTarget =
          `${suggestion.description} ${suggestion.type} ${suggestion.source} ${suggestion.createdBy ?? ""}`.toLowerCase();
        return suggestionTarget.includes(normalizedSearch);
      });
      if (filteredSuggestions.length === 0) return accumulator;
      const sortedSuggestions = [...filteredSuggestions].sort((left, right) => {
        const statusGap = statusRank[right.status] - statusRank[left.status];
        if (statusGap !== 0) return statusGap;
        const priorityGap =
          priorityRank[right.priority] - priorityRank[left.priority];
        if (priorityGap !== 0) return priorityGap;
        return right.dateUpdated.localeCompare(left.dateUpdated);
      });
      accumulator.push({
        ...employee,
        sortedSuggestions,
      });
      return accumulator;
    }, []);

    const sortedEmployees = [...withSuggestions].sort((left, right) => {
      const nameGap = left.name.localeCompare(right.name, undefined, {
        sensitivity: "base",
      });
      return nameSortDirection === "asc" ? nameGap : -nameGap;
    });

    return sortedEmployees;
  }, [employees, searchTerm, statusFilter, priorityFilter, nameSortDirection]);

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-12">
        <p className="text-sm text-[color:var(--muted)]">
          Loading suggestions...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-sm text-[color:var(--magenta)]">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            fetchData();
          }}
          className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted)]"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] bg-white px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              Suggestions
            </p>
            <p className="text-xs text-[color:var(--muted)]">
              Sort, filter, or search employee suggestions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search employees or suggestions"
              className="h-9 w-[220px] rounded-full border border-[color:var(--border)] bg-white px-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.4fr] items-center gap-4 bg-white px-5 py-4 text-sm font-semibold text-[color:var(--foreground)]">
          <button
            type="button"
            onClick={() =>
              setNameSortDirection((direction) =>
                direction === "asc" ? "desc" : "asc",
              )
            }
            className="inline-flex items-center gap-2 text-left"
          >
            Employee
            <span className="text-xs font-semibold text-[color:var(--muted)]">
              {nameSortDirection === "asc" ? "A-Z" : "Z-A"}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span>Priority</span>
            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value as "all" | SuggestionPriority,
                )
              }
              className="h-8 w-[96px] rounded-full border border-[color:var(--border)] bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground)]"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | SuggestionStatus)
              }
              className="h-8 w-[96px] rounded-full border border-[color:var(--border)] bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground)]"
            >
              <option value="all">All</option>
              <option value="overdue">Overdue</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <span className="text-right">Details</span>
        </div>
        <div className="divide-y divide-[color:var(--border)]">
          {filteredEmployees.length === 0 ? (
            <div className="px-5 py-8 text-sm text-[color:var(--muted)]">
              No suggestions match your filters.
            </div>
          ) : null}
          {filteredEmployees.map((employee, index) => {
            const isExpanded = expandedId === employee.id;
            const rowTone = index % 2 === 0 ? "bg-[#e6f2ea]" : "bg-white";
            const sortedSuggestions = employee.sortedSuggestions;
            const primarySuggestion = sortedSuggestions[0];
            const primaryPriority = priorityLabels[primarySuggestion.priority];
            const primaryStatus = statusLabels[primarySuggestion.status];

            return (
              <div key={employee.id}>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedId(isExpanded ? null : employee.id)}
                  className={`grid w-full grid-cols-[1.4fr_0.7fr_0.7fr_0.4fr] items-center gap-4 px-5 py-3 text-left text-sm text-[color:var(--foreground)] transition ${rowTone}`}
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{employee.name}</p>
                    <p className="text-xs text-[color:var(--muted)]">
                      {employee.department}
                    </p>
                  </div>
                  <span>{primaryPriority}</span>
                  <span className={statusStyles[primarySuggestion.status]}>
                    {primaryStatus}
                  </span>
                  <span className="text-right text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {isExpanded ? "Hide" : "Show"}
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                    isExpanded
                      ? "max-h-[800px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className={`px-5 pb-5 ${rowTone}`}>
                    <div className="rounded-2xl border border-[color:var(--border)] bg-white/80">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                          Suggestions
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                            {sortedSuggestions.length} total
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenAddSuggestion(
                                employee.id,
                                employee.name,
                              )
                            }
                            className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[color:var(--accent-soft)]"
                          >
                            + Add suggestion
                          </button>
                        </div>
                      </div>
                      <div className="divide-y divide-[color:var(--border)]">
                        {sortedSuggestions.map((suggestion) => {
                          const sourceLabel =
                            suggestion.source === "admin"
                              ? `Admin${suggestion.createdBy ? ` (${suggestion.createdBy})` : ""}`
                              : "VIDA";
                          const hasNote = suggestion.notes.trim().length > 0;
                          const isHighlighted =
                            suggestion.id === highlightedSuggestionId;
                          return (
                            <div
                              key={suggestion.id}
                              className={`grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,_1.6fr)_minmax(0,_0.9fr)] transition-colors duration-1000 ${
                                isHighlighted
                                  ? "bg-[color:var(--panel-lavender)]"
                                  : ""
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                                    {suggestion.description}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenEditSuggestion(
                                        suggestion,
                                        employee.id,
                                        employee.name,
                                      )
                                    }
                                    className="shrink-0 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] transition hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--foreground)]"
                                  >
                                    Edit
                                  </button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                                    {typeLabels[suggestion.type]}
                                  </span>
                                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                                    {sourceLabel}
                                  </span>
                                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                                    {priorityLabels[suggestion.priority]}{" "}
                                    priority
                                  </span>
                                  <span
                                    className={`rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusStyles[suggestion.status]}`}
                                  >
                                    {statusLabels[suggestion.status]}
                                  </span>
                                </div>
                                {hasNote ? (
                                  <p className="mt-3 text-xs text-[color:var(--muted)]">
                                    <span className="font-semibold text-[color:var(--foreground)]">
                                      Notes:
                                    </span>{" "}
                                    {suggestion.notes}
                                  </p>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenNoteDialog(
                                      suggestion,
                                      employee.name,
                                    )
                                  }
                                  className="mt-3 inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)] transition hover:bg-[color:var(--panel-muted)]"
                                >
                                  {hasNote ? "Edit note" : "+ Add note"}
                                </button>
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
                                {suggestion.dateCompleted ? (
                                  <p>
                                    <span className="font-semibold text-[color:var(--foreground)]">
                                      Completed:
                                    </span>{" "}
                                    {formatDate(suggestion.dateCompleted)}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note Dialog */}
      {noteDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={handleCloseNoteDialog}
            className="absolute inset-0"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_20px_40px_rgba(9,20,17,0.2)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  {noteDialog.currentNote ? "Edit note" : "Add note"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {noteDialog.employeeName}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  {noteDialog.suggestionDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseNoteDialog}
                className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted)]"
              >
                Close
              </button>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-[color:var(--foreground)]">
                Note
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter a note for this suggestion..."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseNoteDialog}
                className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-soft)] disabled:opacity-50"
              >
                {isSavingNote ? "Saving..." : "Save note"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Suggestion Dialog (Add/Edit) */}
      {suggestionDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={handleCloseSuggestionDialog}
            className="absolute inset-0"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_20px_40px_rgba(9,20,17,0.2)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  {suggestionDialog.mode === "add"
                    ? "Add suggestion"
                    : "Edit suggestion"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {suggestionDialog.employeeName}
                </h3>
                {suggestionDialog.mode === "add" ? (
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    This suggestion will be added as Admin ({ADMIN_EMAIL})
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleCloseSuggestionDialog}
                className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted)]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-[color:var(--foreground)]">
                Description
                <textarea
                  value={suggestionForm.description}
                  onChange={(e) =>
                    setSuggestionForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter suggestion description..."
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-3 gap-3">
                <label className="block text-sm font-medium text-[color:var(--foreground)]">
                  Type
                  <select
                    value={suggestionForm.type}
                    onChange={(e) =>
                      setSuggestionForm((prev) => ({
                        ...prev,
                        type: e.target.value as SuggestionType,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] focus:border-[color:var(--accent)] focus:outline-none"
                  >
                    {suggestionTypes.map((type) => (
                      <option key={type} value={type}>
                        {typeLabels[type]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-[color:var(--foreground)]">
                  Priority
                  <select
                    value={suggestionForm.priority}
                    onChange={(e) =>
                      setSuggestionForm((prev) => ({
                        ...prev,
                        priority: e.target.value as SuggestionPriority,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] focus:border-[color:var(--accent)] focus:outline-none"
                  >
                    {suggestionPriorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-[color:var(--foreground)]">
                  Status
                  <select
                    value={suggestionForm.status}
                    onChange={(e) =>
                      setSuggestionForm((prev) => ({
                        ...prev,
                        status: e.target.value as SuggestionStatus,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] focus:border-[color:var(--accent)] focus:outline-none"
                  >
                    {suggestionStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium text-[color:var(--foreground)]">
                Notes (optional)
                <textarea
                  value={suggestionForm.notes}
                  onChange={(e) =>
                    setSuggestionForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Enter any additional notes..."
                  rows={2}
                  className="mt-2 w-full resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseSuggestionDialog}
                className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSuggestion}
                disabled={
                  isSavingSuggestion || !suggestionForm.description.trim()
                }
                className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-soft)] disabled:opacity-50"
              >
                {isSavingSuggestion
                  ? "Saving..."
                  : suggestionDialog.mode === "add"
                    ? "Add suggestion"
                    : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
