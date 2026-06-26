import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { getVenues, createVenue, updateVenue, deleteVenue, type Venue } from '../../lib/host'

export default function Venues() {
  const { user } = useAuth()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  // Add form
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [adding, setAdding] = useState(false)

  // Inline edit
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Two-step delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getVenues(user.id).then((vs) => { setVenues(vs); setLoading(false) })
  }, [user])

  async function handleAdd() {
    if (!user || !newName.trim()) return
    setAdding(true)
    try {
      const v = await createVenue(user.id, newName, newAddress)
      setVenues((prev) => [...prev, v].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName(''); setNewAddress('')
    } finally { setAdding(false) }
  }

  function startEdit(v: Venue) {
    setEditId(v.id); setEditName(v.name); setEditAddress(v.address ?? ''); setConfirmDeleteId(null)
  }

  async function handleSaveEdit() {
    if (!editId || !editName.trim()) return
    setSavingEdit(true)
    try {
      await updateVenue(editId, editName, editAddress)
      setVenues((prev) => prev.map((v) => v.id === editId
        ? { ...v, name: editName.trim(), address: editAddress.trim() || null } : v)
        .sort((a, b) => a.name.localeCompare(b.name)))
      setEditId(null)
    } finally { setSavingEdit(false) }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteVenue(id)
      setVenues((prev) => prev.filter((v) => v.id !== id))
      setConfirmDeleteId(null)
    } finally { setDeletingId(null) }
  }

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
          <span className="text-[13px] font-semibold">Venues</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-[760px] px-7 pt-8 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="text-[12px] tracking-[.2em] font-semibold mb-2 tabular" style={{ color: 'var(--text-muted)' }}>
            {venues.length} {venues.length === 1 ? 'VENUE' : 'VENUES'}
          </div>
          <h1 className="font-display font-extrabold text-[32px] tracking-[-0.02em] m-0">Address book</h1>
          <p className="text-[13.5px] mt-2 mb-0" style={{ color: 'var(--text-muted)' }}>
            Saved venues with addresses — pick them when creating or editing a gathering.
          </p>
        </div>

        {/* Add venue */}
        <section className="border border-border rounded-[14px] p-[22px] mb-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="font-display font-bold text-base mb-[14px]">Add a venue</div>
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Venue name (e.g. Pollack's Yard)" className={`${inp} mb-2.5`} style={fld} />
          <input value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Street address" className={`${inp} mb-3.5`} style={fld} />
          <button onClick={handleAdd} disabled={adding || !newName.trim()}
            className="text-white font-sans text-[14px] font-bold px-5 py-[11px] rounded-[8px] cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--accent)' }}>
            {adding ? 'Adding…' : 'Add venue'}
          </button>
        </section>

        {/* Venue list */}
        {loading ? null : venues.length === 0 ? (
          <p className="text-[14px] italic" style={{ color: 'var(--text-muted)' }}>
            No venues yet. Add your first one above.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {venues.map((v) => (
              <div key={v.id} className="border border-border rounded-[12px] p-4" style={{ background: 'var(--bg-surface)' }}>
                {editId === v.id ? (
                  <div>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)}
                      placeholder="Venue name" className={`${inp} mb-2.5`} style={fld} />
                    <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Street address" className={`${inp} mb-3`} style={fld} />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditId(null)}
                        className="font-sans text-[13px] font-semibold px-4 py-2 rounded-[8px] cursor-pointer"
                        style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}>
                        Cancel
                      </button>
                      <button onClick={handleSaveEdit} disabled={savingEdit || !editName.trim()}
                        className="text-white font-sans text-[13px] font-bold px-4 py-2 rounded-[8px] cursor-pointer disabled:opacity-50"
                        style={{ background: 'var(--accent)' }}>
                        {savingEdit ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-display font-bold text-[15.5px]">{v.name}</div>
                      <div className="text-[13.5px] mt-0.5" style={{ color: v.address ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {v.address || 'No address'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <button onClick={() => startEdit(v)}
                        className="font-sans text-[12.5px] font-semibold px-3 py-[7px] rounded-[8px] cursor-pointer"
                        style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}>
                        Edit
                      </button>
                      {confirmDeleteId === v.id ? (
                        <button onClick={() => handleDelete(v.id)} disabled={deletingId === v.id}
                          className="font-sans text-[12.5px] font-semibold px-3 py-[7px] rounded-[8px] cursor-pointer text-white disabled:opacity-50"
                          style={{ background: 'var(--accent)' }}>
                          {deletingId === v.id ? 'Deleting…' : 'Confirm'}
                        </button>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(v.id)}
                          className="font-sans text-[12.5px] font-semibold px-3 py-[7px] rounded-[8px] cursor-pointer"
                          style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)' }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
