import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Clock3, Crown, HeartPulse, Shield, Swords, Trophy, Zap } from "lucide-react"
import { notFound } from "next/navigation"

import { copy } from "@/lib/i18n"
import { characters, mockPortalDataProvider } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface CharacterPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return characters.map((character) => ({ id: character.id }))
}

export async function generateMetadata({ params }: CharacterPageProps): Promise<Metadata> {
  const { id } = await params
  const character = await mockPortalDataProvider.getCharacter(id)

  return {
    title: character ? `${character.name} · Armory` : "Armory",
    description: character ? `${character.name} 的角色档案。` : "角色档案。",
  }
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { id } = await params
  const character = await mockPortalDataProvider.getCharacter(id)

  if (!character) {
    notFound()
  }

  return (
    <div className="content-shell page-section">
      <Link href="/armory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回 Armory
      </Link>
      <section className="character-hero mt-8 overflow-hidden rounded-[2rem] border border-primary/20 p-6 sm:p-10">
        <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-5">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/12 text-primary shadow-[0_0_40px_rgba(214,167,84,0.14)] sm:size-24">
              <Crown className="size-9" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">{character.realmName} · {character.faction}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-6xl">{character.name}</h1>
              <p className="mt-3 text-sm text-slate-400">Lv. {character.level} {character.race} {character.className} · {character.guild}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-primary/30 bg-primary/12 px-4 py-3 text-center">
              <span className="block font-mono text-xl font-semibold text-primary">{character.itemLevel}</span>
              <span className="mt-1 block text-[10px] uppercase tracking-wider text-slate-400">Item level</span>
            </span>
            <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
              <span className="block text-sm font-semibold text-white">活跃</span>
              <span className="mt-1 block text-[10px] uppercase tracking-wider text-slate-400">状态</span>
            </span>
          </div>
        </div>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "生命值", value: character.stats.health, icon: HeartPulse },
          { label: "能量值", value: character.stats.power, icon: Zap },
          { label: "成就点数", value: character.stats.achievementPoints.toLocaleString(), icon: Trophy },
          { label: "游戏时长", value: character.stats.playTime, icon: Clock3 },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-2xl border border-border/80 bg-card p-5">
              <Icon className="size-4 text-primary" aria-hidden="true" />
              <p className="mt-5 truncate font-mono text-xl font-semibold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Equipment</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">装备档案</h2>
            </div>
            <Swords className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div className="mt-7 divide-y divide-border/70">
            {character.gear.map((item) => (
              <div key={item.slot} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs", {
                    "border-amber-400/25 bg-amber-400/10 text-amber-300": item.tone === "gold",
                    "border-sky-400/25 bg-sky-400/10 text-sky-300": item.tone === "blue",
                    "border-violet-400/25 bg-violet-400/10 text-violet-300": item.tone === "purple",
                    "border-emerald-400/25 bg-emerald-400/10 text-emerald-300": item.tone === "green",
                  })}>
                    <Shield className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.slot}</p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-sm text-primary">{item.itemLevel}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
          <p className="eyebrow">Character story</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">旅程摘要</h2>
          <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
            <p>{character.name} 是 {character.guild} 的成员，活跃于 {character.realmName}。</p>
            <p>这个角色最近一次被记录在服务器上是在 {character.lastSeen}，当前装备等级为 {character.itemLevel}。</p>
          </div>
          <Link href="/account/characters" className="text-link mt-8">查看我的角色<span aria-hidden="true">→</span></Link>
        </section>
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">{copy.common.updated}：原型演示数据</p>
    </div>
  )
}
