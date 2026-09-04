"use client"

import Link from "next/link"
import { Search, Swords, UsersRound, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CharacterSummary } from "@/lib/types"

export function ArmoryExplorer({ characters }: { characters: CharacterSummary[] }) {
  const [query, setQuery] = useState("")
  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return characters
    }

    return characters.filter((character) =>
      [character.name, character.realmName, character.className, character.guild].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    )
  }, [characters, query])

  return (
    <div>
      <form
        className="glass-surface flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="input-with-icon min-w-0 flex-1" htmlFor="armory-search">
          <Search className="input-icon" aria-hidden="true" />
          <Input
            id="armory-search"
            className="field-input pl-10 pr-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("")
              }
            }}
            placeholder="搜索角色、服务器、公会或职业"
            aria-label="搜索角色"
          />
          {query ? (
            <button
              type="button"
              className="input-action rounded-md p-1 focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              aria-label="清除角色搜索"
              onClick={() => setQuery("")}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </label>
        <Button type="submit" className="h-11 sm:px-7">
          搜索 Armory
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          找到 <span className="font-semibold text-foreground">{filteredCharacters.length}</span> 位角色
        </p>
        <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <UsersRound className="size-3.5" aria-hidden="true" />
          数据每 15 分钟更新
        </p>
      </div>

      {filteredCharacters.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredCharacters.map((character) => (
            <Link
              key={character.id}
              href={`/armory/character/${character.id}`}
              className="glass-surface group flex items-center gap-4 rounded-2xl border p-5 transition hover:border-primary/35"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <Swords className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold text-foreground">{character.name}</span>
                  <span className="text-xs text-primary">Lv. {character.level}</span>
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {character.race} {character.className} · {character.realmName}
                </span>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {character.guild} · 装备等级 {character.itemLevel}
                </span>
              </span>
              <span className="text-xs text-primary opacity-0 transition group-hover:opacity-100">查看</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-surface mt-4 rounded-2xl border border-dashed px-6 py-16 text-center">
          <Search className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 font-medium text-foreground">没有找到匹配的角色</p>
          <p className="mt-2 text-sm text-muted-foreground">试试角色名、服务器名或职业名称。</p>
          <Button variant="outline" className="mt-5" onClick={() => setQuery("")}>
            清除搜索
          </Button>
        </div>
      )}
    </div>
  )
}
