import { Mail, ShieldCheck, UserRound } from "lucide-react"

import { AdminUserActions } from "@/components/admin/admin-user-actions"
import { SectionHeading } from "@/components/site/section-heading"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockPortalDataProvider } from "@/lib/mock-data"

const statusVariants = {
  正常: "secondary",
  待验证: "outline",
  已暂停: "destructive",
} as const

export const metadata = { title: "玩家管理" }

export default async function AdminUsersPage() {
  const users = await mockPortalDataProvider.getAdminUsers()

  return (
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        eyebrow="Player management"
        title="玩家管理"
        description="查看玩家账号状态、角色数量和最近活跃时间。"
      />

      <Card className="glass-surface mt-8">
        <CardHeader>
          <CardTitle>玩家账号</CardTitle>
          <CardDescription>演示环境中的账号状态与管理动作。</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">玩家</TableHead>
                <TableHead>联系邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="min-w-56 whitespace-normal pl-6">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <UserRound className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{user.username}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {user.role} · 最近活跃 {user.lastActive}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.characters} 个角色</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[user.status]}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <AdminUserActions user={user} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/6 p-5 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>玩家封禁、角色查询、邮件验证与权限变更将在真实账户服务接入后开放。</p>
      </div>
    </div>
  )
}
