import { useState } from 'react'
import { Check, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ApiKeyFieldProps {
  label: string
  description: string
  storageKey: string
  placeholder: string
}

function ApiKeyField({ label, description, storageKey, placeholder }: ApiKeyFieldProps) {
  const [value, setValue] = useState(() => localStorage.getItem(storageKey) || '')
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    localStorage.setItem(storageKey, value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="text-sm font-medium text-[#0a0a0a]">{label}</label>
        <p className="text-xs text-[#737373] mt-0.5">{description}</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type={show ? 'text' : 'password'}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#737373]"
          >
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={handleSave}>
          {saved ? <Check className="h-3.5 w-3.5 text-green-600" /> : 'Save'}
        </Button>
      </div>
    </div>
  )
}

export default function Settings() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-[#e5e5e5] bg-white px-6 py-4">
        <h1 className="text-base font-semibold text-[#0a0a0a]">Settings</h1>
        <p className="text-xs text-[#737373]">Configure API keys and integrations</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl flex flex-col gap-6">
          {/* AI */}
          <Card>
            <CardHeader>
              <CardTitle>AI</CardTitle>
              <CardDescription>Configure the Claude API for content generation</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ApiKeyField
                label="Anthropic API key"
                description="Used for AI content generation. Get yours at console.anthropic.com."
                storageKey="anthropic_api_key"
                placeholder="sk-ant-..."
              />
            </CardContent>
          </Card>

          {/* Supabase */}
          <Card>
            <CardHeader>
              <CardTitle>Supabase</CardTitle>
              <CardDescription>Database connection for storing clients and content</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-md border border-[#e5e5e5] bg-[#fafafa] p-3">
                <p className="text-xs font-medium text-[#525252]">Environment variables</p>
                <p className="text-xs text-[#737373] mt-1">
                  Set <code className="rounded bg-white border border-[#e5e5e5] px-1 text-[11px]">VITE_SUPABASE_URL</code> and{' '}
                  <code className="rounded bg-white border border-[#e5e5e5] px-1 text-[11px]">VITE_SUPABASE_ANON_KEY</code> in your{' '}
                  <code className="rounded bg-white border border-[#e5e5e5] px-1 text-[11px]">.env</code> file.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notion */}
          <Card>
            <CardHeader>
              <CardTitle>Notion</CardTitle>
              <CardDescription>Import client data from Notion databases</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ApiKeyField
                label="Notion API key"
                description="Create an integration at notion.so/my-integrations. The key is stored locally."
                storageKey="notion_api_key"
                placeholder="secret_..."
              />
              <div className="rounded-md border border-[#e5e5e5] bg-[#fafafa] p-3">
                <p className="text-xs font-medium text-[#525252]">How to use</p>
                <ol className="mt-1 list-decimal list-inside text-xs text-[#737373] space-y-1">
                  <li>Create a Notion integration and copy the secret key above</li>
                  <li>Share your CRM database with the integration</li>
                  <li>Click + in the sidebar → Import from Notion</li>
                  <li>Paste your database ID and fetch clients</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* n8n */}
          <Card>
            <CardHeader>
              <CardTitle>n8n Webhooks</CardTitle>
              <CardDescription>Connect n8n workflows for crawling and automation</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-md border border-[#e5e5e5] bg-[#fafafa] p-3">
                <p className="text-xs font-medium text-[#525252]">Environment variables</p>
                <div className="mt-2 flex flex-col gap-1">
                  <code className="text-[11px] text-[#525252]">
                    VITE_N8N_CRAWL_WEBHOOK=https://your-n8n.com/webhook/crawl
                  </code>
                </div>
                <p className="text-xs text-[#737373] mt-2">
                  The crawl webhook receives <code className="text-[11px]">&#123; url, client_id &#125;</code> and is expected to parse
                  the page and insert rows into the <code className="text-[11px]">crawled_pages</code> Supabase table.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Database setup */}
          <Card>
            <CardHeader>
              <CardTitle>Database setup</CardTitle>
              <CardDescription>Run this SQL in your Supabase SQL editor to create the schema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-[#e5e5e5] bg-[#fafafa] p-3 overflow-x-auto">
                <pre className="text-[11px] text-[#525252] whitespace-pre-wrap">{SQL_SCHEMA}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const SQL_SCHEMA = `create table clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  slug text unique not null,
  website_url text,
  notion_id text,
  brand_script jsonb,
  tone_of_voice text,
  segments jsonb,
  main_keywords text[],
  extra_keywords text[],
  json_schema_presets jsonb,
  logo_url text
);

create table content_pieces (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  slug text,
  content text,
  status text default 'draft',
  content_type text default 'blog',
  target_keyword text,
  meta_title text,
  meta_description text,
  seo_score int,
  live_url text,
  ai_generated boolean default false
);

create table keyword_analysis (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references content_pieces(id) on delete cascade,
  keyword text not null,
  target_count int,
  actual_count int,
  density numeric(5,2)
);

create table crawled_pages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  crawled_at timestamptz default now(),
  url text not null,
  title text,
  h1 text,
  h2s text[],
  meta_description text,
  content_text text,
  word_count int,
  status_code int
);

create table content_opportunities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  created_at timestamptz default now(),
  title text not null,
  target_keyword text,
  estimated_volume int,
  difficulty int,
  opportunity_score int,
  status text default 'pending'
);

create table performance_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  content_id uuid references content_pieces(id),
  date date not null,
  url text,
  impressions int,
  clicks int,
  ctr numeric(5,4),
  avg_position numeric(6,2),
  source text default 'gsc'
);`
