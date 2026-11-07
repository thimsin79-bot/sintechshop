import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth-server";
import {
  getShopData,
  handleStoreAction,
  StoreError,
} from "@/lib/server/store";

export const dynamic = "force-dynamic";

async function requireUser() {
  const { data: session } = await auth.getSession();
  return session?.user ?? null;
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getShopData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unable to load shop data", error);
    return NextResponse.json(
      { error: "Unable to load shop data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { action?: string; payload?: Record<string, unknown> };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  try {
    await handleStoreAction(body.action, body.payload ?? {});
    const data = await getShopData();
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(`Store action "${body.action}" failed`, error);
    return NextResponse.json(
      { error: "Unable to update shop data" },
      { status: 500 },
    );
  }
}
