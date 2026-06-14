import { useState } from 'react'
import { C, FONT, SZ } from './constants'
import { BigBtn, Card, Toast, inputStyle, labelStyle } from './components'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')

  const handle = async () => {
    if (!email || !password) { setError('נא למלא אימייל וסיסמה'); return }
    setLoading(true); setError('')
    const result = await onAuth(mode, email, password)
    if (result?.error) {
      setError(result.error.message === 'Invalid login credentials'
        ? 'אימייל או סיסמה שגויים'
        : result.error.message)
    } else if (mode === 'signup') {
      setToast('✅ נרשמת! בדוק את האימייל לאישור')
    }
    setLoading(false)
  }

  return (
    <div style={{
      direction: 'rtl', fontFamily: FONT, background: C.bg,
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🏥</div>
        <div style={{ fontSize: SZ.xl, fontWeight: 800, color: C.skyDark }}>מעקב בריאות</div>
        <div style={{ fontSize: SZ.sm, color: C.muted, marginTop: 6 }}>
          ניהול תורים, תרופות ומסמכים
        </div>
      </div>

      <Card style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <div style={{ fontSize: SZ.lg, fontWeight: 800, marginBottom: 20, textAlign: 'center' }}>
          {mode === 'login' ? 'כניסה לחשבון' : 'הרשמה'}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>אימייל</label>
          <input style={inputStyle} type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com"
            onKeyDown={e => e.key === 'Enter' && handle()} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>סיסמה</label>
          <input style={inputStyle} type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="לפחות 6 תווים"
            onKeyDown={e => e.key === 'Enter' && handle()} />
        </div>

        {error && (
          <div style={{
            background: C.redLight, color: C.red, borderRadius: 12,
            padding: '10px 14px', fontSize: SZ.sm, fontWeight: 600,
            marginBottom: 14, textAlign: 'center',
          }}>{error}</div>
        )}

        <BigBtn
          label={loading ? 'מתחבר...' : mode === 'login' ? 'כניסה' : 'הרשמה'}
          icon={mode === 'login' ? '🔑' : '✨'}
          onClick={handle} disabled={loading}
        />

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: SZ.sm, color: C.muted }}>
          {mode === 'login' ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}
          {' '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{
              background: 'none', border: 'none', color: C.sky,
              fontWeight: 700, cursor: 'pointer', fontFamily: FONT, fontSize: SZ.sm,
            }}>
            {mode === 'login' ? 'הרשם כאן' : 'כנס כאן'}
          </button>
        </div>
      </Card>

      <div style={{ marginTop: 20, fontSize: SZ.xs, color: C.muted, textAlign: 'center', maxWidth: 320 }}>
        המידע שלך מאובטח ומוצפן ב-Supabase 🔒
      </div>
    </div>
  )
}
