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
  vine: _vine,
  leaf: _leaf,
  top = 'BLACK CAFE',
  double = true,
  showWord = true,
  className,
  title = "Black Cafe @ Marly’s Yard",
}: CrestProps) {
  void _vine; void _leaf
  return (
    <svg
      viewBox={showWord ? '0 0 240 256' : '0 16 240 200'}
      width={size}
      height={showWord ? (size * 256) / 240 : (size * 200) / 240}
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
      {/* BC monogram — B in ink, C in accent */}
      <text x="120" y={showWord ? 128 : 140} textAnchor="middle"
        style={{ fontFamily: "'Archivo', sans-serif", fontSize: showWord ? 60 : 72, fontWeight: 900, letterSpacing: '-0.02em' }}>
        <tspan fill={ink}>B</tspan><tspan fill={accent}>C</tspan>
      </text>
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
            {"MARLY’S"}
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
