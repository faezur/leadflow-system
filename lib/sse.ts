type SSEController = ReadableStreamDefaultController<Uint8Array>

const clients = new Set<SSEController>()

export function addClient(controller: SSEController) {
  clients.add(controller)
}

export function removeClient(controller: SSEController) {
  clients.delete(controller)
}

export function notifyClients(data: object) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(message)
  clients.forEach((controller) => {
    try {
      controller.enqueue(encoded)
    } catch {
      clients.delete(controller)
    }
  })
}