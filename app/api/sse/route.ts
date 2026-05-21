import { addClient, removeClient } from '@/lib/sse'

export const dynamic = 'force-dynamic'

export async function GET() {
  let controller: ReadableStreamDefaultController<Uint8Array>

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl
      addClient(ctrl)

      // Send initial ping
      const ping = new TextEncoder().encode(': connected\n\n')
      ctrl.enqueue(ping)
    },
    cancel() {
      removeClient(controller)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}