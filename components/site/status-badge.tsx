import { CircleCheck, CircleOff, Wrench } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { statusLabel } from "@/lib/i18n"
import type { RealmStatus } from "@/lib/types"

const statusVariants = {
  online: "secondary",
  offline: "outline",
  maintenance: "warning",
} as const

const statusIcons = {
  online: CircleCheck,
  offline: CircleOff,
  maintenance: Wrench,
}

export function StatusBadge({ status }: { status: RealmStatus }) {
  const Icon = statusIcons[status]

  return (
    <Badge variant={statusVariants[status]}>
      <Icon aria-hidden="true" />
      {statusLabel[status]}
    </Badge>
  )
}
