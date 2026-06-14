import { useRef, useState } from 'react'
import { supabase } from './supabase'
import { C, SZ, FONT, DOC_TYPES, todayKey } from './constants'
import { BigBtn, Card, SectionTitle, inputStyle, labelStyle } from './components'

export default function DocumentsTab({ docs, userId, onDocAdded, setToast }) {
  const fileRef = useRef()
  const [newDoc, setNewDoc] = useState({ type: DOC_TYPES[0], doctor: '' })
  const [loading, setLoading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setToast('📤 מעלה קובץ...')

    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('medical-docs')
        .upload(path, file)

      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage
        .from('medical-docs')
        .getPublicUrl(path)

      const record = {
        user_id: userId,
        name: file.name,
        type: newDoc.type,
        doctor: newDoc.doctor,
        date: todayKey(),
        url: publicUrl,
        storage_path: path,
        summary: 'המסמך נשמר בהצלחה',
      }

      const { data: saved, error: dbErr } = await supabase
        .from('documents').insert(record).select().single()
      if (dbErr) throw dbErr

      onDocAdded(saved)
      setToast('✅ המסמך נשמר!')
      setNewDoc({ type: DOC_TYPES[0], doctor: '' })
    } catch (err) {
      console.error(err)
      setToast('❌ שגיאה – נסה שוב')
    }
    setLoading(false)
    e.target.value = ''
  }

  const handleDelete = async (doc) => {
    try {
      if (doc.storage_path) {
        await supabase.storage.from('medical-docs').remove([doc.storage_path])
      }
      await supabase.from('documents').delete().eq('id', doc.id)
      setToast('🗑️ המסמך נמחק')
    } catch {
      setToast('❌ שגיאה במחיקה')
    }
  }

  return (
    <div style={{ padding: '16px 14px 4px' }}>
      <SectionTitle>📂 מסמכים רפואיים</SectionTitle>

      <Card style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: SZ.md, fontWeight: 800, marginBottom: 14 }}>📤 העלאת מסמך חדש</div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>סוג המסמך</label>
          <select style={{ ...inputStyle, appearance: 'none' }} value={newDoc.type}
            onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}>
            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>שם הרופא (אופציונלי)</label>
          <input style={inputStyle} value={newDoc.doctor} placeholder="ד״ר כהן"
            onChange={e => setNewDoc({ ...newDoc, doctor: e.target.value })} />
        </div>

        <input ref={fileRef} type="file" accept="image/*,application/pdf"
          style={{ display: 'none' }} onChange={handleFile} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '18px 0', fontSize: SZ.md, color: C.muted }}>
            📤 מעלה...
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <BigBtn label="צלם תמונה" icon="📸" color={C.sky}
              onClick={() => { fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click() }}
              style={{ flex: 1 }} />
            <BigBtn label="בחר קובץ" icon="📁" color={C.purple}
              onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current.click() }}
              style={{ flex: 1 }} />
          </div>
        )}
      </Card>

      {docs.length === 0 ? (
        <Card style={{ padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
          <div style={{ fontSize: SZ.md, color: C.muted }}>עדיין לא הועלו מסמכים</div>
        </Card>
      ) : docs.map(doc => (
        <Card key={doc.id}>
          <div style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, overflow: 'hidden' }}>
                {doc.url && doc.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                  ? <img src={doc.url} style={{ width: 52, height: 52, objectFit: 'cover' }} alt="" />
                  : '📄'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: SZ.sm, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                <div style={{ fontSize: SZ.xs, color: C.muted, marginTop: 2 }}>
                  {doc.type} · {doc.date}{doc.doctor && ` · ${doc.doctor}`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {doc.url && (
                <a href={doc.url} target="_blank" rel="noreferrer" style={{ flex: 2, textDecoration: 'none' }}>
                  <div style={{ padding: '10px 0', borderRadius: 12, background: C.skyLight, color: C.sky, fontSize: SZ.sm, fontWeight: 700, textAlign: 'center' }}>👁️ פתח מסמך</div>
                </a>
              )}
              <button onClick={() => handleDelete(doc)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: C.redLight, color: C.red, border: 'none', fontSize: SZ.sm, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>🗑️ מחק</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
