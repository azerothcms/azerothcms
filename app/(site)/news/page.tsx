import { Newspaper } from "lucide-react"
import Link from "next/link"

import { NewsCatalog } from "@/components/site/news-catalog"
import { SectionHeading } from "@/components/site/section-heading"
import { copy } from "@/lib/i18n"
import { mockPortalDataProvider } from "@/lib/mock-data"

export const metadata = {
  title: "社区动态",
  description: "查看 Azeroth CMS 的服务器公告与社区活动。",
}

export default async function NewsPage() {
  const articles = await mockPortalDataProvider.getNews()

  return (
    <div className="content-shell page-section">
      <div className="page-kicker">
        <Newspaper className="size-4" aria-hidden="true" />
        Community journal
      </div>
      <SectionHeading
        className="mt-5"
        title="社区动态"
        description="服务器公告、活动消息和来自冒险者社区的最新故事。"
        action={<Link href="/" className="text-link">{copy.common.backHome}</Link>}
      />
      <NewsCatalog articles={articles} />
    </div>
  )
}
