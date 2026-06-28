import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type ServerFetchOptions = RequestInit & {
  revalidate?: number;
};

export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}): Promise<T> {
  const { revalidate = 0, headers, ...rest } = options;

  const cookieStore = await cookies();

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString(),
      ...headers,
    },
    cache: revalidate === 0 ? 'no-store' : 'force-cache',
    next: {
      revalidate,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}
