import { NextResponse } from "next/server.js";
import { energyTariffRepository } from "../../../../../lib/storage/energy-tariff-repository.ts";
import type { EnergyTariffInput } from "../../../../../lib/types/energy-pricing.ts";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const tariff = energyTariffRepository.getTariffById(id);

    if (!tariff) {
      return NextResponse.json(
        { ok: false, error: "Parameter energi tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: tariff });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as EnergyTariffInput;
    const author = body.changedBy || "Superadmin MobilitiQ";

    const result = energyTariffRepository.updateTariff(id, body, author);

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

    return NextResponse.json({
      ok: true,
      data: result.data,
      message: "Parameter harga energi berhasil diperbarui.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Permintaan tidak valid";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      isActive: boolean;
      reason?: string;
      changedBy?: string;
    };

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "Field 'isActive' harus berupa boolean (true/false)" },
        { status: 422 },
      );
    }

    const author = body.changedBy || "Superadmin MobilitiQ";
    const result = energyTariffRepository.toggleTariffStatus(
      id,
      body.isActive,
      author,
      body.reason,
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 422 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
      message: `Status parameter berhasil diubah menjadi ${body.isActive ? "Aktif" : "Nonaktif"}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Permintaan tidak valid";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
