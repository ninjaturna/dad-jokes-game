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
  leaf: _leaf,
  top = 'BLACK CAFE',
  double = true,
  showWord = true,
  className,
  title = "Black Cafe @ Marly’s Yard",
}: CrestProps) {
  void _leaf
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
      {/* monogram motif — arc + three drops */}
      <g transform="translate(120,103)">
        <path d="M-26,-1 Q0,-28 26,-1" fill="none" stroke={vine} strokeWidth={1.75} strokeLinecap="round" />
        {/* left drop */}
        <path
          d="M0,-8 C2.5,-8 5.5,-5 5.5,-0.5 C5.5,5.5 2.5,8.5 0,8.5 C-2.5,8.5 -5.5,5.5 -5.5,-0.5 C-5.5,-5 -2.5,-8 0,-8Z"
          transform="translate(-17,9) rotate(-15 0 0)"
          fill={vine}
        />
        {/* center drop — slightly larger */}
        <path
          d="M0,-9 C3,-9 6.5,-5.5 6.5,0 C6.5,7 3.5,10.5 0,10.5 C-3.5,10.5 -6.5,7 -6.5,0 C-6.5,-5.5 -3,-9 0,-9Z"
          transform="translate(0,14)"
          fill={vine}
        />
        {/* right drop */}
        <path
          d="M0,-8 C2.5,-8 5.5,-5 5.5,-0.5 C5.5,5.5 2.5,8.5 0,8.5 C-2.5,8.5 -5.5,5.5 -5.5,-0.5 C-5.5,-5 -2.5,-8 0,-8Z"
          transform="translate(17,9) rotate(15 0 0)"
          fill={vine}
        />
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
