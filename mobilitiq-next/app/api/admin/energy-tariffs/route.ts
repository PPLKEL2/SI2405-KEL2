import { NextResponse } from "next/server.js";
import { energyTariffRepository } from "../../../../lib/storage/energy-tariff-repository.ts";
import type { EnergyCategory, EnergyTariffInput } from "../../../../lib/types/energy-pricing.ts";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as EnergyCategory | null;
    const isActiveParam = searchParams.get("isActive");
    const search = searchParams.get("search") || undefined;

    const isActive =
      isActiveParam === "true"
        ? true
        : isActiveParam === "false"
          ? false
          : undefined;

    const tariffs = energyTariffRepository.getAllTariffs({
      category: category || undefined,
      isActive,
      search,
    });

    return NextResponse.json({
      ok: true,
      data: tariffs,
      count: tariffs.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server internal";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnergyTariffInput;
    const author = body.changedBy || "Superadmin MobilitiQ";

    const result = energyTariffRepository.createTariff(body, author);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          errors: result.errors,
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: result.data,
        message: "Parameter harga energi berhasil ditambahkan.",
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Permintaan tidak valid";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400 },
    );
  }
}
