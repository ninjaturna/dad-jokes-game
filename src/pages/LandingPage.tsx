import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JOKES } from '../components/jokes'
import { useScrollReveal } from '../hooks/useScrollReveal'

const BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" }
const NUNITO: React.CSSProperties = { fontFamily: "'Nunito', sans-serif" }

export default function LandingPage() {
  const navigate = useNavigate()
  const [isFlipped, setIsFlipped] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [jokeIdx] = useState(() => Math.floor(Math.random() * JOKES.length))
  const joke = JOKES[jokeIdx]

  useScrollReveal()

  function handleJoin() {
    const code = joinCode.trim().toUpperCase()
    if (code.length > 0) navigate(`/join/${code}`)
  }

  return (
    <>
      {/* ── Global animation styles ── */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .word-1 { animation: slamIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.10s both; }
          .word-2 { animation: slamIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both; }
          .word-3 { animation: slamIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.26s both; }
          .word-4 { animation: slamIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.34s both; }
          .fade-in-sub { animation: fadeUp 0.5s ease 0.60s both; }
          .fade-in-cta { animation: fadeUp 0.5s ease 0.75s both; }
          .fade-in-friction { animation: fadeUp 0.5s ease 0.90s both; }
        }
        @keyframes slamIn {
          0%   { opacity: 0; transform: translateY(40px) scaleY(1.1); }
          60%  { transform: translateY(-4px) scaleY(0.98); }
          100% { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .fade-up {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .step-delay-0 { transition-delay: 0ms; }
        .step-delay-1 { transition-delay: 150ms; }
        .step-delay-2 { transition-delay: 300ms; }
        .joke-answer { animation: fadeIn 0.3s ease both; }
        .cta-btn {
          background: linear-gradient(135deg, #FFE500, #FF6B35);
          box-shadow: 0 8px 32px rgba(255, 229, 0, 0.25);
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .cta-btn:active {
          transform: scale(0.97);
          box-shadow: 0 4px 16px rgba(255, 229, 0, 0.2);
        }
      `}</style>

      {/* ──────────────────────────────────────────────────────────
          SECTION 1: HERO
      ────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '100svh',
          background: 'radial-gradient(ellipse at 50% 30%, #1a1a2e 0%, #0D0D12 65%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ghost emoji */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            fontSize: 'clamp(200px, 50vw, 320px)',
            opacity: 0.04,
            zIndex: 0,
            userSelect: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            lineHeight: 1,
          }}
        >
          😐
        </span>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', width: '100%' }}>
          {/* Pre-headline */}
          <p
            style={{
              ...NUNITO,
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: '#555',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Black Cafe Edition
          </p>

          {/* Main headline — staggered slam-in */}
          <div
            style={{
              ...BANGERS,
              fontSize: 'clamp(72px, 18vw, 120px)',
              lineHeight: 0.9,
              color: '#fff',
              letterSpacing: '0.02em',
            }}
          >
            <div className="word-1">CAN YOU</div>
            <div className="word-2">KEEP A</div>
            <div className="word-3">STRAIGHT</div>
            <div className="word-4">FACE?</div>
          </div>

          {/* Sub-headline */}
          <p
            className="fade-in-sub"
            style={{
              ...NUNITO,
              fontSize: '16px',
              color: '#888',
              maxWidth: '340px',
              lineHeight: 1.5,
              marginTop: '24px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            The party game where the whole room watches two people try not to crack.
          </p>

          {/* CTA */}
          <button
            className="cta-btn fade-in-cta"
            onClick={() => navigate('/play')}
            aria-label="Start a free game"
            style={{
              ...BANGERS,
              display: 'block',
              width: '100%',
              maxWidth: '360px',
              marginTop: '32px',
              marginLeft: 'auto',
              marginRight: 'auto',
              padding: '18px',
              borderRadius: '14px',
              border: 'none',
              color: '#000',
              fontSize: '24px',
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            START A GAME — IT'S FREE
          </button>

          {/* Friction removal */}
          <p
            className="fade-in-friction"
            style={{
              ...NUNITO,
              fontSize: '12px',
              color: '#444',
              marginTop: '12px',
            }}
          >
            No download. No account. Scan a QR code and you're in.
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 1.5: KEVIN HART VIDEO
      ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0D0D12',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* 16:9 responsive wrapper */}
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            aspectRatio: '16 / 9',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#000',
          }}
        >
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/ELN2rXqtwlQ?clip=UgkxizCsKAq1EKuHzfvPUWkEWnrZO0A7l5qt&clipt=EOC9Exjo4RQ&autoplay=1&mute=1&loop=1&playlist=ELN2rXqtwlQ&playsinline=1&rel=0"
            title="Kevin Hart playing Dad Jokes"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none', display: 'block' }}
          />
        </div>
        <p
          style={{
            ...NUNITO,
            fontSize: '13px',
            color: '#555',
            textAlign: 'center',
          }}
        >
          Kevin Hart couldn't hold it. Can you?
        </p>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2: THE STAKES
      ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#FFE500',
          padding: '48px 24px',
          textAlign: 'center',
          color: '#000',
        }}
      >
        <div
          style={{
            ...BANGERS,
            fontSize: 'clamp(96px, 25vw, 160px)',
            lineHeight: 0.85,
            letterSpacing: '0.02em',
          }}
        >
          493
        </div>
        <div
          style={{
            ...BANGERS,
            fontSize: 'clamp(48px, 12vw, 80px)',
            lineHeight: 0.9,
            letterSpacing: '0.02em',
            marginTop: '4px',
          }}
        >
          <div>JOKES.</div>
          <div>ZERO</div>
          <div>MERCY.</div>
        </div>
        <p
          style={{
            ...NUNITO,
            fontSize: '13px',
            color: '#333',
            marginTop: '16px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          The Black Cafe Edition deck. Curated. Tested. Dangerous.
        </p>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 3: HOW IT WORKS
      ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0D0D12',
          padding: '64px 24px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <p
            style={{
              ...NUNITO,
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: '#444',
              textTransform: 'uppercase',
            }}
          >
            The Rules
          </p>
          <h2
            style={{
              ...BANGERS,
              fontSize: 'clamp(28px, 7vw, 40px)',
              color: '#fff',
              margin: '16px 0 40px',
              lineHeight: 1.1,
              letterSpacing: '0.02em',
            }}
          >
            Simple enough to explain in 30 seconds.
            <br />Impossible not to laugh in 10.
          </h2>

          {/* Step cards */}
          {[
            {
              num: '01',
              label: 'CREATE A ROOM',
              body: "Host opens the game, shares a QR code or link. Everyone scans. No app needed. The whole room watches. Nobody's safe from the pressure.",
              accent: '#FFE500',
              delay: 'step-delay-0',
            },
            {
              num: '02',
              label: 'TELL THE JOKE',
              body: 'One player reads the setup. Flips the card for the punchline. The other player has to survive it.',
              accent: '#FFE500',
              delay: 'step-delay-1',
            },
            {
              num: '03',
              label: "DON'T. LAUGH.",
              body: "You laugh, you're out. Last one standing wins. It sounds easy. It isn't.",
              accent: '#FF2B2B',
              delay: 'step-delay-2',
            },
          ].map(({ num, label, body, accent, delay }) => (
            <div
              key={num}
              className={`fade-up ${delay}`}
              style={{
                background: '#111',
                borderRadius: '16px',
                borderLeft: `3px solid ${accent}`,
                padding: '20px 20px 20px 24px',
                marginBottom: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Watermark step number */}
              <span
                aria-hidden="true"
                style={{
                  ...BANGERS,
                  fontSize: '80px',
                  color: '#fff',
                  opacity: 0.06,
                  position: 'absolute',
                  right: '16px',
                  bottom: '-8px',
                  lineHeight: 1,
                  zIndex: 0,
                  userSelect: 'none',
                }}
              >
                {num}
              </span>
              <p
                style={{
                  ...BANGERS,
                  fontSize: '22px',
                  letterSpacing: '0.05em',
                  color: accent,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  ...NUNITO,
                  fontSize: '14px',
                  color: '#888',
                  lineHeight: 1.5,
                  marginTop: '6px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 4: INTERACTIVE JOKE PREVIEW
      ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0a0a10',
          padding: '64px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <p
            style={{
              ...NUNITO,
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: '#444',
              textTransform: 'uppercase',
            }}
          >
            Think You're Ready?
          </p>
          <h2
            style={{
              ...BANGERS,
              fontSize: 'clamp(36px, 9vw, 56px)',
              color: '#fff',
              margin: '8px 0 32px',
              letterSpacing: '0.02em',
            }}
          >
            Try one. On us.
          </h2>

          {/* Flip card */}
          <div
            onClick={() => setIsFlipped(true)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsFlipped(true)}
            tabIndex={0}
            role="button"
            aria-label={isFlipped ? 'Joke card — punchline revealed' : 'Tap to reveal the punchline'}
            style={{
              background: '#111',
              border: '2px solid #222',
              borderRadius: '20px',
              padding: '28px 24px',
              cursor: isFlipped ? 'default' : 'pointer',
              userSelect: 'none',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <p
              style={{
                ...NUNITO,
                fontSize: '18px',
                color: '#fff',
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              {joke.q}
            </p>
            {isFlipped ? (
              <p
                className="joke-answer"
                style={{
                  ...BANGERS,
                  fontSize: '22px',
                  color: '#FFE500',
                  letterSpacing: '0.03em',
                  borderTop: '1px solid #222',
                  paddingTop: '16px',
                  width: '100%',
                }}
              >
                {joke.a}
              </p>
            ) : (
              <p
                style={{
                  ...NUNITO,
                  fontSize: '13px',
                  color: '#444',
                  fontStyle: 'italic',
                }}
              >
                Tap to see if you'd survive.
              </p>
            )}
          </div>

          {/* Post-flip buttons */}
          {isFlipped && (
            <div
              className="joke-answer"
              style={{ marginTop: '20px' }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => navigate('/play')}
                  aria-label="I laughed — start a game"
                  style={{
                    ...BANGERS,
                    flex: 1,
                    background: '#FF2B2B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 8px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                  }}
                >
                  😂 I LAUGHED
                </button>
                <button
                  onClick={() => navigate('/play')}
                  aria-label="Held it — start a game"
                  style={{
                    ...BANGERS,
                    flex: 1,
                    background: '#FFE500',
                    color: '#000',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 8px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                  }}
                >
                  😐 HELD IT
                </button>
              </div>
              <p
                style={{
                  ...NUNITO,
                  fontSize: '13px',
                  color: '#555',
                  marginTop: '16px',
                }}
              >
                There are 492 more where that came from.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 5: MODES — informational only, no CTAs
      ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0D0D12',
          padding: '48px 24px',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2
            style={{
              ...BANGERS,
              fontSize: 'clamp(32px, 8vw, 48px)',
              color: '#fff',
              textAlign: 'center',
              marginBottom: '32px',
              letterSpacing: '0.02em',
            }}
          >
            PICK YOUR BATTLE
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {[
              {
                icon: '⚔️',
                label: 'HEAD TO HEAD',
                body: 'Two players. One joke deck. No teams. No hiding. No teammates to blame.',
              },
              {
                icon: '🏆',
                label: 'TEAM MODE',
                body: 'Build squads. Assign teams. Last team with survivors wins. More players to survive.',
              },
            ].map(({ icon, label, body }) => (
              <div
                key={label}
                className="fade-up"
                style={{
                  background: '#111',
                  border: '2px solid #222',
                  borderRadius: '16px',
                  padding: '24px',
                  flex: '1 1 240px',
                }}
              >
                <div style={{ fontSize: '40px', lineHeight: 1, marginBottom: '12px' }}>
                  {icon}
                </div>
                <p
                  style={{
                    ...BANGERS,
                    fontSize: '22px',
                    color: '#fff',
                    letterSpacing: '0.03em',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    ...NUNITO,
                    fontSize: '14px',
                    color: '#666',
                    marginTop: '8px',
                    lineHeight: 1.5,
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 6: FINAL CTA
      ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, #1a1a00 0%, #0D0D12 60%)',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <h2
            style={{
              ...BANGERS,
              fontSize: 'clamp(56px, 14vw, 88px)',
              lineHeight: 0.9,
              color: '#fff',
              letterSpacing: '0.02em',
            }}
          >
            YOUR GAME NIGHT
            <br />NEEDS THIS.
          </h2>

          <p
            style={{
              ...NUNITO,
              fontSize: '15px',
              color: '#666',
              marginTop: '16px',
            }}
          >
            Free. Mobile. Ready in 60 seconds.
          </p>

          {/* Create CTA */}
          <button
            className="cta-btn"
            onClick={() => navigate('/play')}
            aria-label="Create a free game room"
            style={{
              ...BANGERS,
              display: 'block',
              width: '100%',
              marginTop: '32px',
              padding: '18px',
              borderRadius: '14px',
              border: 'none',
              color: '#000',
              fontSize: '24px',
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            CREATE A ROOM — FREE
          </button>

          {/* Join row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '20px',
            }}
          >
            <p
              style={{
                ...NUNITO,
                fontSize: '13px',
                color: '#444',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Already have a code?
            </p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              maxLength={6}
              placeholder="ABCDEF"
              aria-label="Enter room code to join"
              style={{
                ...BANGERS,
                flex: 1,
                minWidth: 0,
                background: '#111',
                border: '2px solid #222',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '18px',
                letterSpacing: '0.1em',
                outline: 'none',
                textTransform: 'uppercase',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#FFE500')}
              onBlur={(e) => (e.target.style.borderColor = '#222')}
            />
            <button
              onClick={handleJoin}
              aria-label="Join room"
              style={{
                background: '#222',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#FFE500',
                fontSize: '18px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              →
            </button>
          </div>

          {/* Trust line */}
          <p
            style={{
              ...NUNITO,
              fontSize: '12px',
              color: '#333',
              marginTop: '24px',
            }}
          >
            493 jokes. Played at game nights everywhere. Free forever.
          </p>

          {/* Footer */}
          <div
            style={{
              ...NUNITO,
              fontSize: '11px',
              color: '#2a2a2a',
              marginTop: '48px',
              lineHeight: 1.8,
            }}
          >
            <p>Dad Jokes — Black Cafe Edition</p>
            <p>Jokes by Black Cafe</p>
          </div>
        </div>
      </section>
    </>
  )
}
