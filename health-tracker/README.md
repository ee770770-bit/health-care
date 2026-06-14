# 🏥 מעקב בריאות – הוראות התקנה

## שלב 1 – Supabase (בסיס נתונים)

1. צור חשבון חינמי ב-[supabase.com](https://supabase.com)
2. לחץ **New Project**
3. לך ל-**Settings → API** והעתק:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### הרץ ב-SQL Editor של Supabase:

```sql
CREATE TABLE appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  doctor text NOT NULL, date date NOT NULL, time text NOT NULL,
  place text, phone text, notes text, color text DEFAULT '#2A7FBF',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON appointments FOR ALL USING (auth.uid() = user_id);

CREATE TABLE medications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL, dose text, times text[] DEFAULT '{}',
  color text DEFAULT '#2A7FBF', created_at timestamptz DEFAULT now()
);
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON medications FOR ALL USING (auth.uid() = user_id);

CREATE TABLE med_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  med_id uuid REFERENCES medications NOT NULL,
  time_slot text NOT NULL, date date NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE med_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON med_logs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text, type text, doctor text, date date,
  url text, storage_path text, summary text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON documents FOR ALL USING (auth.uid() = user_id);

CREATE TABLE vitals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL, bp text, pulse text, sugar text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON vitals FOR ALL USING (auth.uid() = user_id);

CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  name text, updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON profiles FOR ALL USING (auth.uid() = id);
```

### Storage:
1. לך ל-**Storage → New Bucket**: שם `medical-docs`, סמן **Public**
2. הוסף Policy: authenticated users יכולים INSERT/SELECT/DELETE

---

## שלב 2 – הגדרת הפרויקט

```bash
cp .env.example .env
# ערוך .env והכנס את הערכים מ-Supabase
npm install
npm run dev
```

---

## שלב 3 – פריסה ב-Vercel

1. [vercel.com](https://vercel.com) → **Add New Project**
2. העלה את התיקייה
3. הוסף Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy** ✅

---

## ממשק בני משפחה

לאחר כניסה, לחץ **"שתף עם בני המשפחה"** – יועתק לינק כזה:
`https://your-app.vercel.app/?family=USER_ID`

---

## כל הפיצ'רים

✅ כניסה/הרשמה | ✅ תורים (הוספה/עריכה/מחיקה) | ✅ מעקב תרופות יומי
✅ העלאת מסמכים + ניתוח AI | ✅ עוזר AI | ✅ מעקב ערכים רפואיים
✅ תזכורת קולית | ✅ התראות דפדפן | ✅ ממשק בני משפחה | ✅ SOS
