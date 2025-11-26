import Head from 'next/head'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

type Todo = {
  id: number
  inserted_at: string
  is_complete: boolean | null
  task: string | null
  user_id: string
}

export default function TodosApi() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fetchTime, setFetchTime] = useState<number | null>(null)

  useEffect(() => {
    const fetchTodos = async () => {
      if (!session) {
        setError('Please log in to view todos')
        setLoading(false)
        return
      }

      try {
        const startTime = performance.now()
        
        // Get the session token and send it to the API
        const token = session.access_token
        const response = await fetch('/api/todos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()

        const endTime = performance.now()
        const duration = endTime - startTime
        setFetchTime(duration)

        if (data.error) {
          setError(data.error)
        } else {
          setTodos(data.todos || [])
        }
      } catch (err) {
        setError('Failed to fetch todos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [session])

  return (
    <>
      <Head>
        <title>Todos from API</title>
        <meta name="description" content="Todo list from API route" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full min-h-screen bg-200 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Todos from API</h1>
            <Link href="/" className="btn-black">
              Back to Home
            </Link>
          </div>

          {!session && (
            <div className="rounded-md bg-yellow-100 p-4 my-3">
              <div className="text-sm leading-5 text-yellow-700">
                Please <Link href="/" className="underline font-bold">log in</Link> to view todos.
              </div>
            </div>
          )}

          {loading && session && (
            <div className="text-center py-8">
              <p className="text-xl">Loading todos...</p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-100 p-4 my-3">
              <div className="text-sm leading-5 text-red-700">{error}</div>
            </div>
          )}

          {fetchTime !== null && (
            <div className="mb-4 p-3 bg-blue-100 rounded-md">
              <p className="text-sm text-blue-900">
                <strong>API route fetch time:</strong> {fetchTime.toFixed(2)}ms
              </p>
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white shadow overflow-hidden rounded-md">
              {todos.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No todos found. Add some todos from the home page!
                </div>
              ) : (
                <ul>
                  {todos.map((todo) => (
                    <li
                      key={todo.id}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="min-w-0 flex-1 flex items-center gap-4">
                          <span
                            className={`inline-block w-4 h-4 rounded border-2 ${
                              todo.is_complete
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {todo.is_complete && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="white"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </span>
                          <div className="text-sm leading-5 font-medium">
                            <span
                              className={
                                todo.is_complete ? 'line-through text-gray-400' : ''
                              }
                            >
                              {todo.task}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(todo.inserted_at).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This page fetches todos from the{' '}
              <code className="bg-blue-200 px-1 rounded">/api/todos</code> API route.
              The data is read-only on this page. Go to the home page to add or modify
              todos.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
