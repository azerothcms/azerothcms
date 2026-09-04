import type { Metadata } from "next"

import { SetupWizard } from "@/components/setup/setup-wizard"

export const metadata: Metadata = {
  title: "初始化向导",
}

export default function SetupPage() {
  return <SetupWizard />
}
