import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        }),
      { threshold: 0.15 },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
