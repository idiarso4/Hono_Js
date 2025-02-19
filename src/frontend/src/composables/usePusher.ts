import Pusher from 'pusher-js'

export function usePusher() {
  const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    forceTLS: true
  })

  return pusher
}
