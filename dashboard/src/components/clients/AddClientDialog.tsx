import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ManualClientForm } from './ManualClientForm'
import { NotionImportForm } from './NotionImportForm'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddClientDialog({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<'manual' | 'notion'>('manual')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'manual' | 'notion')}>
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
            <TabsTrigger value="notion" className="flex-1">Import from Notion</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <ManualClientForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="notion">
            <NotionImportForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
