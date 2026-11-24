import { NextResponse, type NextRequest } from "next/server.js";
import { evIncentiveRepository } from "../../../../../lib/storage/ev-incentive-repository.ts";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const policy = evIncentiveRepository.getPolicyById(id);

    if (!policy) {
      return NextResponse.json(
        { ok: false, error: "Kebijakan tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: policy });
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const author = body.changedBy || "Superadmin";

    const result = evIncentiveRepository.updatePolicy(id, body, author);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, errors: result.errors },
        { status: 422 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
      message: "Kebijakan berhasil diperbarui.",
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const author = body.changedBy || "Superadmin";

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "Field 'isActive' harus bertipe boolean" },
        { status: 400 },
      );
    }

    const result = evIncentiveRepository.togglePolicyStatus(
      id,
      body.isActive,
      author,
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
      message: `Status kebijakan berhasil diubah menjadi ${body.isActive ? "Aktif" : "Mati"}.`,
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

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const result = evIncentiveRepository.deletePolicy(id);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Gagal menghapus kebijakan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Kebijakan berhasil dihapus.",
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

