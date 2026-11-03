import type { Category, Difficulty, Frequency } from './game'
import type { Lang } from './i18n'

export interface Template {
  en: string
  th: string
  category: Category
  difficulty: Difficulty
  frequency: Frequency
  minutes: number | null
}

const T = (en: string, th: string, category: Category, difficulty: Difficulty, minutes: number | null, frequency: Frequency = 'daily'): Template =>
  ({ en, th, category, difficulty, minutes, frequency })

/** Starter quests shown during onboarding, three per goal area. */
export const STARTERS: Record<Category, Template[]> = {
  fitness: [
    T('Walk for 15 minutes', 'เดิน 15 นาที', 'fitness', 'easy', 15),
    T('Do 20 push-ups', 'วิดพื้น 20 ครั้ง', 'fitness', 'easy', 5),
    T('Work out for 30 minutes', 'ออกกำลังกาย 30 นาที', 'fitness', 'hard', 30, 'weekdays'),
  ],
  study: [
    T('Practice English for 20 minutes', 'ฝึกภาษาอังกฤษ 20 นาที', 'study', 'medium', 20),
    T('Learn 10 new words', 'ท่องศัพท์ใหม่ 10 คำ', 'study', 'easy', 10),
    T('Review class notes for 30 minutes', 'ทบทวนบทเรียน 30 นาที', 'study', 'medium', 30, 'weekdays'),
  ],
  career: [
    T('Learn a work skill for 25 minutes', 'เรียนทักษะเพื่องาน 25 นาที', 'career', 'medium', 25, 'weekdays'),
    T('Update my portfolio', 'อัปเดตพอร์ตโฟลิโอ', 'career', 'medium', 45, 'weekends'),
    T('Send one job application', 'สมัครงาน 1 ที่', 'career', 'medium', 30, 'weekdays'),
  ],
  growth: [
    T('Read 10 pages', 'อ่านหนังสือ 10 หน้า', 'growth', 'easy', 15),
    T('Write 3 things I’m grateful for', 'เขียน 3 เรื่องที่รู้สึกขอบคุณ', 'growth', 'easy', 5),
    T('Plan tomorrow in 5 minutes', 'วางแผนพรุ่งนี้ 5 นาที', 'growth', 'easy', 5),
  ],
  health: [
    T('Drink 8 glasses of water', 'ดื่มน้ำ 8 แก้ว', 'health', 'easy', null),
    T('Sleep before 11 pm', 'เข้านอนก่อน 5 ทุ่ม', 'health', 'medium', null),
    T('Eat a portion of vegetables', 'กินผัก 1 มื้อ', 'health', 'easy', null),
  ],
  creative: [
    T('Sketch for 15 minutes', 'สเก็ตช์ภาพ 15 นาที', 'creative', 'easy', 15),
    T('Write 200 words', 'เขียน 200 คำ', 'creative', 'medium', 20),
    T('Practice an instrument for 20 minutes', 'ซ้อมดนตรี 20 นาที', 'creative', 'medium', 20),
  ],
}

interface Rule { match: RegExp; quests: Template[] }

// Topic rules for the quest helper. Each turns a broad goal into three small, concrete steps.
const RULES: Rule[] = [
  { match: /english|vocab|ielts|toefl|toeic|อังกฤษ|ภาษา|ศัพท์/i, quests: [
    T('Learn 10 new English words', 'ท่องศัพท์ภาษาอังกฤษ 10 คำ', 'study', 'easy', 10),
    T('Read an English article for 15 minutes', 'อ่านบทความภาษาอังกฤษ 15 นาที', 'study', 'medium', 15),
    T('Speak English out loud for 5 minutes', 'พูดภาษาอังกฤษออกเสียง 5 นาที', 'study', 'easy', 5),
  ] },
  { match: /japan|chinese|korean|french|spanish|ญี่ปุ่น|จีน|เกาหลี|ฝรั่งเศส/i, quests: [
    T('Learn 5 new words', 'ท่องศัพท์ใหม่ 5 คำ', 'study', 'easy', 10),
    T('Do one lesson in a language app', 'เรียน 1 บทในแอปภาษา', 'study', 'easy', 15),
    T('Listen to a podcast in the language for 10 minutes', 'ฟังพอดแคสต์ภาษานั้น 10 นาที', 'study', 'medium', 10),
  ] },
  { match: /read|book|อ่าน|หนังสือ/i, quests: [
    T('Read 10 pages', 'อ่านหนังสือ 10 หน้า', 'growth', 'easy', 15),
    T('Write one sentence about what I read', 'เขียนสรุปสิ่งที่อ่าน 1 ประโยค', 'growth', 'easy', 5),
    T('Put my phone away while reading', 'วางโทรศัพท์ไว้ไกล ๆ ตอนอ่าน', 'growth', 'easy', null),
  ] },
  { match: /fit|exercise|gym|workout|run|weight|muscle|ออกกำลัง|วิ่ง|ลดน้ำหนัก|ฟิต|ยิม|กล้าม/i, quests: [
    T('Walk for 15 minutes', 'เดิน 15 นาที', 'fitness', 'easy', 15),
    T('Do a 10-minute home workout', 'ออกกำลังกายที่บ้าน 10 นาที', 'fitness', 'medium', 10),
    T('Stretch for 5 minutes before bed', 'ยืดเหยียด 5 นาทีก่อนนอน', 'fitness', 'easy', 5),
  ] },
  { match: /sleep|tired|นอน|ง่วง|เหนื่อย/i, quests: [
    T('No screens 30 minutes before bed', 'งดจอ 30 นาทีก่อนนอน', 'health', 'medium', null),
    T('Go to bed before 11 pm', 'เข้านอนก่อน 5 ทุ่ม', 'health', 'medium', null),
    T('Get 10 minutes of morning sunlight', 'รับแดดเช้า 10 นาที', 'health', 'easy', 10),
  ] },
  { match: /code|coding|program|developer|react|python|เขียนโปรแกรม|โค้ด/i, quests: [
    T('Code for 25 minutes', 'เขียนโค้ด 25 นาที', 'career', 'medium', 25),
    T('Solve one small coding exercise', 'แก้โจทย์โค้ดสั้น ๆ 1 ข้อ', 'career', 'medium', 20),
    T('Write down one thing I learned', 'จดสิ่งที่เรียนรู้วันนี้ 1 อย่าง', 'career', 'easy', 5),
  ] },
  { match: /job|career|interview|work|promotion|resume|portfolio|งาน|สัมภาษณ์|เรซูเม่|พอร์ต/i, quests: [
    T('Improve one section of my resume', 'ปรับเรซูเม่ 1 ส่วน', 'career', 'medium', 20, 'weekdays'),
    T('Practice one interview question out loud', 'ซ้อมตอบคำถามสัมภาษณ์ 1 ข้อ', 'career', 'easy', 10, 'weekdays'),
    T('Send one job application', 'สมัครงาน 1 ที่', 'career', 'medium', 30, 'weekdays'),
  ] },
  { match: /money|save|saving|budget|invest|เงิน|ออม|เก็บเงิน|ประหยัด/i, quests: [
    T('Write down today’s spending', 'จดรายจ่ายวันนี้', 'growth', 'easy', 5),
    T('Skip one thing I don’t need to buy', 'งดซื้อของที่ไม่จำเป็น 1 อย่าง', 'growth', 'medium', null),
    T('Move a little money into savings', 'โอนเงินเข้าบัญชีออมนิดหน่อย', 'growth', 'easy', null, 'weekends'),
  ] },
  { match: /stress|calm|anxiety|meditat|mind|เครียด|สมาธิ|ใจเย็น|กังวล/i, quests: [
    T('Breathe slowly for 3 minutes', 'หายใจช้า ๆ 3 นาที', 'health', 'easy', 3),
    T('Take a 10-minute walk without my phone', 'เดินเล่น 10 นาทีโดยไม่ใช้โทรศัพท์', 'health', 'easy', 10),
    T('Write down what’s on my mind', 'เขียนสิ่งที่อยู่ในใจออกมา', 'growth', 'easy', 5),
  ] },
  { match: /draw|art|paint|design|วาด|ศิลป|ออกแบบ/i, quests: [
    T('Sketch for 15 minutes', 'สเก็ตช์ภาพ 15 นาที', 'creative', 'easy', 15),
    T('Copy one artwork I like', 'ลองวาดตามงานที่ชอบ 1 ชิ้น', 'creative', 'medium', 30),
    T('Save 3 pieces of inspiration', 'เก็บภาพแรงบันดาลใจ 3 ภาพ', 'creative', 'easy', 5),
  ] },
  { match: /music|guitar|piano|sing|ดนตรี|กีตาร์|เปียโน|ร้องเพลง/i, quests: [
    T('Practice for 20 minutes', 'ซ้อม 20 นาที', 'creative', 'medium', 20),
    T('Learn one new chord or scale', 'ฝึกคอร์ดหรือสเกลใหม่ 1 อัน', 'creative', 'easy', 10),
    T('Play one song from start to finish', 'เล่นเพลง 1 เพลงจนจบ', 'creative', 'medium', 10),
  ] },
  { match: /exam|test|study|school|university|สอบ|เรียน|มหาลัย/i, quests: [
    T('Study for 25 minutes, phone away', 'อ่านหนังสือ 25 นาทีแบบไม่จับโทรศัพท์', 'study', 'medium', 25),
    T('Do 5 practice questions', 'ทำแบบฝึกหัด 5 ข้อ', 'study', 'medium', 15),
    T('Review today’s notes for 10 minutes', 'ทบทวนโน้ตวันนี้ 10 นาที', 'study', 'easy', 10),
  ] },
  { match: /water|eat|diet|health|healthy|น้ำ|กิน|อาหาร|สุขภาพ/i, quests: [
    T('Drink 8 glasses of water', 'ดื่มน้ำ 8 แก้ว', 'health', 'easy', null),
    T('Eat a portion of vegetables', 'กินผัก 1 มื้อ', 'health', 'easy', null),
    T('Skip sugary drinks today', 'งดเครื่องดื่มหวานวันนี้', 'health', 'medium', null),
  ] },
]

/** Breaks a broad goal into three small quests. Built-in rules, so it works offline;
 *  an AI model can replace this function later without changing the UI. */
export function suggestQuests(goal: string): Template[] {
  const g = goal.trim()
  const rule = RULES.find((r) => r.match.test(g))
  if (rule) return rule.quests
  const short = g.length > 28 ? g.slice(0, 26).trim() + '…' : g
  return [
    T(`Spend 10 minutes on “${short}”`, `ใช้เวลา 10 นาทีกับ “${short}”`, 'growth', 'easy', 10),
    T(`Learn one small thing about “${short}”`, `เรียนรู้เรื่องเล็ก ๆ 1 อย่างเกี่ยวกับ “${short}”`, 'growth', 'easy', 10),
    T(`Write down my next step for “${short}”`, `เขียนก้าวถัดไปของ “${short}”`, 'growth', 'easy', 5),
  ]
}

export const tplTitle = (tp: Template, lang: Lang) => (lang === 'th' ? tp.th : tp.en)
