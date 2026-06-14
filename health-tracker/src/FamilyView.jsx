import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { C, FONT, SZ, fmtDate, daysLeft, todayKey } from './constants'
import { Card, SectionTitle, Spinner } from './components'

export default function FamilyView({ familyUserId }) {
  const [appts, setAppts] = useState([])
  const [meds, setMeds] = useState([])
  const [medLogs, setMedLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [patientName, setPatientName] = useState('אבא')

  useEffect(() => {
    if (!familyUserId) return
    Promise.all([
      supabase.from('appointments').select('*').eq('user_id', familyUserId).order('date'),
      supabase.from('medications').select('*').eq('user_id', familyUserId),
      supabase.from('med_logs').select('*').eq('user_id', familyUserId).eq('date', todayKey()),
      supabase.from('profiles').select('name').eq('id', familyUserId).single(),
    ]).then(([a, m, l, p]) => {
      setAppts(a.data || [])
      setMeds(m.data || [])
      setMedLogs(l.data || [])
      if (p.data?.name) setPatientName(p.data.name)
      setLoading(false)
    })
  }, [familyUserId])

  const isTaken = (medId, timeStr) =>
    medLogs.some(l => l.med_id === medId && l.time_slot === timeStr)

  const upcoming = appts.filter(a => daysLeft(a.date) >= 0)
  const totalDue = meds.reduce((s, m) => s + (m.times?.length || 0), 0)
  const totalDone = meds.reduce((s, m) =>
    s + (m.times || []).filter(t => isTaken(m.id, t)).length, 0)

  if (loading) return (
    <div style={{ direction: 'rtl', fontFamily: FONT, minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )

  return (
    <div style={{ direction: 'rtl', fontFamily: FONT, background: C.bg, minHeight: '100vh', color: C.text, maxWidth: 500, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{
        background: `linear-gradient(135deg,${C.skyDark},${C.sky})`,
        padding: '24px 20px', color: 'white', textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>👨‍👩‍👧</div>
        <div style={{ fontSize: SZ.xl, fontWeight: 800 }}>מצב בריאות – {patientName}</div>
        <div style={{ fontSize: SZ.sm, opacity: .8, marginTop: 4 }}>
          עדכון: {fmtDate(new Date())}
        </div>
      </div>

      <div style={{ padding: '16px 14px' }}>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { icon: '📅', num: upcoming.length, label: 'תורים קרובים', color: C.sky },
            {
              icon: '💊', num: `${totalDone}/${totalDue}`, label: 'תרופות היום',
              color: totalDone === totalDue && totalDue > 0 ? C.green : C.orange,
            },
          ].map(s => (
            <div key={s.label} style={{
              background: C.card, borderRadius: 16, padding: '18px 14px',
              textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
            }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: SZ.xxl, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.num}</div>
              <div style={{ fontSize: SZ.xs, color: C.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Medication status bar */}
        {totalDue > 0 && (
          <Card style={{ padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: SZ.sm, fontWeight: 700, marginBottom: 8, color: C.muted }}>
              💊 מצב תרופות היום
            </div>
            <div style={{ background: C.border, borderRadius: 8, height: 12, overflow: 'hidden' }}>
              <div style={{
                background: totalDone === totalDue ? C.green : C.sky,
                width: `${(totalDone / totalDue) * 100}%`,
                height: '100%', borderRadius: 8, transition: 'width 0.5s',
              }} />
            </div>
            <div style={{ fontSize: SZ.xs, color: C.muted, marginTop: 6, textAlign: 'center' }}>
              {totalDone === totalDue && totalDue > 0
                ? '✅ לקח את כל התרופות היום!'
                : `${totalDone} מתוך ${totalDue} לקיחות`}
            </div>
          </Card>
        )}

        <SectionTitle>📅 תורים קרובים</SectionTitle>
        {upcoming.length === 0
          ? <Card style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: SZ.md, color: C.muted }}>אין תורים קרובים 🎉</div>
          </Card>
          : upcoming.map(a => (
            <Card key={a.id}>
              <div style={{ padding: '15px 18px', borderRight: `5px solid ${a.color || C.sky}` }}>
                <div style={{ fontSize: SZ.lg, fontWeight: 800 }}>{a.doctor}</div>
                <div style={{ fontSize: SZ.md, color: C.muted, marginTop: 5, lineHeight: 1.8 }}>
                  🗓️ {fmtDate(a.date)} · ⏰ {a.time}<br />
                  📍 {a.place}
                  {a.notes && <><br />📝 {a.notes}</>}
                </div>
                <span style={{
                  display: 'inline-block', marginTop: 10, fontSize: SZ.sm, fontWeight: 800,
                  padding: '5px 14px', borderRadius: 20,
                  background: daysLeft(a.date) <= 2 ? C.orangeLight : C.greenLight,
                  color: daysLeft(a.date) <= 2 ? C.orange : C.green,
                }}>
                  {daysLeft(a.date) === 0 ? 'היום! 🎯' : daysLeft(a.date) === 1 ? 'מחר ⭐' : `עוד ${daysLeft(a.date)} ימים`}
                </span>
              </div>
            </Card>
          ))}

        <SectionTitle style={{ marginTop: 8 }}>💊 תרופות יומיות</SectionTitle>
        <Card>
          {meds.map((m, i) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderBottom: i < meds.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14,
                background: (m.color || C.sky) + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>💊</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: SZ.md, fontWeight: 800 }}>
                  {m.name} <span style={{ fontWeight: 400, color: C.muted, fontSize: SZ.sm }}>{m.dose}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {(m.times || []).map(t => (
                    <span key={t} style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: SZ.xs, fontWeight: 700,
                      background: isTaken(m.id, t) ? C.green : C.border,
                      color: isTaken(m.id, t) ? 'white' : C.muted,
                    }}>
                      {isTaken(m.id, t) ? '✓ ' : ''}{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Card>

        <div style={{ textAlign: 'center', fontSize: SZ.xs, color: C.muted, marginTop: 8, padding: '0 8px' }}>
          📋 ממשק לצפייה בלבד · עדכון בזמן אמת
        </div>
      </div>
    </div>
  )
}
