type CrestProps = {
  size?: number
  ring?: string
  ringWidth?: number
  ink?: string
  accent?: string
  vine?: string
  leaf?: string
  top?: string
  double?: boolean
  showWord?: boolean
  className?: string
  title?: string
}

export default function Crest({
  size = 240,
  ring = '#A67244',
  ringWidth = 1.5,
  ink = '#F2E4D6',
  accent = '#C98A4E',
  vine = '#5DCAA5',
  leaf = '#3E8E72',
  top = 'BLACK CAFE',
  double = true,
  showWord = true,
  className,
  title = 'Black Cafe @ Marly’s Yard',
}: CrestProps) {
  return (
    <svg
      viewBox="0 0 240 256"
      width={size}
      height={(size * 256) / 240}
      className={className}
      role="img"
      aria-label={title}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <title>{title}</title>
      <circle cx="120" cy="116" r="96" fill="none" stroke={ring} strokeWidth={ringWidth} />
      {double && (
        <circle cx="120" cy="116" r="84.5" fill="none" stroke={ring} strokeWidth={0.75} opacity={0.5} />
      )}
      <g transform="translate(120,103)">
        <path d="M-26,-1 Q0,-28 26,-1" fill="none" stroke={vine} strokeWidth={1.75} strokeLinecap="round" />
        <ellipse cx="-17" cy="8" rx="3.4" ry="7.6" transform="rotate(-18 -17 8)" fill={vine} />
        <ellipse cx="0" cy="13" rx="3.5" ry="8.2" fill={vine} />
        <ellipse cx="17" cy="8" rx="3.4" ry="7.6" transform="rotate(18 17 8)" fill={vine} />
        <ellipse cx="-9" cy="4.5" rx="2.5" ry="5.8" transform="rotate(-22 -9 4.5)" fill={leaf} />
        <ellipse cx="9" cy="4.5" rx="2.5" ry="5.8" transform="rotate(22 9 4.5)" fill={leaf} />
      </g>
      {showWord && (
        <>
          {top && (
            <text x="120" y="61" textAnchor="middle" fill={accent}
              style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.3em' }}>
              {top}
            </text>
          )}
          <text x="120" y="158" textAnchor="middle" fill={ink}
            style={{ fontFamily: "'Archivo', sans-serif", fontSize: 25, fontWeight: 600, letterSpacing: '0.12em' }}>
            {'MARLY’S'}
          </text>
          <text x="124" y="182" textAnchor="middle" fill={accent}
            style={{ fontFamily: "'Archivo', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '0.5em' }}>
            YARD
          </text>
        </>
      )}
    </svg>
  )
}
