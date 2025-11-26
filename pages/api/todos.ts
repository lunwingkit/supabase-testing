import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/schema'

type Todos = Database['public']['Tables']['todos']['Row']

type Data = {
  todos?: Todos[]
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase configuration missing' })
  }

  // Get the authorization token from the request headers
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  })

  if (req.method === 'GET') {
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ todos })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
