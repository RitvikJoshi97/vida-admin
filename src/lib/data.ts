import { promises as fs } from "fs";
import path from "path";
import type { SampleData, Employee, Suggestion, EmployeeWithSuggestions } from "./types";

const DATA_FILE_PATH = path.join(process.cwd(), "public", "sample_data.json");

export async function readData(): Promise<SampleData> {
  const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
  return JSON.parse(fileContent) as SampleData;
}

export async function writeData(data: SampleData): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getEmployees(): Promise<Employee[]> {
  const data = await readData();
  return data.employees;
}

export async function getSuggestions(): Promise<Suggestion[]> {
  const data = await readData();
  return data.suggestions;
}

export async function getEmployeesWithSuggestions(): Promise<EmployeeWithSuggestions[]> {
  const data = await readData();
  return data.employees.map((employee) => ({
    ...employee,
    suggestions: data.suggestions.filter((s) => s.employeeId === employee.id),
  }));
}

export async function updateSuggestion(
  suggestionId: string,
  updates: Partial<Suggestion>
): Promise<Suggestion | null> {
  const data = await readData();
  const index = data.suggestions.findIndex((s) => s.id === suggestionId);

  if (index === -1) {
    return null;
  }

  const updated: Suggestion = {
    ...data.suggestions[index],
    ...updates,
    dateUpdated: new Date().toISOString(),
  };

  data.suggestions[index] = updated;
  await writeData(data);

  return updated;
}

export async function createSuggestion(
  suggestion: Omit<Suggestion, "id" | "dateCreated" | "dateUpdated">
): Promise<Suggestion> {
  const data = await readData();

  const newSuggestion: Suggestion = {
    ...suggestion,
    id: crypto.randomUUID(),
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  };

  data.suggestions.push(newSuggestion);
  await writeData(data);

  return newSuggestion;
}

export async function deleteSuggestion(suggestionId: string): Promise<boolean> {
  const data = await readData();
  const index = data.suggestions.findIndex((s) => s.id === suggestionId);

  if (index === -1) {
    return false;
  }

  data.suggestions.splice(index, 1);
  await writeData(data);

  return true;
}
