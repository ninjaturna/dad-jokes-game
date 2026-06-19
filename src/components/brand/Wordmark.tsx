import Crest from './Crest'

type WordmarkProps = {
  variant?: 'stacked' | 'inline'
  iconSize?: number
  className?: string
}

export default function Wordmark({ variant = 'stacked', iconSize = 40, className }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ''}`}>
      <Crest size={iconSize} showWord={false} double={false} ringWidth={1.25} />
      {variant === 'stacked' ? (
        <span className="flex flex-col leading-tight font-display font-bold tracking-[0.18em] text-text-primary whitespace-nowrap">
          <span className="text-[15px]">BLACK CAFE</span>
          <span className="text-[9.5px] tracking-[0.26em] font-semibold text-text-muted">{'@ MARLY’S YARD'}</span>
        </span>
      ) : (
        <span className="font-display font-bold text-[13px] tracking-[0.16em] text-text-primary whitespace-nowrap">
          BLACK CAFE <span className="text-text-muted">{'@ MARLY’S YARD'}</span>
        </span>
      )}
    </span>
  )
}
