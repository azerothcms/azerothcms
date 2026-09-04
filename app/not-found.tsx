import { ArrowLeft, Home, SearchX } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="content-shell flex min-h-[calc(100svh-9rem)] items-center justify-center py-16">
      <section className="glass-surface w-full max-w-xl rounded-[var(--window-radius)] border p-8 text-center sm:p-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <SearchX className="size-6" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-7">Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          找不到这段冒险记录
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
          你访问的页面可能已经离开当前 Realm，或者地址暂时还没有对应的内容。
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="primary-action">
            <Home className="size-4" aria-hidden="true" />
            返回首页
          </Link>
          <Link href="/realms" className="secondary-action">
            <ArrowLeft className="size-4" aria-hidden="true" />
            浏览服务器
          </Link>
        </div>
      </section>
    </div>
  )
}
