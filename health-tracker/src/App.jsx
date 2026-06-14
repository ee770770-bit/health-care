import { useState, useEffect } from "react"
import { C, FONT, SZ, ENCOURAGEMENTS, fmtDate, daysLeft, todayKey } from './constants'
import { Toast, Card, SectionTitle, Spinner } from './components'
import { useAuth, useTable } from './hooks'
import { requestNotificationPermission, scheduleMedReminders, speak } from './notifications'
import AuthScreen from './AuthScreen'
import FamilyView from './FamilyView'
import AppointmentsTab from './AppointmentsTab'
import MedicationsTab from './MedicationsTab'
import DocumentsTab from './DocumentsTab'
import AITab from './AITab'
import SOSModal from './SOSModal'

const NAV = [
  { id: 'home', icon: '🏠', label: 'בית' },
  { id: 'appointments', icon: '📅', label: 'תורים' },
  { id: 'medications', icon: '💊', label: 'תרופות' },
  { id: 'documents', icon: '📂', label: 'מסמכים' },
  { id: 'ai', icon: '🤖', label: 'עוזר' },
]

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const [tab, setTab] = useState('home')
  const [toast, setToast] = useState(null)
  const [showSOS, setShowSOS] = useState(false)
  const [encIdx, setEncIdx] = useState(0)
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  )

  const params = new URLSearchParams(window.location.search)
  const familyUserId = params.get('family')
  if (familyUserId) return <FamilyView familyUserId={familyUserId} />

  const { data: appts, loading: apptsLoading, insert: addAppt, update: updateAppt, remove: removeAppt } = useTable('appointments', user?.id)
  const { data: meds, loading: medsLoading, insert: addMed, update: updateMed, remove: removeMed } = useTable('medications', user?.id)
  const { data: medLogs, insert: addMedLog, remove: removeMedLog, setData: setMedLogs } = useTable('med_logs', user?.id)
  const { data: docs, setData: setDocs } = useTable('documents', user?.id)
  const { data: vitals, insert: addVital } = useTable('vitals', user?.id)

  useEffect(() => {
    if (meds?.length && notifGranted) scheduleMedReminders(meds)
  }, [meds, notifGranted])

  const handleAuth = (mode, email, password) =>
    mode === 'login' ? signIn(email, password) : signUp(email, password)

  const handleNotifRequest = async () => {
    const granted = await requestNotificationPermission()
    setNotifGranted(granted)
    setToast(granted ? '✅ התראות הופעלו!' : '❌ לא אישרת התראות')
    if (granted && meds?.length) scheduleMedReminders(meds)
  }

  const handleToggleMed = async (medId, timeStr) => {
    const existing = medLogs.find(l => l.med_id === medId && l.time_slot === timeStr)
    if (existing) await removeMedLog(existing.id)
    else await addMedLog({ med_id: medId, time_slot: timeStr, date: todayKey() })
  }

  const handleAddVital = async (v) => {
    await addVital({ ...v, date: todayKey() })
    setToast('✅ הערכים נשמרו!')
  }

  const copyFamilyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?family=${user.id}`
    navigator.clipboard.writeText(url).then(() => setToast('✅ הלינק הועתק! שלח לבני המשפחה'))
  }

  const isTaken = (medId, t) => medLogs.some(l => l.med_id === medId && l.time_slot === t)

  if (authLoading) return (
    <div style={{ direction: 'rtl', fontFamily: FONT, background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )
  if (!user) return <AuthScreen onAuth={handleAuth} />

  const upcoming = appts.filter(a => daysLeft(a.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))
  const totalMedsDue = meds.reduce((s, m) => s + (m.times?.length || 0), 0)
  const totalMedsDone = meds.reduce((s, m) =>
    s + (m.times || []).filter(t => isTaken(m.id, t)).length, 0)

  return (
    <div style={{ direction: 'rtl', fontFamily: FONT, background: C.bg, minHeight: '100vh', color: C.text, maxWidth: 500, margin: '0 auto', paddingBottom: 90 }}>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {showSOS && <SOSModal userId={user.id} onClose={() => setShowSOS(false)} />}

      <div style={{ background: `linear-gradient(135deg,${C.skyDark} 0%,${C.sky} 100%)`, padding: '22px 18px 18px', color: 'white', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(42,127,191,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: SZ.xl, fontWeight: 800 }}>שלום אבא 👋</div>
            <div style={{ fontSize: SZ.sm, opacity: .8, marginTop: 3 }}>{fmtDate(new Date())}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: SZ.sm, background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '6px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800 }}>{totalMedsDone}/{totalMedsDue}</div>
              <div style={{ fontSize: SZ.xs, opacity: .85 }}>תרופות</div>
            </div>
            <button onClick={() => setShowSOS(true)} style={{ background: C.red, color: 'white', border: 'none', borderRadius: 12, padding: '10px 14px', fontSize: SZ.sm, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>🆘 SOS</button>
          </div>
        </div>
      </div>

      {tab === 'home' && <>
        <div style={{ padding: '16px 14px 4px' }}>
          {!notifGranted && (
            <button onClick={handleNotifRequest} style={{ width: '100%', background: C.orangeLight, border: `1.5px solid ${C.orange}`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontFamily: FONT, marginBottom: 14 }}>
              <span style={{ fontSize: 28 }}>🔔</span>
              <div style={{ textAlign: 'right', flex: 1 }}>
                <div style={{ fontSize: SZ.sm, fontWeight: 800, color: C.orange }}>הפעל התראות</div>
                <div style={{ fontSize: SZ.xs, color: C.muted, marginTop: 2 }}>לקבל תזכורות לתרופות ותורים</div>
              </div>
            </button>
          )}
          <div style={{ background: `linear-gradient(135deg,${C.skyLight},${C.greenLight})`, borderRadius: 18, padding: '18px 20px', marginBottom: 14, border: `1.5px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
            <div style={{ fontSize: SZ.md, fontWeight: 600, color: C.skyDark, lineHeight: 1.7 }}>{ENCOURAGEMENTS[encIdx]}</div>
            <button onClick={() => setEncIdx((encIdx + 1) % ENCOURAGEMENTS.length)} style={{ marginTop: 10, fontSize: SZ.sm, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: FONT }}>משפט נוסף</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { icon: '📅', num: upcoming.length, label: 'תורים קרובים', color: C.sky },
              { icon: '💊', num: `${totalMedsDone}/${totalMedsDue}`, label: 'תרופות היום', color: totalMedsDone === totalMedsDue && totalMedsDue > 0 ? C.green : C.orange },
            ].map(s => (
              <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: '16px 14px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
                <div style={{ fontSize: SZ.xxl, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.num}</div>
                <div style={{ fontSize: SZ.xs, color: C.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={copyFamilyLink} style={{ width: '100%', background: C.purpleLight, border: `1.5px solid ${C.purple}`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontFamily: FONT, marginBottom: 14 }}>
            <span style={{ fontSize: 28 }}>👨‍👩‍👧</span>
            <div style={{ textAlign: 'right', flex: 1 }}>
              <div style={{ fontSize: SZ.sm, fontWeight: 800, color: C.purple }}>שתף עם בני המשפחה</div>
              <div style={{ fontSize: SZ.xs, color: C.muted, marginTop: 2 }}>לחץ להעתקת לינק מעקב</div>
            </div>
            <span style={{ fontSize: SZ.lg, color: C.purple }}>📋</span>
          </button>
        </div>

        {upcoming[0] && (
          <div style={{ padding: '0 14px 4px' }}>
            <SectionTitle>⏭️ התור הקרוב ביותר</SectionTitle>
            <Card>
              <div style={{ padding: '16px 18px', borderRight: `5px solid ${upcoming[0].color || C.sky}` }}>
                <div style={{ fontSize: SZ.lg, fontWeight: 800 }}>{upcoming[0].doctor}</div>
                <div style={{ fontSize: SZ.md, color: C.muted, marginTop: 6, lineHeight: 1.8 }}>
                  🗓️ {fmtDate(upcoming[0].date)} · ⏰ {upcoming[0].time}<br />
                  📍 {upcoming[0].place}
                  {upcoming[0].notes && <><br />📝 {upcoming[0].notes}</>}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: SZ.sm, fontWeight: 800, padding: '6px 16px', borderRadius: 20, background: daysLeft(upcoming[0].date) <= 2 ? C.orangeLight : C.greenLight, color: daysLeft(upcoming[0].date) <= 2 ? C.orange : C.green }}>
                    {daysLeft(upcoming[0].date) === 0 ? 'היום! 🎯' : daysLeft(upcoming[0].date) === 1 ? 'מחר ⭐' : `עוד ${daysLeft(upcoming[0].date)} ימים`}
                  </span>
                  <button onClick={() => { const a = upcoming[0]; const dl = daysLeft(a.date); const when = dl === 0 ? 'היום' : dl === 1 ? 'מחר' : `בעוד ${dl} ימים`; speak(`תזכורת: יש לך תור אצל ${a.doctor} ${when}, בשעה ${a.time}, ב${a.place}.`) }} style={{ background: C.orangeLight, color: C.orange, border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: SZ.sm, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>🔊 הזכר בקול</button>
                  {upcoming[0].phone && <a href={`tel:${upcoming[0].phone}`} style={{ textDecoration: 'none' }}><span style={{ display: 'inline-block', fontSize: SZ.sm, fontWeight: 700, padding: '6px 14px', borderRadius: 20, background: C.skyLight, color: C.sky }}>📞 התקשר</span></a>}
                </div>
              </div>
            </Card>
          </div>
        )}

        <div style={{ padding: '0 14px 4px' }}>
          <SectionTitle>💊 תרופות להיום</SectionTitle>
          <Card>
            {meds.slice(0, 4).map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', gap: 12, borderBottom: i < Math.min(meds.length, 4) - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: (m.color || C.sky) + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💊</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: SZ.md, fontWeight: 800 }}>{m.name}</div>
                  <div style={{ fontSize: SZ.sm, color: C.muted }}>{m.dose}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {(m.times || []).map(t => (
                      <button key={t} onClick={() => handleToggleMed(m.id, t)} style={{ border: 'none', cursor: 'pointer', fontFamily: FONT, padding: '5px 12px', borderRadius: 20, fontSize: SZ.sm, fontWeight: 700, background: isTaken(m.id, t) ? C.green : C.bg, color: isTaken(m.id, t) ? 'white' : C.muted }}>
                        {isTaken(m.id, t) ? '✓ ' : ''}{t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div style={{ padding: '4px 14px 0', textAlign: 'center' }}>
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: C.muted, fontSize: SZ.sm, cursor: 'pointer', fontFamily: FONT, textDecoration: 'underline' }}>התנתק</button>
        </div>
      </>}

      {tab === 'appointments' && <AppointmentsTab appts={appts} onAdd={addAppt} onUpdate={updateAppt} onDelete={removeAppt} setToast={setToast} />}
      {tab === 'medications' && <MedicationsTab meds={meds} medLogs={medLogs} onToggle={handleToggleMed} onAdd={addMed} onUpdate={updateMed} onDelete={removeMed} setToast={setToast} />}
      {tab === 'documents' && <DocumentsTab docs={docs} userId={user.id} onDocAdded={d => setDocs(prev => [d, ...prev])} setToast={setToast} />}
      {tab === 'ai' && <AITab appts={appts} meds={meds} vitals={vitals} onAddVital={handleAddVital} />}

      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 500, background: 'white', borderTop: `1px solid ${C.border}`, display: 'flex', boxShadow: '0 -4px 20px rgba(0,0,0,0.09)' }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: FONT, color: tab === n.id ? C.sky : C.muted, borderTop: `3px solid ${tab === n.id ? C.sky : 'transparent'}`, WebkitTapHighlightColor: 'transparent' }}>
            <span style={{ fontSize: 24 }}>{n.icon}</span>
            <span style={{ fontSize: SZ.xs, fontWeight: tab === n.id ? 800 : 600 }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
