'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function TestPage() {
  const test = async () => {
    await fetch(`${API_URL}/test-login-cookie`, {
      method: 'POST',
      credentials: 'include',
    });

    alert('Petición enviada');
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button onClick={test} className="rounded bg-black px-6 py-3 text-white">
        Test Login Cookie
      </button>
    </main>
  );
}
