import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import ClientDetail from '@/pages/ClientDetail'
import ContentEditor from '@/pages/ContentEditor'
import Opportunities from '@/pages/Opportunities'
import CrawlResults from '@/pages/CrawlResults'
import Settings from '@/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="clients/:clientId" element={<ClientDetail />} />
            <Route path="clients/:clientId/content/:contentId" element={<ContentEditor />} />
            <Route path="clients/:clientId/opportunities" element={<Opportunities />} />
            <Route path="clients/:clientId/crawl" element={<CrawlResults />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
