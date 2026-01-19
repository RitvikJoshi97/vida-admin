export type SuggestionStatus = "pending" | "in_progress" | "completed" | "overdue";
export type SuggestionPriority = "low" | "medium" | "high";
export type SuggestionType = "equipment" | "exercise" | "behavioural" | "lifestyle";
export type RiskLevel = "low" | "medium" | "high";

export type Employee = {
  id: string;
  name: string;
  department: string;
  riskLevel: RiskLevel;
};

export type Suggestion = {
  id: string;
  employeeId: string;
  type: SuggestionType;
  description: string;
  status: SuggestionStatus;
  priority: SuggestionPriority;
  source: "vida" | "admin";
  createdBy?: string;
  dateCreated: string;
  dateUpdated: string;
  dateCompleted?: string;
  notes: string;
};

export type SampleData = {
  employees: Employee[];
  suggestions: Suggestion[];
};

// Combined type for UI display (employee with their suggestions)
export type EmployeeWithSuggestions = Employee & {
  suggestions: Suggestion[];
};
