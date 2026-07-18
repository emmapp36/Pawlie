import type { ChatStreamEvent, Pet } from '@pawlie/domain';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiRequestError(response.status, body?.message ?? response.statusText);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  pets: {
    list: (householdId: string) =>
      request<Pet[]>(`/pets?householdId=${encodeURIComponent(householdId)}`),
    get: (id: string) => request<Pet>(`/pets/${id}`),
  },

  async *chat(
    petId: string,
    message: string,
    conversationId?: string,
  ): AsyncGenerator<ChatStreamEvent> {
    const response = await fetch(`${API_BASE}/pets/${petId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId }),
    });
    if (!response.ok || !response.body) {
      throw new ApiRequestError(response.status, 'Chat stream failed to open');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = frame
          .split('\n')
          .find((line) => line.startsWith('data: '))
          ?.slice(6);
        if (data) yield JSON.parse(data) as ChatStreamEvent;
      }
    }
  },
};

export { ApiRequestError };
