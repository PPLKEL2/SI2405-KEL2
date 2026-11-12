import { NextResponse, type NextRequest } from "next/server.js";
import { energyTariffRepository } from "../../../../../lib/storage/energy-tariff-repository.ts";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updates = body.updates;
    const author = body.changedBy || "Superadmin";

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Daftar pembaruan tarif tidak boleh kosong" },
        { status: 400 },
      );
    }

    const result = energyTariffRepository.updateMultiplePrices(updates, author);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
      updatedAt: result.updatedAt,
      message: "Perubahan tarif berhasil disimpan ke sistem.",
    });
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
