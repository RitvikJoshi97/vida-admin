import { NextResponse } from "next/server";
import {
  getEmployeesWithSuggestions,
  createSuggestion,
} from "@/lib/data";
import type { Suggestion } from "@/lib/types";

export async function GET() {
  try {
    const employeesWithSuggestions = await getEmployeesWithSuggestions();
    return NextResponse.json(employeesWithSuggestions);
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<
      Suggestion,
      "id" | "dateCreated" | "dateUpdated"
    >;
    const newSuggestion = await createSuggestion(body);
    return NextResponse.json(newSuggestion, { status: 201 });
  } catch (error) {
    console.error("Failed to create suggestion:", error);
    return NextResponse.json(
      { error: "Failed to create suggestion" },
      { status: 500 }
    );
  }
}
