'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { pinLoginRequest } from '@/modules/pos/lib/client/pin-login'

export default function PosLoginPage() {
  const router = useRouter()

  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (loading) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await pinLoginRequest({
        pin,
      })

      if (!result.ok) {
        setError(result.error || 'Login failed')
        return
      }

      router.push('/pos/tables' as Route)
    } catch (err) {
      console.error('POS login error', err)
      setError('Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <div className="w-full rounded-xl border p-6">
        <h1 className="text-2xl font-semibold">POS Login</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="pin" className="mb-2 block text-sm font-medium">
              PIN
            </label>

            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              autoComplete="off"
              inputMode="numeric"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border px-4 py-2 font-medium"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}