'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function TestPage() {
  const test = async () => {
    const res = await fetch(`${API_URL}/test-login-cookie`, {
      method: 'POST',
      credentials: 'include',
    });

    alert(`STATUS ${res.status}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button onClick={test} className="rounded bg-black px-6 py-3 text-white">
        Test Login Cookie
      </button>
    </main>
  );
}
