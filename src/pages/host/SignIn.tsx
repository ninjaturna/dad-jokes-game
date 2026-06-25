import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Crest from '../../components/brand/Crest'

const HOST_EMAIL = import.meta.env.VITE_HOST_EMAIL ?? ''

export default function SignIn() {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!pin.trim()) return
    setErr('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: HOST_EMAIL, password: pin })
    if (error) setErr('Incorrect code. Try again.')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-bg-page text-text-primary flex flex-col items-center justify-center gap-5 px-6 text-center">
      <Crest size={88} showWord={false} double={false} />
      <h1 className="font-display text-3xl font-light">Host access</h1>
      <div className="w-full max-w-[280px] flex flex-col gap-3">
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Access code"
          autoFocus
          className="w-full border border-border text-text-primary text-[18px] tracking-[0.3em] px-4 py-3.5 rounded-control outline-none text-center"
          style={{ background: 'var(--field)' }}
        />
        <button onClick={submit} disabled={!pin.trim() || loading}
          className="w-full bg-accent text-white font-bold py-3.5 rounded-control disabled:opacity-60">
          {loading ? 'Checking…' : 'Enter'}
        </button>
        {err && <p className="text-[13px]" style={{ color: 'var(--no)' }}>{err}</p>}
      </div>
    </main>
  )
}
