import Link from "next/link"
import { ArrowUpRight, Crown, Swords } from "lucide-react"

import type { CharacterSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

const avatarClasses = {
  gold: "from-amber-300/40 via-orange-500/15 to-slate-950",
  blue: "from-sky-300/40 via-blue-600/15 to-slate-950",
  red: "from-red-300/40 via-rose-600/15 to-slate-950",
}

export function CharacterCard({ character }: { character: CharacterSummary }) {
  return (
    <Link
      href={`/armory/character/${character.id}`}
      className="glass-surface group flex items-center gap-4 rounded-2xl border p-4 transition hover:border-primary/35"
    >
      <span
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br text-white shadow-inner",
          avatarClasses[character.avatarTone]
        )}
      >
        <Crown className="size-6 opacity-80" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold text-foreground">{character.name}</span>
          <span className="text-xs text-primary">Lv. {character.level}</span>
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {character.race} {character.className} · {character.realmName}
        </span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Swords className="size-3.5" aria-hidden="true" />
          {character.itemLevel} 装备等级
        </span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  )
}
