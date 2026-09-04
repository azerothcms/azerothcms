import { CircleAlert, CircleCheck, Info } from "lucide-react"
import type { ReactNode } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type GlassNoticeTone = "success" | "error" | "info"

interface GlassNoticeProps {
  children: ReactNode
  className?: string
  role?: "alert" | "status"
  tone?: GlassNoticeTone
}

const toneIcons = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}

export function GlassNotice({ children, className, role, tone = "info" }: GlassNoticeProps) {
  const Icon = toneIcons[tone]

  return (
    <Alert
      className={cn("glass-notice", `glass-notice-${tone}`, className)}
      role={role ?? (tone === "error" ? "alert" : "status")}
    >
      <Icon className="mt-0.5 shrink-0" aria-hidden="true" />
      <AlertDescription className="text-inherit">{children}</AlertDescription>
    </Alert>
  )
}
