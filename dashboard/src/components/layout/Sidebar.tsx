import { Link, useLocation, useParams } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  Plus,
  Settings,
  ChevronRight,
  Lightbulb,
  Globe,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useClients } from '@/hooks/useClients'
import { AddClientDialog } from '@/components/clients/AddClientDialog'

export function Sidebar() {
  const location = useLocation()
  const { clientId } = useParams()
  const { clients } = useClients()
  const [addOpen, setAddOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <aside className="flex h-screen w-[220px] flex-shrink-0 flex-col border-r border-[#e5e5e5] bg-white">
        {/* Logo */}
        <div className="flex h-12 items-center gap-2 border-b border-[#e5e5e5] px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#101010]">
              <span className="text-[10px] font-bold text-white">V</span>
            </div>
            <span className="text-sm font-semibold text-[#0a0a0a]">Viralistic</span>
          </Link>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-2">
            {/* Dashboard */}
            <NavItem
              to="/"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              active={isActive('/')}
            />

            <Separator className="my-1.5" />

            {/* Clients header + add button */}
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                Clients
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setAddOpen(true)}
                title="Add client"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Client list */}
            {clients.map((client) => (
              <div key={client.id}>
                <Link
                  to={`/clients/${client.id}`}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    clientId === client.id
                      ? 'bg-[#f5f5f5] text-[#0a0a0a] font-medium'
                      : 'text-[#525252] hover:bg-[#f5f5f5] hover:text-[#0a0a0a]'
                  )}
                >
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-[#f5f5f5] text-[10px] font-semibold uppercase">
                    {client.name.charAt(0)}
                  </div>
                  <span className="truncate">{client.name}</span>
                  {clientId === client.id && (
                    <ChevronRight className="ml-auto h-3 w-3 text-[#a3a3a3]" />
                  )}
                </Link>

                {/* Sub-nav for active client */}
                {clientId === client.id && (
                  <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-[#e5e5e5] pl-2">
                    <SubNavItem
                      to={`/clients/${client.id}`}
                      icon={<FileText className="h-3 w-3" />}
                      label="Content"
                      active={location.pathname === `/clients/${client.id}`}
                    />
                    <SubNavItem
                      to={`/clients/${client.id}/opportunities`}
                      icon={<Lightbulb className="h-3 w-3" />}
                      label="Opportunities"
                      active={location.pathname === `/clients/${client.id}/opportunities`}
                    />
                    <SubNavItem
                      to={`/clients/${client.id}/crawl`}
                      icon={<Globe className="h-3 w-3" />}
                      label="Crawl"
                      active={location.pathname === `/clients/${client.id}/crawl`}
                    />
                  </div>
                )}
              </div>
            ))}

            {clients.length === 0 && (
              <button
                onClick={() => setAddOpen(true)}
                className="mx-2 mt-1 flex items-center gap-2 rounded-md border border-dashed border-[#e5e5e5] px-2 py-2 text-xs text-[#a3a3a3] transition-colors hover:border-[#c5c5c5] hover:text-[#737373]"
              >
                <Plus className="h-3 w-3" />
                Add first client
              </button>
            )}
          </div>
        </ScrollArea>

        {/* Bottom nav */}
        <div className="border-t border-[#e5e5e5] p-2">
          <NavItem
            to="/settings"
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            active={isActive('/settings')}
          />
        </div>
      </aside>

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  )
}

function NavItem({
  to,
  icon,
  label,
  active,
}: {
  to: string
  icon: React.ReactNode
  label: string
  active: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        active
          ? 'bg-[#f5f5f5] text-[#0a0a0a] font-medium'
          : 'text-[#525252] hover:bg-[#f5f5f5] hover:text-[#0a0a0a]'
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

function SubNavItem({
  to,
  icon,
  label,
  active,
}: {
  to: string
  icon: React.ReactNode
  label: string
  active: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors',
        active
          ? 'text-[#0a0a0a] font-medium'
          : 'text-[#737373] hover:text-[#0a0a0a]'
      )}
    >
      {icon}
      {label}
    </Link>
  )
}
