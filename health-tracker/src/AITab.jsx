import { useState } from 'react'
import { C, SZ, FONT, todayKey } from './constants'
import { Card, SectionTitle, inputStyle, labelStyle } from './components'

export default function AITab({ appts, meds, vitals, onAddVital }) {
  const [showVitalForm, setShowVitalForm] = useState(false)
  const [newVital, setNewVital] = useState({ bp: '', pulse: '', sugar: '' })

  const handleVital = () => {
    if (!newVital.bp && !newVital.pulse && !newVital.sugar) return
    onAddVital(newVital)
    setNewVital({ bp: '', pulse: '', sugar: '' })
    setShowVitalForm(false)
  }

  return (
    <div style={{ padding: '16px 14px 4px' }}>
      {/* Vitals */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <SectionTitle>📊 מעקב ערכים רפואיים</SectionTitle>
        <button onClick={() => setShowVitalForm(!showVitalForm)} style={{
          background: C.green, color: 'white', border: 'none', borderRadius: 20,
          padding: '8px 18px', fontSize: SZ.sm, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
        }}>＋ הוסף</button>
      </div>

      {showVitalForm && (
        <Card style={{ padding: 16, marginBottom: 12 }}>
          {[
            { k: 'bp', lbl: 'לחץ דם', ph: '120/80' },
            { k: 'pulse', lbl: 'דופק', ph: '72' },
            { k: 'sugar', lbl: 'סוכר בדם', ph: '95' },
          ].map(f => (
            <div key={f.k} style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{f.lbl}</label>
              <input style={inputStyle} value={newVital[f.k]} placeholder={f.ph}
                onChange={e => setNewVital({ ...newVital, [f.k]: e.target.value })} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleVital} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.green, color: 'white', border: 'none', fontSize: SZ.md, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>✅ שמור</button>
            <button onClick={() => setShowVitalForm(false)} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.bg, border: `2px solid ${C.border}`, fontSize: SZ.md, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: C.muted }}>ביטול</button>
          </div>
        </Card>
      )}

      {vitals.length === 0 && !showVitalForm && (
        <Card style={{ padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: SZ.md, color: C.muted }}>עדיין לא הוזנו ערכים</div>
        </Card>
      )}

      {vitals.length > 0 && (
        <Card>
          {vitals.slice(0, 10).map((v, i) => (
            <div key={v.id || i} style={{
              padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: i < Math.min(vitals.length, 10) - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <span style={{ color: C.muted, fontSize: SZ.sm }}>{v.date}</span>
              <div style={{ display: 'flex', gap: 16, fontSize: SZ.md, fontWeight: 600 }}>
                {v.bp && <span>❤️ {v.bp}</span>}
                {v.pulse && <span>💓 {v.pulse}</span>}
                {v.sugar && <span>🩸 {v.sugar}</span>}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Tips */}
      <Card style={{ padding: 18, marginTop: 8, background: C.skyLight }}>
        <div style={{ fontSize: SZ.md, fontWeight: 800, color: C.skyDark, marginBottom: 10 }}>💡 טיפים יומיים</div>
        {[
          '🚶 הליכה של 20 דקות ביום מועילה לבריאות הלב',
          '💧 שתה לפחות 8 כוסות מים ביום',
          '😴 שינה של 7-8 שעות חשובה להתאוששות',
          '🍎 אכול ירקות ופירות בכל ארוחה',
        ].map((tip, i) => (
          <div key={i} style={{ fontSize: SZ.sm, color: C.skyDark, padding: '6px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', lineHeight: 1.6 }}>{tip}</div>
        ))}
      </Card>
    </div>
  )
}
