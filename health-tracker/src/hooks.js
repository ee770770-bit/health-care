import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// Generic hook for a Supabase table
export function useTable(table, userId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    supabase.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: false })
      .then(({ data: rows }) => { setData(rows || []); setLoading(false) })

    // Real-time subscription
    const sub = supabase.channel(`${table}-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
        () => {
          supabase.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: false })
            .then(({ data: rows }) => setData(rows || []))
        })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [table, userId])

  const insert = async (row) => {
    const { data: inserted, error } = await supabase.from(table).insert({ ...row, user_id: userId }).select().single()
    if (!error) setData(d => [inserted, ...d])
    return { data: inserted, error }
  }

  const update = async (id, changes) => {
    const { data: updated, error } = await supabase.from(table).update(changes).eq('id', id).select().single()
    if (!error) setData(d => d.map(r => r.id === id ? updated : r))
    return { data: updated, error }
  }

  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) setData(d => d.filter(r => r.id !== id))
    return { error }
  }

  return { data, loading, insert, update, remove, setData }
}

// Auth hook
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signUp = (email, password) => supabase.auth.signUp({ email, password })
  const signOut = () => supabase.auth.signOut()

  return { user, loading, signIn, signUp, signOut }
}
