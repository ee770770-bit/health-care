import { useState } from 'react'
import { C, SZ, FONT, fmtDate, todayKey } from './constants'
import { Card, SectionTitle, BigBtn, inputStyle, labelStyle } from './components'

const MED_COLORS = [C.orange, C.sky, C.purple, C.green, C.red]
const MED_TIMES_OPTIONS = ['06:00','07:00','08:00','09:00','12:00','13:00','14:00','18:00','20:00','21:00','22:00']

function MedForm({ initial, onSave, onCancel, title }) {
  const blank = { name: '', dose: '', times: ['08:00'], color: C.sky }
  const [f, setF] = useState(initial || blank)
  const valid = f.name && f.dose && f.times.length > 0

  const toggleTime = (t) => {
    setF(p => ({
      ...p,
      times: p.times.includes(t) ? p.times.filter(x => x !== t) : [...p.times, t].sort()
    }))
  }

  return (
    <Card style={{ padding: 18, marginBottom: 14 }}>
      <div style={{ fontSize: SZ.md, fontWeight: 800, marginBottom: 16 }}>{title}</div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>שם התרופה</label>
        <input style={inputStyle} value={f.name} placeholder="אספירין"
          onChange={e => setF(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>מינון</label>
        <input style={inputStyle} value={f.dose} placeholder="100 מ״ג"
          onChange={e => setF(p => ({ ...p, dose: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>שעות לקיחה (בחר אחת או יותר)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {MED_TIMES_OPTIONS.map(t => (
            <button key={t} onClick={() => toggleTime(t)} style={{
              padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontFamily: FONT, fontSize: SZ.sm, fontWeight: 700,
              background: f.times.includes(t) ? C.sky : C.bg,
              color: f.times.includes(t) ? 'white' : C.muted,
            }}>{t}</button>
          ))}
        </div>
      </div>
      <label style={labelStyle}>צבע</label>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {MED_COLORS.map(c => (
          <button key={c} onClick={() => setF(p => ({ ...p, color: c }))} style={{
            width: 34, height: 34, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
            boxShadow: f.color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
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

export default function MedicationsTab({ meds, medLogs, onToggle, onAdd, onUpdate, onDelete, setToast }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const isTaken = (medId, timeStr) =>
    medLogs.some(l => l.med_id === medId && l.time_slot === timeStr)

  const totalDue = meds.reduce((s, m) => s + (m.times?.length || 0), 0)
  const totalDone = meds.reduce((s, m) =>
    s + (m.times || []).filter(t => isTaken(m.id, t)).length, 0)

  const handleAdd = async (f) => {
    const { error } = await onAdd(f)
    if (error) { setToast('❌ שגיאה'); return }
    setShowAdd(false)
    setToast('✅ התרופה נוספה!')
  }
  const handleUpdate = async (f) => {
    const { error } = await onUpdate(editId, f)
    if (error) { setToast('❌ שגיאה'); return }
    setEditId(null)
    setToast('✅ התרופה עודכנה!')
  }
  const handleDelete = async (id) => {
    await onDelete(id)
    setConfirmDelete(null)
    setToast('🗑️ התרופה נמחקה')
  }

  return (
    <div style={{ padding: '16px 14px 4px' }}>
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: C.card, borderRadius: 22, padding: 26, width: '100%', maxWidth: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 46, marginBottom: 8 }}>🗑️</div>
            <div style={{ fontSize: SZ.lg, fontWeight: 800, marginBottom: 8 }}>למחוק את התרופה?</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.red, color: 'white', border: 'none', fontSize: SZ.md, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>כן, מחק</button>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.bg, border: `2px solid ${C.border}`, fontSize: SZ.md, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: C.muted }}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <SectionTitle>💊 תרופות – {fmtDate(new Date())}</SectionTitle>
        <button onClick={() => { setShowAdd(!showAdd); setEditId(null) }} style={{
          background: C.sky, color: 'white', border: 'none', borderRadius: 20,
          padding: '8px 18px', fontSize: SZ.sm, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
        }}>＋ תרופה</button>
      </div>

      {showAdd && !editId && <MedForm title="➕ תרופה חדשה" onSave={handleAdd} onCancel={() => setShowAdd(false)} />}

      {meds.length === 0 && !showAdd && (
        <Card style={{ padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💊</div>
          <div style={{ fontSize: SZ.md, color: C.muted }}>עדיין לא הוספת תרופות</div>
          <div style={{ fontSize: SZ.sm, color: C.muted, marginTop: 6 }}>לחץ "＋ תרופה" להוספה</div>
        </Card>
      )}

      {meds.map(m => (
        <div key={m.id}>
          {editId === m.id
            ? <MedForm title="✏️ עריכת תרופה" initial={m} onSave={handleUpdate} onCancel={() => setEditId(null)} />
            : <Card>
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 16, background: (m.color || C.sky) + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>💊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: SZ.lg, fontWeight: 800 }}>{m.name}</div>
                    <div style={{ fontSize: SZ.sm, color: C.muted }}>{m.dose}</div>
                  </div>
                  <div style={{ fontSize: SZ.sm, fontWeight: 800, color: (m.times || []).every(t => isTaken(m.id, t)) ? C.green : C.muted }}>
                    {(m.times || []).filter(t => isTaken(m.id, t)).length}/{(m.times || []).length}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  {(m.times || []).map(t => (
                    <button key={t} onClick={() => onToggle(m.id, t)} style={{
                      flex: 1, minWidth: 80, padding: '13px 8px', borderRadius: 14,
                      border: `2.5px solid ${isTaken(m.id, t) ? C.green : C.border}`,
                      background: isTaken(m.id, t) ? C.green : C.card,
                      color: isTaken(m.id, t) ? 'white' : C.text,
                      fontSize: SZ.md, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
                    }}>
                      {isTaken(m.id, t) ? '✅ ' : ''}{t}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => { setEditId(m.id); setShowAdd(false) }} style={{ flex: 1, padding: '10px 0', borderRadius: 14, background: C.skyLight, color: C.sky, border: 'none', fontSize: SZ.sm, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>✏️ ערוך</button>
                  <button onClick={() => setConfirmDelete(m.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 14, background: C.redLight, color: C.red, border: 'none', fontSize: SZ.sm, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>🗑️ מחק</button>
                </div>
              </div>
            </Card>
          }
        </div>
      ))}

      {totalDue > 0 && (
        <Card style={{ padding: '16px 18px', textAlign: 'center', background: totalDone === totalDue ? C.greenLight : C.bg }}>
          {totalDone === totalDue
            ? <div style={{ fontSize: SZ.lg, fontWeight: 800, color: C.green }}>🎉 לקחת את כל התרופות היום!</div>
            : <div style={{ fontSize: SZ.md, color: C.muted }}>נשארו <strong style={{ color: C.orange }}>{totalDue - totalDone}</strong> לקיחות להיום</div>}
          <div style={{ background: C.border, borderRadius: 8, height: 10, marginTop: 12, overflow: 'hidden' }}>
            <div style={{ background: totalDone === totalDue ? C.green : C.sky, width: `${totalDue > 0 ? (totalDone / totalDue) * 100 : 0}%`, height: '100%', borderRadius: 8, transition: 'width 0.4s' }} />
          </div>
        </Card>
      )}
    </div>
  )
}
