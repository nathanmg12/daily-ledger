const webpush = require('web-push')
const { createClient } = require('@supabase/supabase-js')

webpush.setVapidDetails(
  'mailto:admin@thedailyledger.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function sendNotifications() {
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')

  if (error) {
    console.error('Error fetching subscriptions:', error)
    process.exit(1)
  }

  console.log(`Sending to ${subscriptions.length} subscribers...`)

  const payload = JSON.stringify({
    title: 'The Daily Ledger',
    body: 'Your Daily Ledger is ready.'
  })

  const results = await Promise.allSettled(
    subscriptions.map(({ subscription }) =>
      webpush.sendNotification(subscription, payload)
    )
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  console.log(`Done. ${succeeded} sent, ${failed} failed.`)
}

sendNotifications()