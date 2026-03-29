import { useEffect, useState } from 'react'
import type { CVData, Entry, Team, LabelValue } from './types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react'

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function LabelValueList({ title, rows, onChange }: {
  title: string
  rows: LabelValue[]
  onChange: (rows: LabelValue[]) => void
}) {
  const update = (i: number, key: keyof LabelValue, val: string) =>
    onChange(rows.map((r, idx) => idx === i ? { ...r, [key]: val } : r))
  const add = () => onChange([...rows, { label: '', value: '' }])
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        <Button size="sm" variant="outline" onClick={add} className="h-6 px-2 text-xs gap-1">
          <Plus className="h-3 w-3" /> 追加
        </Button>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-start">
          <Input placeholder="ラベル" value={row.label} onChange={e => update(i, 'label', e.target.value)} className="max-w-[100px]" />
          <Input placeholder="値" value={row.value} onChange={e => update(i, 'value', e.target.value)} />
          <Button size="icon" variant="ghost" onClick={() => remove(i)} className="h-9 w-9 text-destructive hover:text-destructive shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

function StringList({ title, lines, onChange }: {
  title: string
  lines: string[]
  onChange: (lines: string[]) => void
}) {
  const update = (i: number, val: string) => onChange(lines.map((l, idx) => idx === i ? val : l))
  const add = () => onChange([...lines, ''])
  const remove = (i: number) => onChange(lines.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        <Button size="sm" variant="outline" onClick={add} className="h-6 px-2 text-xs gap-1">
          <Plus className="h-3 w-3" /> 追加
        </Button>
      </div>
      {lines.map((line, i) => (
        <div key={i} className="flex gap-2 items-start">
          <Textarea rows={2} value={line} onChange={e => update(i, e.target.value)} className="resize-y" />
          <Button size="icon" variant="ghost" onClick={() => remove(i)} className="h-9 w-9 text-destructive hover:text-destructive shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

function ProjectEditor({ team, onChange, onRemove }: {
  team: Team
  onChange: (t: Team) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-2">
        <CollapsibleTrigger className="flex items-center gap-2 text-base font-semibold flex-1 text-left min-w-0 cursor-pointer bg-transparent border-none text-white p-0">
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
          <span className="truncate">{team.project || '(プロジェクト名未入力)'}</span>
        </CollapsibleTrigger>
        <Button size="icon" variant="ghost" onClick={onRemove} className="h-8 w-8 text-red-300 hover:text-red-100 hover:bg-slate-700 shrink-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <CollapsibleContent className="p-3 space-y-3">
        <Field label="プロジェクト名" value={team.project} onChange={v => onChange({ ...team, project: v })} />
        <table className="w-full border-collapse text-sm">
          <tbody>
            {([
              { label: 'チーム人数', value: team.teamSize, onChange: (v: string) => onChange({ ...team, teamSize: v }) },
              { label: '担当業務',   value: team.tasks,    onChange: (v: string) => onChange({ ...team, tasks: v }) },
              { label: '技術スタック', value: team.stack,  onChange: (v: string) => onChange({ ...team, stack: v }) },
            ] as const).map(({ label, value, onChange: onCellChange }) => (
              <tr key={label} className="border-b last:border-b-0">
                <td className="py-2 pr-3 whitespace-nowrap text-xs font-medium text-muted-foreground w-24 align-middle">{label}</td>
                <td className="py-1.5">
                  <Input value={value} onChange={e => onCellChange(e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">業務内容</Label>
          <Textarea
            rows={6}
            value={team.description}
            onChange={e => onChange({ ...team, description: e.target.value })}
            className="resize-y"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function EntryEditor({ entry, onChange, onRemove }: {
  entry: Entry
  onChange: (e: Entry) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const label = entry.company?.name ?? entry.teams?.[0]?.project ?? '(未入力)'

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-2">
        <CollapsibleTrigger className="flex items-center gap-2 text-base font-semibold flex-1 text-left min-w-0 cursor-pointer bg-transparent border-none text-white p-0">
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
          <span className="truncate">{entry.date} {label}</span>
        </CollapsibleTrigger>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-100 hover:bg-slate-700 shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>職歴の削除</AlertDialogTitle>
              <AlertDialogDescription>
                「{entry.date} {label}」を削除します。よろしいですか？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove} className="bg-destructive text-white hover:bg-destructive/90">削除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <CollapsibleContent className="p-3 space-y-3">
        <Field label="日付" value={entry.date} onChange={v => onChange({ ...entry, date: v })} />

        <div className="pl-3 border-l-2 border-border space-y-3">
            <Field
              label="会社名"
              value={entry.company?.name ?? ''}
              onChange={v => onChange({ ...entry, company: { ...(entry.company ?? { name: '', role: '' }), name: v } })}
            />
            <Field
              label="役割（入社 / インターン 等）"
              value={entry.company?.role ?? ''}
              onChange={v => onChange({ ...entry, company: { ...(entry.company ?? { name: '', role: '' }), role: v } })}
            />
            <div className="flex items-center gap-2 text-sm">
              <Checkbox
                id={`info-${entry.date}`}
                checked={!!entry.company?.info}
                onCheckedChange={() => onChange({
                  ...entry,
                  company: {
                    ...(entry.company ?? { name: '', role: '' }),
                    info: entry.company?.info ? undefined : [
                      { label: '事業内容', value: '' },
                      { label: '資本金',   value: '' },
                      { label: '従業員数', value: '' },
                    ]
                  }
                })}
              />
              <label htmlFor={`info-${entry.date}`} className="cursor-pointer">会社情報テーブルあり</label>
            </div>
            {entry.company?.info && (
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {(['事業内容', '資本金', '従業員数'] as const).map(label => {
                    const row = entry.company!.info?.find(r => r.label === label)
                    const value = row?.value ?? ''
                    const updateInfo = (v: string) => {
                      const base = entry.company!.info ?? [
                        { label: '事業内容', value: '' },
                        { label: '資本金',   value: '' },
                        { label: '従業員数', value: '' },
                      ]
                      const next = base.some(r => r.label === label)
                        ? base.map(r => r.label === label ? { ...r, value: v } : r)
                        : [...base, { label, value: v }]
                      onChange({ ...entry, company: { ...entry.company!, info: next } })
                    }
                    return (
                      <tr key={label} className="border-b last:border-b-0">
                        <td className="py-2 pr-3 whitespace-nowrap text-xs font-medium text-muted-foreground w-24 align-middle">{label}</td>
                        <td className="py-1.5"><Input value={value} onChange={e => updateInfo(e.target.value)} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">エントリー直下の説明文（プロジェクトなし時）</Label>
          <Textarea
            rows={4}
            value={entry.description ?? ''}
            onChange={e => onChange({ ...entry, description: e.target.value || undefined })}
            className="resize-y"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-muted-foreground">プロジェクト</span>
          <Button size="sm" variant="outline" onClick={() => onChange({
            ...entry,
            teams: [...(entry.teams ?? []), { project: '', teamSize: '', tasks: '', stack: '', description: '' }]
          })} className="h-6 px-2 text-xs gap-1">
            <Plus className="h-3 w-3" /> プロジェクト追加
          </Button>
        </div>
        <div className="space-y-2">
          {(entry.teams ?? []).map((team, i) => (
            <ProjectEditor
              key={i}
              team={team}
              onChange={t => onChange({ ...entry, teams: entry.teams!.map((x, idx) => idx === i ? t : x) })}
              onRemove={() => onChange({ ...entry, teams: entry.teams!.filter((_, idx) => idx !== i) })}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function App() {
  const [data, setData] = useState<CVData | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])

  const save = async () => {
    setStatus('保存中...')
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2),
    })
    if (res.ok) setStatus('保存しました')
    else {
      const { error } = await res.json()
      setStatus(`エラー: ${error}`)
    }
  }

  const build = async () => {
    setStatus('ビルド中...')
    const res = await fetch('/api/build', { method: 'POST' })
    const json = await res.json()
    setStatus(res.ok ? `✓ ${json.message}` : `ビルドエラー: ${json.error}`)
  }

  const saveAndBuild = async () => { await save(); await build() }

  if (!data) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">読み込み中...</div>

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-50 bg-slate-900 text-white px-6 py-3 flex items-center justify-between gap-4">
        <h1 className="text-base font-bold">職務経歴書エディター</h1>
        <div className="flex items-center gap-2">
          {status && <span className="text-sm text-sky-300">{status}</span>}
          <Button onClick={saveAndBuild} className="bg-blue-600 hover:bg-blue-700 text-white">保存</Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-16 space-y-4">
        <section className="bg-white rounded-lg shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-bold border-b pb-2">基本情報</h2>
          <Field label="タイトル" value={data.meta.title} onChange={v => setData({ ...data, meta: { ...data.meta, title: v } })} />
          <Field label="現在日付" value={data.meta.date} onChange={v => setData({ ...data, meta: { ...data.meta, date: v } })} />
          <Field label="氏名" value={data.meta.name} onChange={v => setData({ ...data, meta: { ...data.meta, name: v } })} />
          <Field label="肩書き" value={data.meta.role} onChange={v => setData({ ...data, meta: { ...data.meta, role: v } })} />
          <Field label="住所" value={data.meta.address} onChange={v => setData({ ...data, meta: { ...data.meta, address: v } })} />
          <Field label="メールアドレス" value={data.meta.email} onChange={v => setData({ ...data, meta: { ...data.meta, email: v } })} />
        </section>

        <section className="bg-white rounded-lg shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-bold border-b pb-2">概要</h2>
          <Textarea
            rows={8}
            value={data.summary}
            onChange={e => setData({ ...data, summary: e.target.value })}
            className="resize-y"
          />
        </section>

        <section className="bg-white rounded-lg shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-sm font-bold">職歴</h2>
            <Button size="sm" variant="outline" onClick={() => setData({
              ...data,
              entries: [...data.entries, { date: '', teams: [] }]
            })} className="h-6 px-2 text-xs gap-1">
              <Plus className="h-3 w-3" /> エントリー追加
            </Button>
          </div>
          <div className="space-y-2">
            {data.entries.map((entry, i) => (
              <EntryEditor
                key={i}
                entry={entry}
                onChange={e => setData({ ...data, entries: data.entries.map((x, idx) => idx === i ? e : x) })}
                onRemove={() => setData({ ...data, entries: data.entries.filter((_, idx) => idx !== i) })}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
