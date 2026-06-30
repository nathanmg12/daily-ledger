self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'The Daily Ledger'
  const options = {
    body: data.body || 'Your daily feed is ready.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'daily-ledger',
    renotify: false,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('https://thedailyledger.app/today')
  )
})