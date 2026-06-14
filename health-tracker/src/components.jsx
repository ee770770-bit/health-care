import { useEffect, useState } from 'react'
import { C, FONT, SZ } from './constants'

export function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)',
      background: C.text, color: 'white', borderRadius: 14, padding: '13px 24px',
      fontSize: SZ.md, fontWeight: 700, zIndex: 999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)', whiteSpace: 'nowrap',
      fontFamily: FONT, pointerEvents: 'none',
    }}>{msg}</div>
  )
}

export function BigBtn({ label, icon, color = C.sky, onClick, disabled = false, small = false, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#ccc' : color, color: 'white', border: 'none',
      borderRadius: 16, padding: small ? '11px 16px' : '17px 20px',
      fontSize: small ? SZ.sm : SZ.md, fontWeight: 800,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: FONT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, width: '100%', boxShadow: disabled ? 'none' : `0 3px 12px ${color}55`,
      WebkitTapHighlightColor: 'transparent', ...style,
    }}>
      {icon && <span style={{ fontSize: small ? SZ.md : SZ.lg }}>{icon}</span>}{label}
    </button>
  )
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 18,
      boxShadow: '0 2px 14px rgba(0,0,0,0.07)', marginBottom: 14, overflow: 'hidden', ...style,
    }}>{children}</div>
  )
}

export function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: SZ.sm, fontWeight: 800, color: C.muted,
      letterSpacing: .8, marginBottom: 10, paddingRight: 2, fontFamily: FONT,
    }}>{children}</div>
  )
}

export function Dots() {
  const [d, setD] = useState('.')
  useEffect(() => { const t = setInterval(() => setD(x => x.length >= 3 ? '.' : x + '.'), 400); return () => clearInterval(t) }, [])
  return <span>{d}</span>
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 40, height: 40, border: `4px solid ${C.border}`,
        borderTop: `4px solid ${C.sky}`, borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export const inputStyle = {
  width: '100%', borderRadius: 12, border: `2px solid ${C.border}`,
  padding: '13px 14px', fontSize: SZ.md, fontFamily: FONT,
  direction: 'rtl', outline: 'none', boxSizing: 'border-box',
  background: C.bg, color: C.text,
}
export const labelStyle = {
  fontSize: SZ.sm, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6,
}
