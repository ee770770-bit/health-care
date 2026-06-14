import { useState } from 'react'
import { C, SZ, FONT, APT_COLORS, fmtDate, daysLeft } from './constants'
import { BigBtn, Card, SectionTitle, inputStyle, labelStyle } from './components'
import { speak, scheduleApptReminders } from './notifications'

function ApptForm({ initial, onSave, onCancel, title }) {
  const blank = { doctor: '', date: '', time: '', place: '', phone: '', notes: '', color: C.sky }
  const [f, setF] = useState(initial || blank)
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))
  const valid = f.doctor && f.date && f.time

  return (
    <Card style={{ padding: 18, marginBottom: 14 }}>
      <div style={{ fontSize: SZ.md, fontWeight: 800, marginBottom: 16 }}>{title}</div>
      {[
        { k: 'doctor', lbl: 'שם הרופא / מחלקה', ph: 'ד״ר כהן – קרדיולוג' },
        { k: 'place', lbl: 'מיקום', ph: 'מכבי – סניף מרכז' },
        { k: 'phone', lbl: 'טלפון המרפאה', ph: '03-5551234', tp: 'tel' },
        { k: 'notes', lbl: 'הערות', ph: 'מה לקחת איתי?' },
      ].map(({ k, lbl, ph, tp }) => (
        <div key={k} style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{lbl}</label>
          <input style={inputStyle} type={tp || 'text'} value={f[k]} placeholder={ph} onChange={set(k)} />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>תאריך</label>
          <input style={inputStyle} type="date" value={f.date} onChange={set('date')} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>שעה</label>
          <input style={inputStyle} type="time" value={f.time} onChange={set('time')} />
        </div>
      </div>
      <label style={labelStyle}>צבע</label>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {APT_COLORS.map(c => (
          <button key={c} onClick={() => setF(p => ({ ...p, color: c }))} style={{
            width: 34, height: 34, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
            boxShadow: f.color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
            transition: 'box-shadow 0.15s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <BigBtn label="שמור" icon="✅" onClick={() => valid && onSave(f)} disabled={!valid} />
        <button onClick={onCancel} style={{
          flex: 1, borderRadius: 14, border: `2px solid ${C.border}`, background: C.bg,
          fontSize: SZ.md, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, padding: '14px 0', color: C.muted,
        }}>ביטול</button>
      </div>
    </Card>
  )
}

export default function AppointmentsTab({ appts, onAdd, onUpdate, onDelete, setToast }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const upcoming = appts.filter(a => daysLeft(a.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))
  const past = appts.filter(a => daysLeft(a.date) < 0).sort((a, b) => b.date.localeCompare(a.date))

  const handleAdd = async f => {
    const { error } = await onAdd(f)
    if (error) { setToast('❌ שגיאה בשמירה'); return }
    scheduleApptReminders(f)
    setShowAdd(false)
    setToast('✅ התור נוסף!')
  }
  const handleUpdate = async f => {
    const { error } = await onUpdate(editId, f)
    if (error) { setToast('❌ שגיאה בעדכון'); return }
    setEditId(null)
    setToast('✅ התור עודכן!')
  }
  const handleDelete = async id => {
    const { error } = await onDelete(id)
    if (error) { setToast('❌ שגיאה במחיקה'); return }
    setConfirmDelete(null)
    setToast('🗑️ התור נמחק')
  }

  const voiceReminder = a => {
    const dl = daysLeft(a.date)
    const when = dl === 0 ? 'היום' : dl === 1 ? 'מחר' : `בעוד ${dl} ימים`
    speak(`תזכורת: יש לך תור אצל ${a.doctor} ${when}, בשעה ${a.time}, ב${a.place}.`)
  }

  return (
    <div style={{ padding: '16px 14px 4px' }}>
      {/* Confirm delete overlay */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ background: C.card, borderRadius: 22, padding: 26, width: '100%', maxWidth: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 46, marginBottom: 8 }}>🗑️</div>
            <div style={{ fontSize: SZ.lg, fontWeight: 800, marginBottom: 8 }}>למחוק את התור?</div>
            <div style={{ fontSize: SZ.sm, color: C.muted, marginBottom: 22 }}>לא ניתן לשחזר לאחר המחיקה</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDelete(confirmDelete)} style={{
                flex: 1, padding: 14, borderRadius: 14, background: C.red, color: 'white',
                border: 'none', fontSize: SZ.md, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
              }}>כן, מחק</button>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: 14, borderRadius: 14, background: C.bg,
                border: `2px solid ${C.border}`, fontSize: SZ.md, fontWeight: 700,
                cursor: 'pointer', fontFamily: FONT, color: C.muted,
              }}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <SectionTitle>📅 תורים קרובים</SectionTitle>
        <button onClick={() => { setShowAdd(!showAdd); setEditId(null) }} style={{
          background: C.sky, color: 'white', border: 'none', borderRadius: 20,
          padding: '8px 18px', fontSize: SZ.sm, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
        }}>＋ תור חדש</button>
      </div>

      {showAdd && !editId && (
        <ApptForm title="➕ תור חדש" onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      )}

      {upcoming.length === 0 && !showAdd && (
        <Card style={{ padding: '24px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: SZ.md, color: C.muted }}>אין תורים קרובים</div>
        </Card>
      )}

      {upcoming.map(a => (
        <div key={a.id}>
          {editId === a.id
            ? <ApptForm title="✏️ עריכת תור" initial={a}
              onSave={handleUpdate} onCancel={() => setEditId(null)} />
            : <Card>
              <div style={{ padding: '15px 18px', borderRight: `5px solid ${a.color || C.sky}` }}>
                <div style={{ fontSize: SZ.lg, fontWeight: 800 }}>{a.doctor}</div>
                <div style={{ fontSize: SZ.md, color: C.muted, marginTop: 5, lineHeight: 1.8 }}>
                  🗓️ {fmtDate(a.date)} · ⏰ {a.time}<br />
                  📍 {a.place}
                  {a.notes && <><br />📝 {a.notes}</>}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    fontSize: SZ.sm, fontWeight: 800, padding: '5px 14px', borderRadius: 20,
                    background: daysLeft(a.date) <= 2 ? C.orangeLight : C.greenLight,
                    color: daysLeft(a.date) <= 2 ? C.orange : C.green,
                  }}>
                    {daysLeft(a.date) === 0 ? 'היום! 🎯' : daysLeft(a.date) === 1 ? 'מחר ⭐' : `עוד ${daysLeft(a.date)} ימים`}
                  </span>
                  <button onClick={() => voiceReminder(a)} style={{
                    background: C.orangeLight, color: C.orange, border: 'none', borderRadius: 20,
                    padding: '6px 14px', fontSize: SZ.sm, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
                  }}>🔊 קול</button>
                  {a.phone && (
                    <a href={`tel:${a.phone}`} style={{ textDecoration: 'none' }}>
                      <span style={{
                        display: 'inline-block', fontSize: SZ.sm, fontWeight: 700,
                        padding: '6px 14px', borderRadius: 20, background: C.skyLight, color: C.sky,
                      }}>📞 התקשר</span>
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => { setEditId(a.id); setShowAdd(false) }} style={{
                    flex: 1, padding: '10px 0', borderRadius: 14, background: C.skyLight,
                    color: C.sky, border: 'none', fontSize: SZ.sm, fontWeight: 800,
                    cursor: 'pointer', fontFamily: FONT,
                  }}>✏️ ערוך</button>
                  <button onClick={() => setConfirmDelete(a.id)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 14, background: C.redLight,
                    color: C.red, border: 'none', fontSize: SZ.sm, fontWeight: 800,
                    cursor: 'pointer', fontFamily: FONT,
                  }}>🗑️ מחק</button>
                </div>
              </div>
            </Card>
          }
        </div>
      ))}

      {past.length > 0 && (
        <>
          <SectionTitle style={{ marginTop: 8 }}>📁 תורים שעברו</SectionTitle>
          {past.slice(0, 3).map(a => (
            <Card key={a.id} style={{ opacity: 0.6 }}>
              <div style={{ padding: '12px 16px', borderRight: `4px solid ${C.border}` }}>
                <div style={{ fontSize: SZ.md, fontWeight: 700 }}>{a.doctor}</div>
                <div style={{ fontSize: SZ.sm, color: C.muted }}>
                  {fmtDate(a.date)} · {a.time} · {a.place}
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
