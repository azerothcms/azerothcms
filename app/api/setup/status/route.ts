import { NextResponse } from "next/server"

import { getSetupStatus } from "@/lib/setup"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(await getSetupStatus())
}
