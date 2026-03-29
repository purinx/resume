import { useEffect, useState } from 'react'
import type { CVData, Entry, Team, LabelValue } from './types'
import './App.css'

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} />
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
    <div className="lv-list">
      <div className="row-header">
        <span className="sub-label">{title}</span>
        <button className="btn-small" onClick={add}>+ 追加</button>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="lv-row">
          <input placeholder="ラベル" value={row.label} onChange={e => update(i, 'label', e.target.value)} />
          <input placeholder="値" value={row.value} onChange={e => update(i, 'value', e.target.value)} />
          <button className="btn-remove" onClick={() => remove(i)}>×</button>
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
    <div className="str-list">
      <div className="row-header">
        <span className="sub-label">{title}</span>
        <button className="btn-small" onClick={add}>+ 追加</button>
      </div>
      {lines.map((line, i) => (
        <div key={i} className="str-row">
          <textarea rows={2} value={line} onChange={e => update(i, e.target.value)} />
          <button className="btn-remove" onClick={() => remove(i)}>×</button>
        </div>
      ))}
    </div>
  )
}

function TeamEditor({ team, onChange, onRemove }: {
  team: Team
  onChange: (t: Team) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card">
      <div className="card-header">
        <button className="btn-toggle" onClick={() => setOpen(!open)}>
          {open ? '▼' : '▶'} {team.project || '(プロジェクト名未入力)'}
        </button>
        <button className="btn-remove" onClick={onRemove}>×</button>
      </div>
      {open && (
        <div className="card-body">
          <Field label="プロジェクト名" value={team.project} onChange={v => onChange({ ...team, project: v })} />
          <LabelValueList
            title="プロジェクト詳細"
            rows={team.detail ?? []}
            onChange={rows => onChange({ ...team, detail: rows })}
          />
          <StringList
            title="業務内容（1行1文）"
            lines={team.description}
            onChange={lines => onChange({ ...team, description: lines })}
          />
        </div>
      )}
    </div>
  )
}

function EntryEditor({ entry, onChange, onRemove }: {
  entry: Entry
  onChange: (e: Entry) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const label = entry.company?.name ?? entry.teams?.[0]?.name ?? '(未入力)'

  return (
    <div className="card">
      <div className="card-header">
        <button className="btn-toggle" onClick={() => setOpen(!open)}>
          {open ? '▼' : '▶'} {entry.date} {label}
        </button>
        <button className="btn-remove" onClick={onRemove}>×</button>
      </div>
      {open && (
        <div className="card-body">
          <Field label="日付" value={entry.date} onChange={v => onChange({ ...entry, date: v })} />

          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={!!entry.company}
                onChange={() => onChange({
                  ...entry,
                  company: entry.company ? undefined : { name: '', role: '' }
                })}
              />
              {' '}会社情報あり
            </label>
          </div>

          {entry.company && (
            <div className="indent">
              <Field
                label="会社名"
                value={entry.company.name}
                onChange={v => onChange({ ...entry, company: { ...entry.company!, name: v } })}
              />
              <Field
                label="役割（入社 / インターン 等）"
                value={entry.company.role}
                onChange={v => onChange({ ...entry, company: { ...entry.company!, role: v } })}
              />
              <div className="checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={!!entry.company.info}
                    onChange={() => onChange({
                      ...entry,
                      company: {
                        ...entry.company!,
                        info: entry.company?.info ? undefined : [{ label: '事業内容', value: '' }]
                      }
                    })}
                  />
                  {' '}会社情報テーブルあり
                </label>
              </div>
              {entry.company.info && (
                <LabelValueList
                  title="会社情報"
                  rows={entry.company.info}
                  onChange={rows => onChange({ ...entry, company: { ...entry.company!, info: rows } })}
                />
              )}
            </div>
          )}

          <div className="row-header" style={{ marginTop: 12 }}>
            <span className="sub-label">チーム</span>
            <button className="btn-small" onClick={() => onChange({
              ...entry,
              teams: [...(entry.teams ?? []), { project: '', detail: [], description: [] }]
            })}>+ チーム追加</button>
          </div>
          {(entry.teams ?? []).map((team, i) => (
            <TeamEditor
              key={i}
              team={team}
              onChange={t => onChange({ ...entry, teams: entry.teams!.map((x, idx) => idx === i ? t : x) })}
              onRemove={() => onChange({ ...entry, teams: entry.teams!.filter((_, idx) => idx !== i) })}
            />
          ))}

          <StringList
            title="エントリー直下の説明文（チームなし時）"
            lines={entry.description ?? []}
            onChange={lines => onChange({ ...entry, description: lines.length ? lines : undefined })}
          />
        </div>
      )}
    </div>
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

  if (!data) return <div className="loading">読み込み中...</div>

  return (
    <div className="app">
      <header className="app-header">
        <h1>職務経歴書エディター</h1>
        <div className="header-actions">
          {status && <span className="status">{status}</span>}
          <button className="btn" onClick={save}>保存</button>
          <button className="btn btn-primary" onClick={saveAndBuild}>保存 + ビルド</button>
        </div>
      </header>

      <div className="app-body">
        <section className="section">
          <h2>基本情報</h2>
          <Field label="タイトル" value={data.meta.title} onChange={v => setData({ ...data, meta: { ...data.meta, title: v } })} />
          <Field label="現在日付" value={data.meta.date} onChange={v => setData({ ...data, meta: { ...data.meta, date: v } })} />
          <Field label="氏名" value={data.meta.name} onChange={v => setData({ ...data, meta: { ...data.meta, name: v } })} />
          <Field label="肩書き" value={data.meta.role} onChange={v => setData({ ...data, meta: { ...data.meta, role: v } })} />
          <Field label="住所" value={data.meta.address} onChange={v => setData({ ...data, meta: { ...data.meta, address: v } })} />
          <Field label="メールアドレス" value={data.meta.email} onChange={v => setData({ ...data, meta: { ...data.meta, email: v } })} />
        </section>

        <section className="section">
          <h2>概要</h2>
          <div className="field">
            <textarea
              rows={8}
              value={data.summary}
              onChange={e => setData({ ...data, summary: e.target.value })}
            />
          </div>
        </section>

        <section className="section">
          <div className="section-title-row">
            <h2>職歴</h2>
            <button className="btn-small" onClick={() => setData({
              ...data,
              entries: [...data.entries, { date: '', teams: [] }]
            })}>+ エントリー追加</button>
          </div>
          {data.entries.map((entry, i) => (
            <EntryEditor
              key={i}
              entry={entry}
              onChange={e => setData({ ...data, entries: data.entries.map((x, idx) => idx === i ? e : x) })}
              onRemove={() => setData({ ...data, entries: data.entries.filter((_, idx) => idx !== i) })}
            />
          ))}
        </section>
      </div>
    </div>
  )
}
