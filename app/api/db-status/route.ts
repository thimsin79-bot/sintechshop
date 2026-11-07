import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        status: "disconnected",
        latencyMs: null,
        message: "DATABASE_URL is not configured.",
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  const startedAt = Date.now();

  try {
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "connected",
      latencyMs: Date.now() - startedAt,
      message: "Database connection is healthy.",
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database health check failed", error);
    return NextResponse.json(
      {
        status: "disconnected",
        latencyMs: null,
        message: "Unable to reach the database.",
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
