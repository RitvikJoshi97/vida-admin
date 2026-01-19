import { NextResponse } from "next/server";
import { updateSuggestion, deleteSuggestion } from "@/lib/data";
import type { Suggestion } from "@/lib/types";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<Suggestion>;
    const updated = await updateSuggestion(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update suggestion:", error);
    return NextResponse.json(
      { error: "Failed to update suggestion" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteSuggestion(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete suggestion:", error);
    return NextResponse.json(
      { error: "Failed to delete suggestion" },
      { status: 500 }
    );
  }
}
