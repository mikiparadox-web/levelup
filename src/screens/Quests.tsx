import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Icon, Modal, useToast } from '../components/ui'
import { CATEGORY_ICON, XP_BY_DIFFICULTY, type Quest } from '../lib/game'
import { suggestQuests, tplTitle, type Template } from '../lib/helper'
import { useT } from '../lib/i18n'
import { go } from '../lib/router'
import { useStore } from '../lib/store'

function QuestHelper() {
  const { t, lang } = useT()
  const { d } = useStore()
  const toast = useToast()
  const [goal, setGoal] = useState('')
  const [err, setErr] = useState('')
  const [items, setItems] = useState<{ tp: Template; title: string; on: boolean }[] | null>(null)

  const suggest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim()) return setErr(t('h.err'))
    setErr('')
    setItems(suggestQuests(goal).map((tp) => ({ tp, title: tplTitle(tp, lang), on: true })))
  }
  const chosen = items?.filter((i) => i.on && i.title.trim().length >= 3) ?? []
  const add = () => {
    d({ type: 'addQuests', quests: chosen.map((i) => ({ title: i.title.trim().slice(0, 60), category: i.tp.category, frequency: i.tp.frequency, difficulty: i.tp.difficulty, minutes: i.tp.minutes })) })
    toast({ text: t('h.added', { n: chosen.length }), icon: '🪄' })
    setItems(null); setGoal('')
  }

  return (
    <section className="card helper" aria-labelledby="helper-t">
      <div className="helper-head">
        <span className="helper-icon" aria-hidden="true"><Icon name="wand" size={22} /></span>
        <div>
          <h2 id="helper-t" className="card-title">{t('h.title')}</h2>
          <p className="muted small">{t('h.desc')}</p>
        </div>
      </div>
      {!items ? (
        <form className="helper-form" onSubmit={suggest} noValidate>
          <label className="sr-only" htmlFor="goal">{t('h.title')}</label>
          <input id="goal" className={`input ${err ? 'is-invalid' : ''}`} value={goal} placeholder={t('h.ph')} maxLength={80}
            aria-invalid={!!err} aria-describedby={err ? 'goal-err' : undefined} onChange={(e) => { setGoal(e.target.value); setErr('') }} />
          <button className="btn btn-primary" type="submit">{t('h.go')}</button>
          {err && <p className="form-error" id="goal-err" role="alert"><Icon name="alert" size={16} /> {err}</p>}
        </form>
      ) : (
        <div className="helper-results">
          <p className="field-label">{t('h.results')}</p>
          <ul className="helper-list">
            {items.map((it, i) => (
              <li key={i} className={it.on ? 'is-on' : ''}>
                <input type="checkbox" checked={it.on} aria-label={it.title} onChange={() => setItems(items.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))} />
                <span aria-hidden="true">{CATEGORY_ICON[it.tp.category]}</span>
                <input className="input input-sm" value={it.title} maxLength={60} aria-label={`${t('q.edit')}: ${it.title}`}
                  onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                <span className="xp-chip">+{XP_BY_DIFFICULTY[it.tp.difficulty]}</span>
              </li>
            ))}
          </ul>
          <div className="helper-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setItems(null)}>{t('h.again')}</button>
            <button className="btn btn-primary" disabled={!chosen.length} onClick={add}>
              {chosen.length === 1 ? t('h.add1') : t('h.add', { n: chosen.length })}
            </button>
          </div>
          <p className="muted tiny">{t('h.note')}</p>
        </div>
      )}
    </section>
  )
}

export function Quests() {
  const { s, d } = useStore()
  const { t } = useT()
  const toast = useToast()
  const [del, setDel] = useState<Quest | null>(null)
  const count = (id: string) => s.completions.filter((c) => c.questId === id).length

  return (
    <div className="page">
      <header className="page-head page-head-row">
        <div>
          <h1>{t('q.title')}</h1>
          <p className="page-sub">{t('q.sub')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => go('/quests/new')}><Icon name="plus" /> {t('nav.newQuest')}</button>
      </header>

      <div className="quests-grid">
        <section className="card" aria-labelledby="allq">
          <div className="card-head">
            <h2 id="allq" className="card-title">{t('q.title')}</h2>
            <span className="count-pill">{t('q.count', { n: s.quests.length })}</span>
          </div>
          {s.quests.length === 0 ? (
            <div className="empty">
              <span className="empty-art" aria-hidden="true">📜</span>
              <h3>{t('q.emptyT')}</h3>
              <p>{t('q.emptyD')}</p>
              <button className="btn btn-primary" onClick={() => go('/quests/new')}><Icon name="plus" /> {t('nav.newQuest')}</button>
            </div>
          ) : (
            <ul className="manage-list">
              <AnimatePresence initial={false}>
                {s.quests.map((q) => (
                  <motion.li key={q.id} layout exit={{ opacity: 0, height: 0 }} className={`manage-row cat-${q.category}`}>
                    <span className="manage-icon" aria-hidden="true">{CATEGORY_ICON[q.category]}</span>
                    <div className="manage-body">
                      <b>{q.title}</b>
                      <small>
                        {t(`cat.${q.category}`)} · {t(`freq.${q.frequency}`)} · {t(`diff.${q.difficulty}`)}
                        {q.minutes ? ` · ${t('u.min', { n: q.minutes })}` : ''}
                        {count(q.id) > 0 && ` · ${t('q.doneTimes', { n: count(q.id) })}`}
                      </small>
                    </div>
                    <span className="xp-chip">+{XP_BY_DIFFICULTY[q.difficulty]}</span>
                    <div className="manage-actions">
                      <button className="icon-btn" onClick={() => go(`/quests/${q.id}/edit`)} aria-label={`${t('q.edit')}: ${q.title}`} title={t('q.edit')}><Icon name="edit" size={18} /></button>
                      <button className="icon-btn is-danger" onClick={() => setDel(q)} aria-label={`${t('q.delete')}: ${q.title}`} title={t('q.delete')}><Icon name="trash" size={18} /></button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </section>
        <QuestHelper />
      </div>

      <Modal open={!!del} onClose={() => setDel(null)} labelledBy="del-t">
        <div className="confirm">
          <span className="confirm-icon is-danger" aria-hidden="true"><Icon name="trash" size={24} /></span>
          <h2 id="del-t">{t('q.delTitle', { q: del?.title ?? '' })}</h2>
          <p>{t('q.delText')}</p>
          <div className="confirm-actions">
            <button className="btn btn-ghost" data-autofocus onClick={() => setDel(null)}>{t('q.cancel')}</button>
            <button className="btn btn-danger" onClick={() => { d({ type: 'deleteQuest', id: del!.id }); toast({ text: t('q.deleted'), icon: '🗑️' }); setDel(null) }}>{t('q.delete')}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
