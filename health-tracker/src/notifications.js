// Push Notifications helper

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

export function scheduleNotification(title, body, delayMs) {
  if (Notification.permission !== 'granted') return
  if (delayMs <= 0) {
    new Notification(title, { body, icon: '/icon-192.png', dir: 'rtl', lang: 'he' })
    return
  }
  setTimeout(() => {
    new Notification(title, { body, icon: '/icon-192.png', dir: 'rtl', lang: 'he' })
  }, delayMs)
}

// Schedule daily medication reminders
export function scheduleMedReminders(medications) {
  if (Notification.permission !== 'granted') return
  medications.forEach(med => {
    med.times.forEach(timeStr => {
      const [h, m] = timeStr.split(':').map(Number)
      const now = new Date()
      const target = new Date()
      target.setHours(h, m, 0, 0)
      if (target <= now) target.setDate(target.getDate() + 1)
      const delay = target - now
      setTimeout(() => {
        new Notification(`💊 זמן לתרופה!`, {
          body: `${med.name} ${med.dose} – ${timeStr}`,
          icon: '/icon-192.png', dir: 'rtl', lang: 'he',
        })
      }, delay)
    })
  })
}

// Schedule appointment reminder (1 day before + 2 hours before)
export function scheduleApptReminders(appt) {
  if (Notification.permission !== 'granted') return
  const [h, m] = appt.time.split(':').map(Number)
  const apptTime = new Date(appt.date)
  apptTime.setHours(h, m, 0, 0)
  const now = new Date()

  // 1 day before
  const dayBefore = new Date(apptTime - 24 * 60 * 60 * 1000)
  if (dayBefore > now) {
    setTimeout(() => {
      new Notification('📅 תזכורת תור – מחר!', {
        body: `${appt.doctor} מחר בשעה ${appt.time} ב${appt.place}`,
        icon: '/icon-192.png', dir: 'rtl', lang: 'he',
      })
    }, dayBefore - now)
  }

  // 2 hours before
  const twoHoursBefore = new Date(apptTime - 2 * 60 * 60 * 1000)
  if (twoHoursBefore > now) {
    setTimeout(() => {
      new Notification('📅 תזכורת תור – בעוד שעתיים!', {
        body: `${appt.doctor} בשעה ${appt.time} ב${appt.place}`,
        icon: '/icon-192.png', dir: 'rtl', lang: 'he',
      })
    }, twoHoursBefore - now)
  }
}

export function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'he-IL'; u.rate = 0.88; u.pitch = 1
  const voices = window.speechSynthesis.getVoices()
  const heVoice = voices.find(v => v.lang.startsWith('he'))
  if (heVoice) u.voice = heVoice
  window.speechSynthesis.speak(u)
}
