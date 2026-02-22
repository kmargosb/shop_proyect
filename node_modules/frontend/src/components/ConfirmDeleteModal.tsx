"use client"

import { useState } from "react"

type Props = {
  title?: string
  description?: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export default function ConfirmDeleteModal({
  title = "¿Eliminar elemento?",
  description = "Esta acción no se puede deshacer.",
  onConfirm,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-md space-y-4">

        <h2 className="text-lg font-semibold text-white">{title}</h2>

        <p className="text-sm text-gray-400">{description}</p>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 rounded-xl hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}
