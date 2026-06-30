export const metadata = {
  title: 'Privacy Policy — The Daily Ledger',
}

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 400, marginBottom: '0.5rem' }}>
        Privacy <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Policy</em>
      </h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
        Last updated June 2026
      </p>
      <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <p style={{ marginBottom: '1.5rem' }}>
          The Daily Ledger ("we," "our," or "the app") is built to be a calm, focused product. This policy explains what information we collect, why we collect it, and how it's used. We keep this simple because our data collection is simple.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          What we collect
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          When you create an account, we collect your email address and a securely hashed password (we never see or store your password in plain text). When you select topics to follow, we store those preferences. As you use the app, we track which cards you've already seen so we don't show you the same content twice. If you save cards to your library, we store those saves so your library persists across sessions. If you enable push notifications, we store a unique browser-generated subscription token used solely to deliver your daily notification.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          How we use it
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Your email is used to authenticate your account and send essential service emails, like confirming your signup or resetting your password. Your topic preferences determine which cards appear in your daily ledger. Your reading history exists solely to prevent repeat content. We do not use your data for advertising, and we do not sell or share your data with third parties for marketing purposes.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Sharing cards
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          The app includes an optional feature to generate a shareable image of a card. This image is created locally on your device and is only shared if you choose to share it. We do not upload, store, or have access to any images you generate or share.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Push notifications
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          If you choose to enable push notifications, your browser generates a unique subscription token that is stored securely in our database. This token is used solely to deliver one daily notification when your feed is ready. We will never send more than one notification per day. You can disable notifications at any time from your settings page, which immediately removes your token from our system.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Where it's stored
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Your data is stored securely with Supabase, our database and authentication provider. Industry-standard security practices, including encryption and access controls, protect your information.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Your control over your data
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          You can update your topic preferences at any time from your settings page. You can remove any card from your library at any time. You can disable push notifications at any time from your settings page. If you'd like your account and associated data deleted entirely, contact us and we'll handle it promptly.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Changes to this policy
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          If this policy changes in a meaningful way, we'll update the date above and, where appropriate, notify active users.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Contact
        </h2>
        <p>
          Questions about this policy or your data? Reach out anytime at{' '}
          <a href="mailto:admin@thedailyledger.app" style={{ color: 'var(--accent)' }}>
            admin@thedailyledger.app
          </a>.
        </p>
      </div>
    </div>
  )
}