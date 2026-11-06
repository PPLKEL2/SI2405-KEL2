import { NextResponse } from "next/server.js";
import { energyTariffRepository } from "../../../../lib/storage/energy-tariff-repository.ts";
import type { EnergyCategory } from "../../../../lib/types/energy-pricing.ts";
import { isValidIsoDate } from "../../../../lib/calculations/energy-pricing.ts";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const category = (searchParams.get("category") as EnergyCategory) || undefined;

    const targetDate = dateParam || new Date().toISOString().slice(0, 10);

    if (!isValidIsoDate(targetDate)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Format tanggal 'date' tidak valid (gunakan format YYYY-MM-DD)",
        },
        { status: 400 },
      );
    }

    const activeTariffs = energyTariffRepository.getActiveTariffsOnDate(
      targetDate,
      category,
    );

    return NextResponse.json({
      ok: true,
      simulationDate: targetDate,
      data: activeTariffs,
      count: activeTariffs.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
