import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import Wordmark from '../components/brand/Wordmark'

export default function Privacy() {
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

        <h1 className="mb-1 mt-7 font-display text-4xl font-extrabold tracking-[-0.02em]">Privacy Policy</h1>
        <p className="mb-10 text-sm text-text-muted">Last updated: [DATE] · <Link to="/terms" className="text-accent-2 no-underline">Terms of Use</Link></p>

        <div className="prose-brand space-y-8 text-[15.5px] leading-[1.7] text-text-secondary">

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">What we collect and why</h2>
            <p>When you get on the list, RSVP to a gathering, or interact with this site, we may collect:</p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5">
              <li><strong className="font-semibold text-text-primary">Name</strong> — so we know to set a place for you.</li>
              <li><strong className="font-semibold text-text-primary">Email address</strong> — to send invitations and gathering updates.</li>
              <li><strong className="font-semibold text-text-primary">Phone number</strong> — only when you opt in to SMS, to send gathering invitations and event reminders.</li>
              <li><strong className="font-semibold text-text-primary">RSVP responses</strong> (yes / maybe / can't make it) and guest count — to help us plan.</li>
              <li><strong className="font-semibold text-text-primary">Device identifier</strong> — a random ID stored in your browser so you can update your RSVP without an account.</li>
            </ul>
            <p className="mt-4">We don't collect payment information, and we don't require you to create an account.</p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">SMS program disclosures</h2>
            <p>
              <strong className="font-semibold text-text-primary">Program:</strong> Black Cafe @ Marly's Yard sends gathering invitations and event updates via SMS to subscribers who have opted in.
            </p>
            <p className="mt-3">
              By providing your mobile number and checking the SMS opt-in box, you agree to receive text messages from Black Cafe @ Marly's Yard, including gathering invitations and day-of updates.
            </p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5">
              <li><strong className="font-semibold text-text-primary">Message frequency:</strong> Message frequency varies. You may receive messages before each gathering.</li>
              <li><strong className="font-semibold text-text-primary">Rates:</strong> Message and data rates may apply depending on your carrier and plan.</li>
              <li><strong className="font-semibold text-text-primary">Opt out:</strong> Reply <strong className="font-semibold text-text-primary">STOP</strong> at any time to unsubscribe. You will receive a confirmation and no further messages.</li>
              <li><strong className="font-semibold text-text-primary">Help:</strong> Reply <strong className="font-semibold text-text-primary">HELP</strong> for help. You can also contact us at [EMAIL].</li>
              <li><strong className="font-semibold text-text-primary">Supported carriers:</strong> Major US carriers are supported. Carriers are not liable for delayed or undelivered messages.</li>
            </ul>
            <p className="mt-3">Consent to receive SMS messages is not a condition of attendance or any purchase.</p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">How we use your information</h2>
            <p>We use your information only to:</p>
            <ul className="ml-5 mt-3 list-disc space-y-1.5">
              <li>Send gathering invitations and event updates (email or SMS, based on your preferences).</li>
              <li>Plan headcount and logistics for each event.</li>
              <li>Recognize your RSVP so you can update it later without logging in.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Data sharing</h2>
            <p>
              We do not sell, rent, or share your personal information with third parties for their own marketing purposes. Your data may be processed by our service providers (hosting, database, email delivery, and SMS delivery) solely to operate this service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Data retention</h2>
            <p>
              We retain your information as long as you remain on our list or have an active RSVP. You can ask to be removed at any time by contacting us at <a href="mailto:[EMAIL]" className="text-accent-2 no-underline">[EMAIL]</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-text-primary">Contact</h2>
            <p>
              Questions about this policy? Reach us at <a href="mailto:[EMAIL]" className="text-accent-2 no-underline">[EMAIL]</a>.
            </p>
          </section>

        </div>

        <div className="mt-12 border-t border-border pt-8 text-[13px] text-text-muted">
          <Link to="/terms" className="text-accent-2 no-underline">Terms of Use</Link>
          <span className="mx-3">·</span>
          <Link to="/" className="text-accent-2 no-underline">Back to the Yard</Link>
        </div>
      </div>
    </div>
  )
}
