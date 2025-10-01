// Service Worker for Romanian-Danish Jobs PWA
const CACHE_NAME = 'romanian-danish-jobs-v1'
const OFFLINE_URL = '/offline'

// Resources to cache
const CACHE_RESOURCES = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell')
        return cache.addAll(CACHE_RESOURCES)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }

        // Clone the request for fetch and cache
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response for caching
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
          })
      })
  )
})

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event)

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'general',
    data: {
      url: '/'
    }
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        ...notificationData,
        ...data
      }
    } catch (e) {
      console.error('Error parsing push data:', e)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync operations
      handleBackgroundSync()
    )
  }
})

// Handle background sync operations
async function handleBackgroundSync() {
  try {
    // Sync offline job applications
    const offlineApplications = await getOfflineApplications()
    for (const application of offlineApplications) {
      await submitApplication(application)
    }

    // Sync offline interview responses
    const offlineResponses = await getOfflineResponses()
    for (const response of offlineResponses) {
      await submitResponse(response)
    }

    console.log('Background sync completed')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// IndexedDB helpers for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RomanianDanishJobsDB', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Applications store
      if (!db.objectStoreNames.contains('applications')) {
        const applicationsStore = db.createObjectStore('applications', { keyPath: 'id' })
        applicationsStore.createIndex('timestamp', 'timestamp')
      }

      // Responses store
      if (!db.objectStoreNames.contains('responses')) {
        const responsesStore = db.createObjectStore('responses', { keyPath: 'id' })
        responsesStore.createIndex('timestamp', 'timestamp')
      }
    }
  })
}

async function getOfflineApplications() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['applications'], 'readonly')
      const store = transaction.objectStore('applications')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  } catch (error) {
    console.error('Error getting offline applications:', error)
    return []
  }
}

async function submitApplication(application) {
  try {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application.data)
    })

    if (response.ok) {
      // Remove from offline storage
      const db = await openDB()
      const transaction = db.transaction(['applications'], 'readwrite')
      const store = transaction.objectStore('applications')
      store.delete(application.id)
    }
  } catch (error) {
    console.error('Error submitting application:', error)
  }
}

async function getOfflineResponses() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['responses'], 'readonly')
      const store = transaction.objectStore('responses')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  } catch (error) {
    console.error('Error getting offline responses:', error)
    return []
  }
}

async function submitResponse(response) {
  try {
    const responseData = await fetch('/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response.data)
    })

    if (responseData.ok) {
      // Remove from offline storage
      const db = await openDB()
      const transaction = db.transaction(['responses'], 'readwrite')
      const store = transaction.objectStore('responses')
      store.delete(response.id)
    }
  } catch (error) {
    console.error('Error submitting response:', error)
  }
}

// Periodic background sync for checking new jobs
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-new-jobs') {
    event.waitUntil(checkForNewJobs())
  }
})

async function checkForNewJobs() {
  try {
    // Check for new job matches
    const response = await fetch('/api/jobs?check_matches=true')
    const data = await response.json()

    if (data.newMatches && data.newMatches.length > 0) {
      // Show notification for new matches
      await self.registration.showNotification('New Job Matches!', {
        body: `You have ${data.newMatches.length} new job matches`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: { url: '/jobs/matches' }
      })
    }
  } catch (error) {
    console.error('Error checking for new jobs:', error)
  }
}
