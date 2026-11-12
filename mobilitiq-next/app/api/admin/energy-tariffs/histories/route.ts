import { NextResponse } from "next/server.js";
import { energyTariffRepository } from "../../../../../lib/storage/energy-tariff-repository.ts";
import type { EnergyCategory } from "../../../../../lib/types/energy-pricing.ts";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tariffId = searchParams.get("tariffId") || undefined;
    const category = (searchParams.get("category") as EnergyCategory) || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const histories = energyTariffRepository.getHistories({
      tariffId,
      category,
      limit,
    });

    return NextResponse.json({
      ok: true,
      data: histories,
      count: histories.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
