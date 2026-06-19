import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import {
  getContacts, addContact, getLists, createList, updateList, toggleListMember,
  getPendingRsvps, setRsvpStatus,
  type Contact, type ListWithMembers, type PendingRsvp,
} from '../../lib/guests'

const AVATAR_COLORS = ['#D96B43', '#5DCAA5', '#A67244', '#315955', '#590242', '#E0A867', '#A62F24']
const LIST_COLORS  = ['#D96B43', '#A62F24', '#5DCAA5', '#A67244', '#315955', '#590242', '#E0A867']

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
function avatarColor(i: number) { return AVATAR_COLORS[i % AVATAR_COLORS.length] }

type Tab = 'lists' | 'all' | 'pending'

function parseCSV(text: string): Array<{ name: string; email?: string; phone?: string }> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const first = lines[0]?.toLowerCase() ?? ''
  const hasHeader = first.includes('name') || first.includes('email') || first.includes('first')
  const dataLines = hasHeader ? lines.slice(1) : lines
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRe = /^[\d\s+\-()]{7,}$/
  return dataLines.flatMap((line) => {
    const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''))
    const [a, b, c] = parts
    if (!a) return []
    let name = a, email: string | undefined, phone: string | undefined
    if (b && emailRe.test(b)) { email = b; phone = c && phoneRe.test(c) ? c : undefined }
    else if (b && phoneRe.test(b)) { phone = b; email = c && emailRe.test(c) ? c : undefined }
    else if (b) { name = `${a} ${b}`.trim() }
    return [{ name, email, phone }]
  })
}

export default function Guests() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('lists')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [lists, setLists] = useState<ListWithMembers[]>([])
  const [pending, setPending] = useState<PendingRsvp[]>([])
  const [addListId, setAddListId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newSmsConsent, setNewSmsConsent] = useState(false)
  const [addingContact, setAddingContact] = useState(false)
  const [editListId, setEditListId] = useState<string | null>(null)
  const [editListName, setEditListName] = useState('')
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const [optimisticMembers, setOptimisticMembers] = useState<Record<string, Set<string>>>({})
  const csvInputRef = useRef<HTMLInputElement>(null)

  const reload = useCallback(async () => {
    if (!user) return
    const [cs, ls, ps] = await Promise.all([
      getContacts(user.id), getLists(user.id), getPendingRsvps(user.id),
    ])
    setContacts(cs); setLists(ls); setPending(ps)
  }, [user])
  useEffect(() => { void reload() }, [reload])

  async function handleAddContact() {
    if (!user || !newName.trim()) return
    setAddingContact(true)
    try {
      await addContact(user.id, { name: newName, email: newEmail || undefined, phone: newPhone || undefined, smsConsent: newSmsConsent })
      setNewName(''); setNewEmail(''); setNewPhone(''); setNewSmsConsent(false); setShowAddForm(false)
      await reload()
    } finally { setAddingContact(false) }
  }

  async function handleNewList() {
    if (!user) return
    const id = await createList(user.id, 'New list')
    await reload()
    setAddListId(id)
  }

  async function handleToggleMember(guestId: string, isMember: boolean) {
    if (!addListId || togglingIds.has(guestId)) return
    setTogglingIds((s) => new Set(s).add(guestId))
    setOptimisticMembers((prev) => {
      const next = { ...prev }
      const cur = new Set(next[addListId] ?? [])
      isMember ? cur.delete(guestId) : cur.add(guestId)
      next[addListId] = cur
      return next
    })
    try {
      await toggleListMember(addListId, guestId, isMember)
      await reload()
    } finally {
      setTogglingIds((s) => { const n = new Set(s); n.delete(guestId); return n })
      setOptimisticMembers((prev) => { const n = { ...prev }; delete n[addListId]; return n })
    }
  }

  async function handleRenameList(listId: string) {
    const name = editListName.trim()
    if (!name) { setEditListId(null); return }
    await updateList(listId, name)
    setEditListId(null)
    await reload()
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    e.target.value = ''
    setImportStatus('Importing…')
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (!rows.length) { setImportStatus('No contacts found in file.'); return }
      await Promise.all(rows.map((r) => addContact(user.id, r)))
      await reload()
      setImportStatus(`${rows.length} contact${rows.length === 1 ? '' : 's'} imported.`)
    } catch {
      setImportStatus('Import failed — check your CSV format.')
    }
    setTimeout(() => setImportStatus(null), 4000)
  }

  async function handleApprove(id: string) {
    await setRsvpStatus(id, 'confirmed')
    setPending((p) => p.filter((r) => r.id !== id))
  }
  async function handleDeny(id: string) {
    await setRsvpStatus(id, 'declined')
    setPending((p) => p.filter((r) => r.id !== id))
  }

  const addList = lists.find((l) => l.id === addListId)
  const tabStyle = (t: Tab) => ({
    background: tab === t ? 'var(--accent)' : 'transparent',
    color: tab === t ? '#fff' : 'var(--text-secondary)',
    border: 'none',
  })

  const fld: React.CSSProperties = { background: 'var(--field)' }
  const inp = 'w-full border border-border text-text-primary font-sans text-[14px] px-[13px] py-[11px] rounded-[8px] outline-none'

  return (
    <div className="min-h-screen text-text-primary" style={{ background: 'var(--bg-page)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border px-7 py-[14px]"
        style={{ background: 'color-mix(in srgb, var(--bg-page) 84%, transparent)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-3.5">
          <Link to="/host" className="flex items-center gap-1.5 text-text-secondary text-[13px] no-underline">
            <span className="text-base">‹</span> Dashboard
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span className="text-[13px] font-semibold">Guests</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-[920px] px-7 pt-8 pb-20">
        {/* Header */}
        <div className="flex items-start justify-between gap-5 flex-wrap mb-6">
          <div>
            <div className="text-[12px] tracking-[.2em] font-semibold mb-2 tabular" style={{ color: 'var(--text-muted)' }}>
              {contacts.length} CONTACTS · {lists.length} LISTS
            </div>
            <h1 className="font-display font-extrabold text-[32px] tracking-[-0.02em] m-0">Guest book</h1>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVImport} />
            <button onClick={() => csvInputRef.current?.click()}
              className="flex items-center gap-2 border border-border font-sans text-[13px] font-semibold px-4 py-[11px] rounded-[8px] cursor-pointer"
              style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>
              <span className="text-[15px]">↧</span> Import CSV
            </button>
            <button onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-2 border border-border text-text-primary font-sans text-[13px] font-semibold px-4 py-[11px] rounded-[8px] cursor-pointer"
              style={{ background: 'var(--bg-surface)' }}>
              + Add contact
            </button>
          </div>
        </div>

        {/* Import status */}
        {importStatus && (
          <div className="mb-4 text-[13px] font-semibold px-4 py-2.5 rounded-[8px]"
            style={{ background: 'color-mix(in srgb, var(--accent-2) 14%, transparent)', border: '1px solid var(--accent-2)', color: 'var(--accent-2)' }}>
            {importStatus}
          </div>
        )}

        {/* Add contact form */}
        {showAddForm && (
          <div className="mb-6 border border-border rounded-[12px] p-5" style={{ background: 'var(--bg-surface)' }}>
            <div className="font-display font-bold text-[15px] mb-4">New contact</div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Name *</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name" onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
                  className={inp} style={fld} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Email</label>
                <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email address" type="email" className={inp} style={fld} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-[7px]">Phone</label>
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Phone number" type="tel" className={inp} style={fld} />
              </div>
            </div>
            <label className="mb-3 flex cursor-pointer items-start gap-2.5">
              <input type="checkbox" checked={newSmsConsent} onChange={(e) => setNewSmsConsent(e.target.checked)}
                className="mt-0.5 flex-none accent-[var(--accent)]" />
              <span className="text-[12.5px] leading-[1.5] text-text-muted">
                I have their permission to text them about gatherings
              </span>
            </label>
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setShowAddForm(false)}
                className="border border-border text-text-secondary font-sans text-[13px] font-semibold px-4 py-2.5 rounded-[8px] cursor-pointer"
                style={{ background: 'transparent' }}>
                Cancel
              </button>
              <button onClick={handleAddContact} disabled={addingContact || !newName.trim()}
                className="text-white font-sans text-[13px] font-bold px-5 py-2.5 rounded-[8px] disabled:opacity-50 cursor-pointer"
                style={{ background: 'var(--accent)', border: 'none' }}>
                {addingContact ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border border-border rounded-[10px] p-1 mb-6 w-max" style={{ background: 'var(--bg-surface)' }}>
          {(['lists', 'all', 'pending'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex items-center gap-1.5 text-[13.5px] font-semibold px-[18px] py-[9px] rounded-[7px] cursor-pointer"
              style={tabStyle(t)}>
              {t === 'lists' ? 'Lists' : t === 'all' ? 'All contacts' : 'Pending'}
              {t === 'pending' && pending.length > 0 && (
                <span className="text-[11px] font-bold rounded-pill px-[7px] py-px tabular"
                  style={{ background: 'var(--accent)', color: '#fff' }}>
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LISTS TAB */}
        {tab === 'lists' && (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
            {lists.map((l, i) => {
              const color = LIST_COLORS[i % LIST_COLORS.length]
              const shown = l.members.slice(0, 4)
              const extra = l.members.length - shown.length
              const isEditing = editListId === l.id
              return (
                <div key={l.id} className="border border-border rounded-[14px] p-5"
                  style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-[11px] mb-[14px]">
                    <span className="flex-none w-3 h-3 rounded-[4px]" style={{ background: color }} />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editListName}
                        onChange={(e) => setEditListName(e.target.value)}
                        onBlur={() => handleRenameList(l.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameList(l.id)
                          if (e.key === 'Escape') setEditListId(null)
                        }}
                        className="font-display font-bold text-[17px] flex-1 min-w-0 bg-transparent border-b outline-none"
                        style={{ borderColor: color, color: 'var(--text-primary)' }}
                      />
                    ) : (
                      <button
                        onClick={() => { setEditListId(l.id); setEditListName(l.name) }}
                        className="font-display font-bold text-[17px] flex-1 min-w-0 truncate text-left bg-transparent border-none cursor-text p-0"
                        style={{ color: 'var(--text-primary)' }}
                        title="Click to rename">
                        {l.name}
                      </button>
                    )}
                    <span className="text-[12.5px] tabular whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{l.members.length} people</span>
                  </div>
                  <div className="flex mb-4 min-h-[30px]">
                    {shown.map((m, j) => (
                      <span key={m.id} className="w-[30px] h-[30px] rounded-full border-[2px] flex items-center justify-center font-display font-bold text-white text-[11px]"
                        style={{ background: avatarColor(j), borderColor: 'var(--bg-surface)', marginLeft: j ? -9 : 0 }}>
                        {initials(m.name)}
                      </span>
                    ))}
                    {extra > 0 && (
                      <span className="w-[30px] h-[30px] rounded-full border-[2px] flex items-center justify-center font-display font-bold text-[11px]"
                        style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--bg-surface)', marginLeft: -9, color: 'var(--text-muted)' }}>
                        +{extra}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to="/host"
                      className="flex-1 text-center text-white font-sans text-[13px] font-bold py-[10px] rounded-[8px] no-underline"
                      style={{ background: 'var(--accent)' }}>
                      Invite this list
                    </Link>
                    <button onClick={() => setAddListId(l.id)}
                      className="border border-border text-text-secondary font-sans text-[13px] font-semibold px-[14px] py-[10px] rounded-[8px] cursor-pointer whitespace-nowrap"
                      style={{ background: 'transparent' }}>
                      + Add
                    </button>
                  </div>
                </div>
              )
            })}
            <button onClick={handleNewList}
              className="flex flex-col items-center justify-center gap-2 text-text-secondary font-sans text-[14px] font-semibold cursor-pointer rounded-[14px]"
              style={{ minHeight: 150, background: 'transparent', border: '1px dashed var(--border)' }}>
              <span className="text-[26px] font-light leading-none">+</span>
              New list
            </button>
          </div>
        )}

        {/* ALL CONTACTS TAB */}
        {tab === 'all' && (
          contacts.length === 0 ? (
            <div className="text-center py-16 rounded-[14px]" style={{ border: '1px dashed var(--border)' }}>
              <div className="font-display font-bold text-xl mb-1.5">No contacts yet.</div>
              <div className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Click "Add contact" above to get started.</div>
            </div>
          ) : (
            <div className="border border-border rounded-[14px] overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
              {contacts.map((c, i) => {
                const chips = lists.filter((l) => l.members.some((m) => m.id === c.id))
                return (
                  <div key={c.id} className="flex items-center gap-[13px] px-[18px] py-[14px] border-b border-border last:border-b-0">
                    <span className="flex-none w-[38px] h-[38px] rounded-full flex items-center justify-center font-display font-bold text-white text-[14px]"
                      style={{ background: avatarColor(i) }}>
                      {initials(c.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold">{c.name}</div>
                      <div className="text-[12.5px]" style={{ color: 'var(--text-muted)' }}>{c.email ?? c.phone ?? ''}</div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end max-w-[300px]">
                      {chips.map((l, j) => (
                        <span key={l.id} className="text-[11px] font-semibold px-[10px] py-[3px] rounded-pill"
                          style={{ background: `color-mix(in srgb,${LIST_COLORS[j % LIST_COLORS.length]} 20%, transparent)`, color: 'var(--text-primary)' }}>
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* PENDING TAB */}
        {tab === 'pending' && (
          pending.length === 0 ? (
            <div className="text-center py-16 rounded-[14px]" style={{ border: '1px dashed var(--border)' }}>
              <div className="font-display font-bold text-xl mb-1.5">All caught up.</div>
              <div className="text-[14px]" style={{ color: 'var(--text-muted)' }}>No requests waiting on you.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[13.5px] text-text-secondary mb-0.5">
                RSVP requests via your shareable link — approve to add them to the guest list.
              </p>
              {pending.map((r, i) => (
                <div key={r.id} className="flex items-center gap-[15px] border border-border rounded-[12px] px-5 py-4"
                  style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)' }}>
                  <span className="flex-none w-[42px] h-[42px] rounded-full flex items-center justify-center font-display font-bold text-white text-[15px]"
                    style={{ background: avatarColor(i) }}>
                    {initials(r.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15.5px] font-semibold">{r.name}</div>
                    <div className="text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
                      {r.response}{r.plus_ones > 0 ? ` · +${r.plus_ones}` : ''} · {r.event_title}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(r.id)}
                      className="font-sans text-[13px] font-bold px-4 py-[9px] rounded-[8px] cursor-pointer"
                      style={{ background: 'color-mix(in srgb,var(--going) 18%, transparent)', border: '1px solid var(--going)', color: 'var(--going)' }}>
                      Approve
                    </button>
                    <button onClick={() => handleDeny(r.id)}
                      className="font-sans text-[13px] font-semibold px-4 py-[9px] rounded-[8px] cursor-pointer"
                      style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ADD-TO-LIST MODAL */}
      {addList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(15,1,3,.6)', backdropFilter: 'blur(3px)' }}
          onClick={() => setAddListId(null)}>
          <div className="w-full max-w-[440px] max-h-[80vh] flex flex-col border border-border rounded-[16px] overflow-hidden"
            style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="px-[22px] py-5 border-b border-border">
              <div className="text-[12px] tracking-[.04em] mb-1" style={{ color: 'var(--text-muted)' }}>Add contacts to</div>
              <div className="font-display font-bold text-[18px] flex items-center gap-[9px]">
                <span className="w-[11px] h-[11px] rounded-[3px]"
                  style={{ background: LIST_COLORS[lists.findIndex((l) => l.id === addListId) % LIST_COLORS.length] }} />
                {addList.name}
              </div>
            </div>
            <div className="overflow-auto p-[10px] flex flex-col gap-1.5 flex-1">
              {contacts.length === 0 ? (
                <p className="text-[13px] px-2 py-4" style={{ color: 'var(--text-muted)' }}>No contacts yet — add some first.</p>
              ) : contacts.map((c, i) => {
                const optimistic = optimisticMembers[addListId ?? '']
                const isMember = optimistic
                  ? optimistic.has(c.id)
                  : addList.members.some((m) => m.id === c.id)
                const isToggling = togglingIds.has(c.id)
                return (
                  <button key={c.id} onClick={() => handleToggleMember(c.id, isMember)}
                    disabled={isToggling}
                    className="flex items-center gap-3 text-left px-3 py-[10px] rounded-[10px] cursor-pointer disabled:opacity-60"
                    style={{ border: `1px solid ${isMember ? 'var(--accent-2)' : 'var(--border)'}`, background: isMember ? 'color-mix(in srgb,var(--accent-2) 12%, transparent)' : 'transparent' }}>
                    <span className="flex-none w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-white text-[12px]"
                      style={{ background: avatarColor(i) }}>
                      {initials(c.name)}
                    </span>
                    <span className="flex-1 text-[14px] font-semibold text-text-primary">{c.name}</span>
                    <span className="flex-none w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[13px] font-bold"
                      style={{ border: `1.5px solid ${isMember ? 'var(--accent-2)' : 'var(--border)'}`, background: isMember ? 'var(--accent-2)' : 'transparent', color: '#260306' }}>
                      {isToggling ? '…' : isMember ? '✓' : ''}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="px-[18px] py-4 border-t border-border">
              <button onClick={() => setAddListId(null)}
                className="w-full text-white font-sans text-[15px] font-bold py-[13px] rounded-[9px] cursor-pointer"
                style={{ background: 'var(--accent)', border: 'none' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
