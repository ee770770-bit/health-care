export const C = {
  sky: '#2A7FBF', skyLight: '#E6F2FA', skyDark: '#1A5A8A',
  green: '#3DA874', greenLight: '#E6F5EE',
  orange: '#E8774A', orangeLight: '#FDF0EA',
  red: '#D94F4F', redLight: '#FDEAEA',
  purple: '#7060B0', purpleLight: '#EFECF8',
  bg: '#F0F4F8', card: '#FFFFFF',
  text: '#18293C', muted: '#607080', border: '#D8E4EF',
}

export const FONT = "'Heebo','Arial Hebrew',Arial,sans-serif"
export const SZ = { xs: 13, sm: 15, md: 17, lg: 20, xl: 24, xxl: 30 }

export const APT_COLORS = [C.sky, C.green, C.purple, C.orange, C.red]
export const DOC_TYPES = ['בדיקת דם','צילום רנטגן','אולטרסאונד','מרשם','מכתב רופא','תוצאות CT','אחר']

export const ENCOURAGEMENTS = [
  'כל יום שאתה שומר על הבריאות שלך הוא ניצחון. כל הכבוד! 💪',
  'אתה לא לבד – כל התור הזה הוא השקעה שמשפחתך גאה בה ❤️',
  'לקחת תרופות בזמן זה אחריות ואהבה עצמית. מעולה!',
  'הגוף שלך עובד קשה. תמשיך לתת לו את מה שהוא צריך 🌟',
  'כל צעד קטן של טיפול עצמי בונה עתיד בריא יותר 🌈',
]

export const todayKey = () => new Date().toISOString().slice(0, 10)
export const fmtDate = ds =>
  new Date(ds).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
export const daysLeft = ds =>
  Math.round((new Date(ds) - new Date(todayKey())) / 86400000)
export const uid = () => Date.now() + Math.random()
