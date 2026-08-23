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
        Last updated August 2026
      </p>
      <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <p style={{ marginBottom: '1.5rem' }}>
          The Daily Ledger ("we," "our," or "the app") is built to be a calm, focused product. This policy explains what information we collect, why we collect it, and how it's used. We keep this simple because our data collection is simple.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          What we collect
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          When you create an account, we collect your email address and a securely hashed password (we never see or store your password in plain text). When you select topics to follow, we store those preferences. As you read, we record which cards you have been shown, so a card is not repeated for at least 45 days. We also record which days you open the app, which is how we tell whether the product is actually being read. If you save cards to your library, we store those saves so your library persists across sessions. If you enable push notifications, we store a unique browser-generated subscription token used solely to deliver your daily notification.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          How we use it
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Your email is used to authenticate your account and send essential service emails, like confirming your signup or resetting your password. Your topic preferences determine which cards appear in your daily ledger. Your reading history is used to space out repeats, and the record of which days you opened the app tells us whether people are reading. Neither is used to rank, personalise, or optimise what you see, because nothing here is ranked. We do not use your data for advertising, and we do not sell or share your data with third parties for marketing purposes.
        </p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Sharing cards
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          There are two optional ways to share a card, and they work differently.
          Images you generate to post or send are created on your device. We never upload them,
          store them, or see them.
          Copying a share link is different: we store a short record linking that address to the card,
          and a preview image of the card so the link displays properly when you paste it somewhere.
          Both are public to anyone who has the address, which is what makes a shared link work.
          They contain card content only, never your email, your topics, your reading history, or
          anything else about you.
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