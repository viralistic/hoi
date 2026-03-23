import { Link } from 'react-router-dom'
import { Plus, FileText, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useClients } from '@/hooks/useClients'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'
import { AddClientDialog } from '@/components/clients/AddClientDialog'

export default function Dashboard() {
  const { clients } = useClients()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-0 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-6 py-4">
          <div>
            <h1 className="text-base font-semibold text-[#0a0a0a]">Dashboard</h1>
            <p className="text-xs text-[#737373]">
              {new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date())}
            </p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add client
          </Button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={<Users className="h-4 w-4 text-[#737373]" />}
              label="Clients"
              value={clients.length}
            />
            <StatCard
              icon={<FileText className="h-4 w-4 text-[#737373]" />}
              label="Total content"
              value="—"
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-[#737373]" />}
              label="Avg SEO score"
              value="—"
            />
          </div>

          {/* Clients grid */}
          {clients.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-[#0a0a0a]">Clients</h2>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {clients.map((client) => (
                  <Link key={client.id} to={`/clients/${client.id}`}>
                    <Card className="transition-shadow hover:shadow-md cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#f5f5f5] text-sm font-semibold uppercase">
                              {client.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#0a0a0a]">{client.name}</p>
                              {client.website_url && (
                                <p className="text-xs text-[#a3a3a3] truncate max-w-[140px]">
                                  {client.website_url.replace(/^https?:\/\//, '')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {client.main_keywords && client.main_keywords.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {client.main_keywords.slice(0, 3).map((kw) => (
                              <Badge key={kw} variant="secondary" className="text-[10px]">
                                {kw}
                              </Badge>
                            ))}
                            {client.main_keywords.length > 3 && (
                              <Badge variant="secondary" className="text-[10px]">
                                +{client.main_keywords.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <p className="mt-2 text-[11px] text-[#a3a3a3]">
                          Added {formatDate(client.created_at)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#e5e5e5] py-16">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5]">
                <Users className="h-5 w-5 text-[#a3a3a3]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#525252]">No clients yet</p>
                <p className="text-xs text-[#a3a3a3]">Add your first client to get started</p>
              </div>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add client
              </Button>
            </div>
          )}
        </div>
      </div>

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs text-[#737373]">{label}</span>
        </div>
        <p className="mt-1.5 text-2xl font-semibold text-[#0a0a0a]">{value}</p>
      </CardContent>
    </Card>
  )
}
