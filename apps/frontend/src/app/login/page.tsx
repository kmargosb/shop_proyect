"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!API_URL) {
      toast.error("API no configurada")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (res.status === 429) {
        toast.error("Demasiados intentos. Espera antes de volver a intentar.")
        return
      }

      if (res.status === 401) {
        toast.error("Credenciales inválidas")
        return
      }

      if (!res.ok) {
        toast.error("Error inesperado")
        return
      }

      router.push("/admin")
    } catch (error) {
      console.error(error)
      toast.error("Servidor no disponible")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-80 bg-gray-900 p-6 rounded-2xl shadow-xl"
      >
        <h1 className="text-xl font-semibold text-center">Iniciar sesión</h1>

        <input
          type="email"
          placeholder="Email"
          className="bg-gray-800 border border-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="bg-gray-800 border border-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className={`p-2 rounded-lg transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {loading ? "Entrando..." : "Login"}
        </button>
      </form>
    </div>
  )
}