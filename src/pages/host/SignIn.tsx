import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Crest from '../../components/brand/Crest'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  async function send() {
    setErr('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/host` },
    })
    if (error) setErr(error.message)
    else setSent(true)
  }
  return (
    <main className="min-h-screen bg-bg-page text-text-primary flex flex-col items-center justify-center gap-5 px-6 text-center">
      <Crest size={88} showWord={false} double={false} />
      <h1 className="font-display text-3xl font-light">Host sign in</h1>
      {sent ? (
        <p className="font-sans text-text-secondary max-w-sm">Check your email — we sent a sign-in link to <span className="text-text-primary">{email}</span>.</p>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@blackcafe.miami"
            className="w-full border border-border text-text-primary text-[15px] px-4 py-3.5 rounded-control outline-none" style={{ background: 'var(--field)' }} />
          <button onClick={send} disabled={!email.trim()} className="w-full bg-accent text-white font-bold py-3.5 rounded-control disabled:opacity-60">Email me a link</button>
          {err && <p className="text-danger text-sm">{err}</p>}
        </div>
      )}
    </main>
  )
}
