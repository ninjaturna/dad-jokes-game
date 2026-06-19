import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import Wordmark from '../components/brand/Wordmark'

export default function Terms() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      <div className="mx-auto max-w-[720px] px-6 pb-24 pt-8">
        {/* top bar */}
        <div className="mb-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 font-sans text-[13px] tracking-[0.04em] text-text-secondary no-underline">
            <span className="text-base">‹</span> the Yard
          </Link>
          <ThemeToggle />
        </div>

        <Wordmark variant="inline" iconSize={36} />

        <h1 className="mb-1 mt-7 font-display text-4xl font-extrabold tracking-[-0.02em]">Terms of Use</h1>
        <p className="mb-10 text-sm text-text-muted">Last updated: [DATE] · <Link to="/privacy" className="text-accent-2 no-underline">Privacy Policy</Link></p>

        <div className="space-y-8 text-[15.5px] leading-[1.7] text-text-secondary">

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">About this site</h2>
            <p>
              This site is operated by Black Cafe @ Marly's Yard ("we," "us"). By using it, you agree to these terms. If you don't agree, please don't use the site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Invitations and RSVPs</h2>
            <p>
              Gathering invitations are personal and non-transferable. An RSVP reserves a place for the person who submits it — you may not transfer, resell, or share your spot. We reserve the right to limit attendance and to decline or revoke access for any reason.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Acceptable use</h2>
            <p>When using this site, you agree not to:</p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5">
              <li>Submit false or misleading information.</li>
              <li>Attempt to circumvent RSVP limits or capacity controls.</li>
              <li>Scrape, crawl, or automate requests to this site.</li>
              <li>Use the site for any unlawful purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Event changes and cancellations</h2>
            <p>
              Gathering details (date, time, location, format) may change. We'll do our best to notify confirmed guests promptly, but we are not liable for any inconvenience caused by changes or cancellations.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Limitation of liability</h2>
            <p>
              This site and its content are provided "as is." To the fullest extent permitted by law, we disclaim all warranties and shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or attendance at any gathering.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Governing law</h2>
            <p>
              These terms are governed by the laws of the State of [STATE], without regard to conflict-of-law principles.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Changes to these terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the site after an update means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Contact</h2>
            <p>
              Questions? Reach us at <a href="mailto:[EMAIL]" className="text-accent-2 no-underline">[EMAIL]</a>.
            </p>
          </section>

        </div>

        <div className="mt-12 border-t border-border pt-8 text-[13px] text-text-muted">
          <Link to="/privacy" className="text-accent-2 no-underline">Privacy Policy</Link>
          <span className="mx-3">·</span>
          <Link to="/" className="text-accent-2 no-underline">Back to the Yard</Link>
        </div>
      </div>
    </div>
  )
}
