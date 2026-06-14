import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { C, SZ, FONT } from './constants'
import { inputStyle, labelStyle } from './components'

const DEFAULT_CONTACTS = [
  { id: 1, name: 'מד״א', phone: '101', whatsapp: false },
  { id: 2, name: 'בן / בת', phone: '', whatsapp: true },
  { id: 3, name: 'איש קשר נוסף', phone: '', whatsapp: true },
]

export default function SOSModal({ userId, onClose }) {
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS)
  const [editMode, setEditMode] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`sos_contacts_${userId}`)
    if (stored) setContacts(JSON.parse(stored))
  }, [userId])

  const saveContacts = () => {
    localStorage.setItem(`sos_contacts_${userId}`, JSON.stringify(contacts))
    setSaved(true)
    setTimeout(() => { setSaved(false); setEditMode(false) }, 1200)
  }

  const updateContact = (id, field, value) => {
    setContacts(cs => cs.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const waLink = (phone) => {
    const clean = phone.replace(/\D/g, '')
    const intl = clean.startsWith('0') ? '972' + clean.slice(1) : clean
    return `https://wa.me/${intl}?text=שלום, אני צריך עזרה!`
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 52 }}>🆘</div>
          <div style={{ fontSize: SZ.xl, fontWeight: 800 }}>מצב חירום</div>
        </div>

        {!editMode ? (
          <>
            {contacts.map(c => (
              <div key={c.id} style={{ marginBottom: 10 }}>
                {c.phone ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`tel:${c.phone}`} style={{ textDecoration: 'none', flex: 2 }}>
                      <div style={{
                        background: c.id === 1 ? C.red : C.sky,
                        color: 'white', borderRadius: 14, padding: '15px 16px',
                        fontSize: SZ.md, fontWeight: 800, textAlign: 'center',
                      }}>📞 {c.name}</div>
                    </a>
                    {c.whatsapp && c.phone && (
                      <a href={waLink(c.phone)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', flex: 1 }}>
                        <div style={{ background: '#25D366', color: 'white', borderRadius: 14, padding: '15px 10px', fontSize: SZ.md, fontWeight: 800, textAlign: 'center' }}>💬</div>
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ background: C.bg, borderRadius: 14, padding: '14px 16px', fontSize: SZ.sm, color: C.muted, textAlign: 'center', border: `2px dashed ${C.border}` }}>
                    {c.name} – לא הוגדר מספר
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => setEditMode(true)} style={{ flex: 1, padding: 12, borderRadius: 14, background: C.purpleLight, color: C.purple, border: 'none', fontSize: SZ.sm, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>✏️ ערוך אנשי קשר</button>
              <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 14, background: C.bg, border: `2px solid ${C.border}`, fontSize: SZ.sm, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: C.muted }}>סגור</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: SZ.md, fontWeight: 800, marginBottom: 14 }}>✏️ עריכת אנשי קשר</div>
            {contacts.filter(c => c.id !== 1).map(c => (
              <div key={c.id} style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{c.id === 2 ? 'איש קשר 1' : 'איש קשר 2'} – שם</label>
                <input style={{ ...inputStyle, marginBottom: 8 }} value={c.name}
                  onChange={e => updateContact(c.id, 'name', e.target.value)} placeholder="שם" />
                <label style={labelStyle}>טלפון</label>
                <input style={inputStyle} value={c.phone} type="tel"
                  onChange={e => updateContact(c.id, 'phone', e.target.value)} placeholder="050-1234567" />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={saveContacts} style={{ flex: 1, padding: 13, borderRadius: 14, background: C.green, color: 'white', border: 'none', fontSize: SZ.md, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>
                {saved ? '✅ נשמר!' : 'שמור'}
              </button>
              <button onClick={() => setEditMode(false)} style={{ flex: 1, padding: 13, borderRadius: 14, background: C.bg, border: `2px solid ${C.border}`, fontSize: SZ.sm, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: C.muted }}>ביטול</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
