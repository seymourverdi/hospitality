'use client'

import * as React from 'react'
import Link from 'next/link'

type StatsConfig = {
  daily: { revenue: boolean; tickets: boolean; avgOrderValue: boolean; events: boolean; popularItems: boolean; laborCost: boolean; foodCost: boolean; beverageCost: boolean }
  weekly: { revenue: boolean; tickets: boolean; avgOrderValue: boolean; events: boolean; popularItems: boolean; laborCost: boolean; foodCost: boolean; beverageCost: boolean }
}

type DiscountTier = { value: number; color: string }

type SaleConfig = {
  showAllModifiersByDefault: boolean
  showSkipSeating: boolean
  showNonMember: boolean
  noticeEnabled: boolean
  noticeMessage: string
  memberDiscounts: DiscountTier[]
  nonMemberDiscounts: DiscountTier[]
  nonMemberPriceIncrease: boolean
  nonMemberPriceIncreasePercent: number
  autoGroupOrders: boolean
  autoGroupMinutes: number
}

type RsvpConfig = {
  allowGuestOverride: boolean
  showTablesOption: boolean
  allowAllDayMenu: boolean
  allowSocialLunch: boolean
  allowMixed: boolean
}

type LocationSettings = { statsConfig: StatsConfig; saleConfig: SaleConfig; rsvpConfig: RsvpConfig }

const defaultStats: StatsConfig = {
  daily: { revenue: true, tickets: true, avgOrderValue: true, events: false, popularItems: true, laborCost: true, foodCost: true, beverageCost: true },
  weekly: { revenue: true, tickets: true, avgOrderValue: true, events: false, popularItems: true, laborCost: true, foodCost: true, beverageCost: true },
}

const defaultSale: SaleConfig = {
  showAllModifiersByDefault: true, showSkipSeating: true, showNonMember: true,
  noticeEnabled: true, noticeMessage: 'Notice: short staffed in the Kitchen, longer than normal wait times for food items...',
  memberDiscounts: [{ value: 10, color: 'green' }, { value: 15, color: 'green' }, { value: 20, color: 'purple' }, { value: 25, color: 'red' }],
  nonMemberDiscounts: [{ value: 10, color: 'green' }, { value: 15, color: 'green' }, { value: 20, color: 'purple' }, { value: 25, color: 'red' }],
  nonMemberPriceIncrease: true, nonMemberPriceIncreasePercent: 10,
  autoGroupOrders: true, autoGroupMinutes: 3,
}

const defaultRsvp: RsvpConfig = { allowGuestOverride: true, showTablesOption: true, allowAllDayMenu: true, allowSocialLunch: true, allowMixed: true }

const TABS = ['Stats', 'Sale', 'RSVP', 'Display', 'Filter', 'Log'] as const
type Tab = (typeof TABS)[number]

function GreenCheck({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-emerald-500' : 'bg-neutral-700'}`}>
      {checked && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-neutral-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  )
}

function SectionRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <GreenCheck checked={checked} onChange={onChange} />
      <span className="text-sm text-white/80">{label}</span>
    </div>
  )
}

const CHIP_COLORS: Record<string, string> = { green: 'bg-emerald-600', purple: 'bg-purple-600', red: 'bg-red-600' }

function DiscountChip({ tier }: { tier: DiscountTier }) {
  return (
    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${CHIP_COLORS[tier.color] ?? 'bg-neutral-600'}`}>
      <span className="opacity-70 text-xs">x</span><span>{tier.value}</span><span className="text-white/60 ml-1">Discount</span>
    </div>
  )
}

function StatsTab({ cfg, onChange }: { cfg: StatsConfig; onChange: (c: StatsConfig) => void }) {
  const dailyItems: [keyof StatsConfig['daily'], string][] = [['revenue','Daily Revenue'],['tickets','Number of Tickets'],['avgOrderValue','Average Order Value'],['events','Daily Events'],['popularItems','Popular Items'],['laborCost','Labor Cost'],['foodCost','Food Cost'],['beverageCost','Beverage Cost']]
  const weeklyItems: [keyof StatsConfig['weekly'], string][] = [['revenue','Weekly Revenue'],['tickets','Number of Tickets'],['avgOrderValue','Average Order Value'],['events','Weekly Events'],['popularItems','Popular Items'],['laborCost','Labor Cost'],['foodCost','Food Cost'],['beverageCost','Beverage Cost']]
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold mb-0.5">Daily Statistics</h3>
        <p className="text-xs text-white/50 mb-3">Choose which Stats to display on the Dashboard</p>
        <div className="space-y-1">{dailyItems.map(([k,l]) => <SectionRow key={k} label={l} checked={cfg.daily[k]} onChange={v => onChange({...cfg, daily:{...cfg.daily,[k]:v}})} />)}</div>
      </div>
      <div>
        <h3 className="text-base font-semibold mb-0.5">Weekly Statistics</h3>
        <p className="text-xs text-white/50 mb-3">Choose which Stats to display on the Dashboard</p>
        <div className="space-y-1">{weeklyItems.map(([k,l]) => <SectionRow key={k} label={l} checked={cfg.weekly[k]} onChange={v => onChange({...cfg, weekly:{...cfg.weekly,[k]:v}})} />)}</div>
      </div>
    </div>
  )
}

function SaleTab({ cfg, onChange }: { cfg: SaleConfig; onChange: (c: SaleConfig) => void }) {
  function set<K extends keyof SaleConfig>(k: K, v: SaleConfig[K]) { onChange({...cfg,[k]:v}) }
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold mb-0.5">Sales</h3>
        <p className="text-xs text-white/50 mb-4">Choose options to display at the top of the Sale screen</p>
        <div className="space-y-3">
          {([['showAllModifiersByDefault','Show all Modifiers by default when adding an item to the Order Summary'],['showSkipSeating',"Display 'Skip Seating' option for faster order processing"],['showNonMember',"Display 'Non-Member' option for billing without an account"]] as [keyof SaleConfig, string][]).map(([k,l]) => (
            <div key={k} className="flex items-center gap-3"><Toggle checked={cfg[k] as boolean} onChange={v => set(k,v)} /><span className="text-sm text-white/80">{l}</span></div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold mb-0.5">Options</h3>
        <p className="text-xs text-white/50 mb-4">Make adjustments to saved settings in the Sale screen</p>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <GreenCheck checked={cfg.noticeEnabled} onChange={v => set('noticeEnabled',v)} />
            <div className="flex-1 space-y-2">
              <span className="text-sm text-white/80">Display a &apos;Notice&apos; message at the top middle of the Sale screen</span>
              {cfg.noticeEnabled && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-500/50 bg-orange-500/10">
                  <span className="text-orange-400">⚠</span>
                  <input value={cfg.noticeMessage} onChange={e => set('noticeMessage',e.target.value)} className="flex-1 bg-transparent text-sm text-orange-300 outline-none" placeholder="Enter notice..." />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GreenCheck checked={true} onChange={() => {}} />
            <div className="flex-1 space-y-2">
              <span className="text-sm text-white/80">Allow standard discount tiers for Members</span>
              <div className="flex flex-wrap gap-2">{cfg.memberDiscounts.map((t,i) => <DiscountChip key={i} tier={t} />)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GreenCheck checked={true} onChange={() => {}} />
            <div className="flex-1 space-y-2">
              <span className="text-sm text-white/80">Allow standard discount tiers for Non-Members</span>
              <div className="flex flex-wrap gap-2">{cfg.nonMemberDiscounts.map((t,i) => <DiscountChip key={i} tier={t} />)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GreenCheck checked={cfg.nonMemberPriceIncrease} onChange={v => set('nonMemberPriceIncrease',v)} />
            <div className="flex-1 space-y-2">
              <span className="text-sm text-white/80">Allow &apos;Non-Member&apos; standard price increase</span>
              {cfg.nonMemberPriceIncrease && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-sm font-medium w-fit">
                  <span className="opacity-70 text-xs">x</span>
                  <input type="number" value={cfg.nonMemberPriceIncreasePercent} onChange={e => set('nonMemberPriceIncreasePercent',Number(e.target.value))} className="w-8 bg-transparent outline-none text-center" />
                  <span className="text-white/70">Increase</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GreenCheck checked={cfg.autoGroupOrders} onChange={v => set('autoGroupOrders',v)} />
            <div className="flex-1 space-y-2">
              <span className="text-sm text-white/80">Automatically group orders from the same person into one ticket within a specified time</span>
              {cfg.autoGroupOrders && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-700 text-sm font-medium w-fit">
                  <input type="number" value={cfg.autoGroupMinutes} onChange={e => set('autoGroupMinutes',Number(e.target.value))} className="w-8 bg-transparent outline-none text-center text-white" />
                  <span className="text-white/70">Minutes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RsvpTab({ cfg, onChange }: { cfg: RsvpConfig; onChange: (c: RsvpConfig) => void }) {
  function set<K extends keyof RsvpConfig>(k: K, v: RsvpConfig[K]) { onChange({...cfg,[k]:v}) }
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold mb-0.5">Reservations</h3>
        <p className="text-xs text-white/50 mb-4">Choose how to handle options for Reservations</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><Toggle checked={cfg.allowGuestOverride} onChange={v => set('allowGuestOverride',v)} /><span className="text-sm text-white/80">Allow &apos;Guest&apos; override for new Reservations</span></div>
          <div className="flex items-center gap-3"><Toggle checked={cfg.showTablesOption} onChange={v => set('showTablesOption',v)} /><span className="text-sm text-white/80">Show &apos;Tables&apos; option for seating assignment for Reservations</span></div>
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold mb-0.5">Options</h3>
        <p className="text-xs text-white/50 mb-4">Allow different Reservation types</p>
        <div className="space-y-1">
          <SectionRow label="All-Day Menu" checked={cfg.allowAllDayMenu} onChange={v => set('allowAllDayMenu',v)} />
          <SectionRow label="Social Lunch" checked={cfg.allowSocialLunch} onChange={v => set('allowSocialLunch',v)} />
          <SectionRow label="Mixed" checked={cfg.allowMixed} onChange={v => set('allowMixed',v)} />
        </div>
      </div>
    </div>
  )
}

const NAV_PAGES = [
  { label: 'Users',     href: '/admin/users' },
  { label: 'Members',   href: '/admin/members' },
  { label: 'Locations', href: '/admin/locations' },
  { label: 'Tables',    href: '/admin/tables' },
  { label: 'Menu',      href: '/admin/menu' },
] as const

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>('Stats')
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [statsConfig, setStatsConfig] = React.useState<StatsConfig>(defaultStats)
  const [saleConfig, setSaleConfig] = React.useState<SaleConfig>(defaultSale)
  const [rsvpConfig, setRsvpConfig] = React.useState<RsvpConfig>(defaultRsvp)

  React.useEffect(() => {
    void fetch('/api/admin/settings').then(r => r.json()).then((data: { ok: boolean; settings?: LocationSettings }) => {
      if (data.ok && data.settings) {
        // Merge with defaults so missing keys don't cause undefined errors
        const loaded = data.settings.statsConfig as Partial<StatsConfig> | null
        if (loaded) {
          setStatsConfig({
            daily:  { ...defaultStats.daily,  ...(loaded.daily  ?? {}) },
            weekly: { ...defaultStats.weekly, ...(loaded.weekly ?? {}) },
          })
        }
        if (data.settings.saleConfig) {
          const s = data.settings.saleConfig as Partial<SaleConfig>
          setSaleConfig({
            ...defaultSale,
            ...s,
            memberDiscounts:    Array.isArray(s.memberDiscounts)    ? s.memberDiscounts    : defaultSale.memberDiscounts,
            nonMemberDiscounts: Array.isArray(s.nonMemberDiscounts) ? s.nonMemberDiscounts : defaultSale.nonMemberDiscounts,
          })
        }
        if (data.settings.rsvpConfig) {
          setRsvpConfig({ ...defaultRsvp, ...(data.settings.rsvpConfig as Partial<RsvpConfig>) })
        }
      }
    }).catch(() => {})
  }, [])

  async function handleSave() {
    try {
      setSaving(true)
      setSaveError(null)
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statsConfig, saleConfig, rsvpConfig }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) {
        setSaveError(data.error ?? 'Failed to save')
        setTimeout(() => setSaveError(null), 4000)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      setSaveError('Network error')
      setTimeout(() => setSaveError(null), 4000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
        </div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <div className="ml-auto flex items-center gap-3">
          {saved      && <span className="text-xs text-emerald-400">Saved!</span>}
          {saveError  && <span className="text-xs text-red-400">{saveError}</span>}
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm transition">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
      <div className="px-6 pt-4 pb-0 border-b border-white/10">
        <div className="flex gap-1 bg-neutral-900 rounded-lg p-1 w-fit">
          {TABS.map(tab => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm transition ${activeTab === tab ? 'bg-neutral-700 text-white font-medium' : 'text-white/50 hover:text-white/80'}`}>{tab}</button>
          ))}
          <div className="w-px bg-white/10 mx-1 self-stretch" />
          {NAV_PAGES.map(page => (
            <Link key={page.href} href={page.href}
              className="px-4 py-1.5 rounded-md text-sm text-white/50 hover:text-white/80 hover:bg-neutral-800 transition">
              {page.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="px-6 py-6 max-w-2xl">
        {activeTab === 'Stats' && <StatsTab cfg={statsConfig} onChange={setStatsConfig} />}
        {activeTab === 'Sale' && <SaleTab cfg={saleConfig} onChange={setSaleConfig} />}
        {activeTab === 'RSVP' && <RsvpTab cfg={rsvpConfig} onChange={setRsvpConfig} />}
        {!['Stats','Sale','RSVP'].includes(activeTab) && <div className="flex items-center justify-center py-20 text-white/30 text-sm">{activeTab} settings coming soon</div>}
      </div>
    </div>
  )
}