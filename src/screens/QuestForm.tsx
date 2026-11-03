import { useRef, useState } from 'react'
import { QuestRow } from '../components/QuestRow'
import { Choice, Icon, Modal, useToast } from '../components/ui'
import { CATEGORIES, CATEGORY_ICON, DIFFICULTIES, FREQUENCIES, XP_BY_DIFFICULTY, type Category, type Difficulty, type Frequency } from '../lib/game'
import { useT, type Key } from '../lib/i18n'
import { go } from '../lib/router'
import { useStore } from '../lib/store'

type Errors = Partial<Record<'title' | 'minutes', Key>>

export function QuestForm({ id }: { id?: string }) {
  const { s, d } = useStore()
  const { t } = useT()
  const toast = useToast()
  const existing = id ? s.quests.find((q) => q.id === id) : undefined
  const [title, setTitle] = useState(existing?.title ?? '')
  const [category, setCategory] = useState<Category>(existing?.category ?? s.profile?.focus[0] ?? 'growth')
  const [frequency, setFrequency] = useState<Frequency>(existing?.frequency ?? 'daily')
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? 'easy')
  const [minutes, setMinutes] = useState(existing?.minutes ? String(existing.minutes) : '')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const minRef = useRef<HTMLInputElement>(null)

  if (id && !existing) {
    return (
      <div className="page">
        <div className="card empty">
          <span className="empty-art" aria-hidden="true">🔍</span>
          <h3>{t('q.emptyT')}</h3>
          <button className="btn btn-primary" onClick={() => go('/quests')}>{t('q.title')}</button>
        </div>
      </div>
    )
  }

  const validate = (): Errors => {
    const e: Errors = {}
    const v = title.trim()
    if (!v) e.title = 'f.errRequired'
    else if (v.length < 3) e.title = 'f.errShort'
    else if (v.length > 60) e.title = 'f.errLong'
    else if (s.quests.some((q) => q.id !== id && q.title.trim().toLowerCase() === v.toLowerCase())) e.title = 'f.errDup'
    if (minutes.trim()) {
      const n = Number(minutes)
      if (!Number.isInteger(n) || n < 1 || n > 600) e.minutes = 'f.errMin'
    }
    return e
  }

  const live = validate()
  const show = (f: keyof Errors) => (submitted || touched[f]) && live[f]

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    setSubmitted(true)
    const e = validate()
    if (e.title) return titleRef.current?.focus()
    if (e.minutes) return minRef.current?.focus()
    const data = { title: title.trim(), category, frequency, difficulty, minutes: minutes.trim() ? Number(minutes) : null }
    if (existing) {
      d({ type: 'updateQuest', id: existing.id, patch: data })
      toast({ text: t('f.saved'), icon: '✅' })
      go('/quests')
    } else {
      d({ type: 'addQuests', quests: [data] })
      toast({ text: t('f.created'), icon: '✨' })
      go('/today')
    }
  }

  const back = () => (history.length > 1 ? history.back() : go('/quests'))

  return (
    <div className="page form-page">
      <header className="page-head">
        <button className="btn btn-link btn-sm back-link" onClick={back}><Icon name="left" size={16} /> {t('ob.back')}</button>
        <h1>{existing ? t('f.edit') : t('f.new')}</h1>
      </header>

      <div className="form-grid">
        <form className="card quest-form" onSubmit={submit} noValidate>
          {submitted && Object.keys(live).length > 0 && (
            <p className="form-error form-summary" role="alert"><Icon name="alert" size={16} /> {t('f.errSummary')}</p>
          )}

          <div className="field">
            <label className="field-label" htmlFor="qt">{t('f.title')}</label>
            <input id="qt" ref={titleRef} className={`input input-lg ${show('title') ? 'is-invalid' : ''}`} value={title} maxLength={80}
              placeholder={t('f.titlePh')} autoFocus={!existing}
              aria-invalid={!!show('title')} aria-describedby={show('title') ? 'qt-err' : 'qt-help'}
              onChange={(e) => setTitle(e.target.value)} onBlur={() => setTouched((x) => ({ ...x, title: true }))} />
            <div className="field-foot">
              {show('title')
                ? <span className="field-err" id="qt-err"><Icon name="alert" size={14} /> {t(live.title!)}</span>
                : <span className="field-help" id="qt-help">{t('f.titleHelp')}</span>}
              <span className={`char-count num ${title.trim().length > 60 ? 'is-over' : ''}`}>{title.trim().length}/60</span>
            </div>
          </div>

          <fieldset className="field">
            <legend className="field-label">{t('f.category')}</legend>
            <Choice name="cat" value={category} columns={3} onChange={setCategory}
              options={CATEGORIES.map((c) => ({ value: c, label: t(`cat.${c}`), icon: CATEGORY_ICON[c] }))} />
          </fieldset>

          <fieldset className="field">
            <legend className="field-label">{t('f.freq')}</legend>
            <Choice name="freq" value={frequency} columns={2} onChange={setFrequency}
              options={FREQUENCIES.map((f) => ({ value: f, label: t(`freq.${f}`), desc: t(`freqd.${f}`), icon: <Icon name={f === 'once' ? 'clock' : 'repeat'} size={18} /> }))} />
          </fieldset>

          <fieldset className="field">
            <legend className="field-label">{t('f.diff')}</legend>
            <Choice name="diff" value={difficulty} columns={3} onChange={setDifficulty}
              options={DIFFICULTIES.map((x) => ({ value: x, label: t(`diff.${x}`), desc: t(`diffd.${x}`), extra: <span className="xp-chip">+{XP_BY_DIFFICULTY[x]} XP</span> }))} />
          </fieldset>

          <div className="field">
            <label className="field-label" htmlFor="qm">{t('f.minutes')} <span className="optional">({t('f.optional')})</span></label>
            <div className="input-suffix">
              <input id="qm" ref={minRef} className={`input ${show('minutes') ? 'is-invalid' : ''}`} inputMode="numeric" value={minutes} placeholder="20"
                aria-invalid={!!show('minutes')} aria-describedby={show('minutes') ? 'qm-err' : undefined}
                onChange={(e) => setMinutes(e.target.value.replace(/[^\d]/g, '').slice(0, 4))} onBlur={() => setTouched((x) => ({ ...x, minutes: true }))} />
              <span>{t('f.minSuffix')}</span>
            </div>
            {show('minutes') && <span className="field-err" id="qm-err"><Icon name="alert" size={14} /> {t(live.minutes!)}</span>}
          </div>

          <div className="form-actions">
            {existing && <button type="button" className="btn btn-ghost is-danger-text" onClick={() => setConfirmDel(true)}><Icon name="trash" size={18} /> {t('q.delete')}</button>}
            <span className="spacer" />
            <button type="button" className="btn btn-ghost" onClick={back}>{t('q.cancel')}</button>
            <button type="submit" className="btn btn-primary">{existing ? t('f.save') : t('f.create')}</button>
          </div>
        </form>

        <aside className="form-preview" aria-label={t('f.preview')}>
          <p className="field-label">{t('f.preview')}</p>
          <ul className="qlist">
            <QuestRow q={{ title: title.trim() || t('f.titlePh'), category, difficulty, minutes: minutes && !live.minutes ? Number(minutes) : null, frequency }} done={false} />
          </ul>
          <p className="reward-note"><Icon name="bolt" size={16} /> {t('f.reward', { xp: XP_BY_DIFFICULTY[difficulty] })}</p>
        </aside>
      </div>

      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} labelledBy="fdel">
        <div className="confirm">
          <span className="confirm-icon is-danger" aria-hidden="true"><Icon name="trash" size={24} /></span>
          <h2 id="fdel">{t('q.delTitle', { q: existing?.title ?? '' })}</h2>
          <p>{t('q.delText')}</p>
          <div className="confirm-actions">
            <button className="btn btn-ghost" data-autofocus onClick={() => setConfirmDel(false)}>{t('q.cancel')}</button>
            <button className="btn btn-danger" onClick={() => { d({ type: 'deleteQuest', id: existing!.id }); toast({ text: t('q.deleted'), icon: '🗑️' }); go('/quests') }}>{t('q.delete')}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
