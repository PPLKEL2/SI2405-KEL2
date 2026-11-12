import { NextResponse, type NextRequest } from "next/server.js";
import { evIncentiveRepository } from "../../../../lib/storage/ev-incentive-repository.ts";
import type { IncentiveCategory } from "../../../../lib/types/ev-incentives.ts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") as IncentiveCategory | null;
    const activeParam = searchParams.get("isActive");
    const dateParam = searchParams.get("date");

    const filters: {
      category?: IncentiveCategory;
      isActive?: boolean;
      date?: string;
    } = {};

    if (categoryParam) filters.category = categoryParam;
    if (activeParam !== null) filters.isActive = activeParam === "true";
    if (dateParam) filters.date = dateParam;

    const data = evIncentiveRepository.getAllPolicies(filters);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const author = body.changedBy || "Superadmin";

    const result = evIncentiveRepository.createPolicy(body, author);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, errors: result.errors },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: result.data,
        message: "Kebijakan insentif/pajak berhasil ditambahkan.",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
