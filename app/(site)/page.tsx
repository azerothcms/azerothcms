import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  CircleCheck,
  Crown,
  ShieldCheck,
  Sparkles,
  Swords,
  Users,
} from "lucide-react"

import { CharacterCard } from "@/components/site/character-card"
import { NewsCard } from "@/components/site/news-card"
import { RealmCard } from "@/components/site/realm-card"
import { SectionHeading } from "@/components/site/section-heading"
import { StatusBadge } from "@/components/site/status-badge"
import { copy } from "@/lib/i18n"
import { portalDataProvider } from "@/lib/portal-data-provider"

export default async function HomePage() {
  const [realms, articles, characters] = await Promise.all([
    portalDataProvider.getRealms(),
    portalDataProvider.getNews(),
    portalDataProvider.getCharacters(),
  ])
  const onlinePlayers = realms.reduce((total, realm) => total + realm.onlinePlayers, 0)
  const onlineRealms = realms.filter((realm) => realm.status === "online")
  const featuredArticle = articles.find((article) => article.featured) ?? articles[0]

  return (
    <>
      <section className="hero-section">
        <div className="content-shell relative grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div className="relative z-10 max-w-2xl">
            <div className="eyebrow inline-flex items-center gap-2">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {copy.home.eyebrow}
            </div>
            <h1 className="mt-6 max-w-2xl whitespace-pre-line text-5xl font-semibold leading-[1.03] tracking-[-0.05em] text-white sm:text-7xl">
              {copy.home.title}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              {copy.home.description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/realms" className="primary-action">
                {copy.home.heroPrimary}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/account" className="secondary-action">
                {copy.home.heroSecondary}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-2">
                <CircleCheck className="size-4 text-emerald-400" aria-hidden="true" />
                {onlineRealms.length} 个 Realm 正在运行
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                社区数据安全同步
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:ml-auto">
            <div className="hero-glow" />
            <div className="hero-card relative overflow-hidden rounded-[2rem] border border-white/12 bg-slate-950/80 p-5 shadow-[0_32px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(206,156,69,0.08))]" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Realm overview</p>
                    <p className="mt-2 text-lg font-semibold text-white">服务器实时状态</p>
                  </div>
                  <span className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                    <Crown className="size-4" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <Swords className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-white">{realms[0].name}</p>
                        <p className="mt-1 text-xs text-slate-400">{realms[0].expansion} · {realms[0].type}</p>
                      </div>
                    </div>
                    <StatusBadge status={realms[0].status} />
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="font-mono text-3xl font-semibold text-white">{onlinePlayers.toLocaleString()}</p>
                      <p className="mt-1 text-xs text-slate-400">当前在线玩家</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                      <Users className="size-3.5" aria-hidden="true" />
                      +12.4%
                    </span>
                  </div>
                  <div className="mt-5 h-1.5 rounded-full bg-white/10">
                    <div className="h-full w-[71%] rounded-full bg-gradient-to-r from-emerald-400 to-primary" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                    <p className="text-xs text-slate-500">活跃 Realm</p>
                    <p className="mt-2 text-xl font-semibold text-white">{onlineRealms.length}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                    <p className="text-xs text-slate-500">社区角色</p>
                    <p className="mt-2 text-xl font-semibold text-white">2,846</p>
                  </div>
                </div>
              </div>
            </div>
            <span className="rune rune-one">✦</span>
            <span className="rune rune-two">✧</span>
          </div>
        </div>
      </section>

      <section className="content-shell py-20 sm:py-24">
        <SectionHeading
          eyebrow={copy.home.liveNow}
          title="实时掌握你的服务器"
          description={copy.home.liveDescription}
          action={
            <Link href="/realms" className="text-link">
              {copy.common.viewAll}
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {realms.map((realm) => <RealmCard key={realm.id} realm={realm} />)}
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/30">
        <div className="content-shell py-20 sm:py-24">
          <SectionHeading
            eyebrow={copy.home.latestNews}
            title="来自社区的最新消息"
            description={copy.home.latestNewsDescription}
            action={
              <Link href="/news" className="text-link">
                {copy.common.viewAll}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {articles.slice(0, 3).map((article) => <NewsCard key={article.id} article={article} />)}
          </div>
        </div>
      </section>

      <section className="content-shell py-20 sm:py-24">
        <div className="armory-banner relative overflow-hidden rounded-[2rem] border border-primary/25 bg-slate-950 p-7 sm:p-10 lg:p-14">
          <div className="armory-banner-glow" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-end">
            <div className="max-w-xl">
              <p className="eyebrow">Armory</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.home.armoryTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">{copy.home.armoryDescription}</p>
              <Link href="/armory" className="primary-action mt-7">
                {copy.home.armoryAction}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {characters.slice(0, 2).map((character) => <CharacterCard key={character.id} character={character} />)}
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 sm:col-span-2">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                探索更多角色，发现属于你的传奇。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-shell pb-20 sm:pb-24">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-border/70 bg-card/50 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="eyebrow">Featured update</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{featuredArticle.title}</p>
          </div>
          <Link href={`/news/${featuredArticle.slug}`} className="text-link shrink-0">
            阅读公告
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
