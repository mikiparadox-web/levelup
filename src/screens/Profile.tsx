import { useState } from 'react'
import { AVATARS, Avatar, Bar, Icon, Modal, useToast } from '../components/ui'
import { CATEGORIES, CATEGORY_ICON, type Category } from '../lib/game'
import { fmtDate, fmtNum, useT } from '../lib/i18n'
import { go } from '../lib/router'
import { useStore, type Theme } from '../lib/store'
import { useGame } from '../lib/useGame'

export function Profile() {
  const { s, d } = useStore()
  const { t, lang } = useT()
  const g = useGame()
  const toast = useToast()
  const p = s.profile!
  const [name, setName] = useState(p.name)
  const [avatar, setAvatar] = useState(p.avatar)
  const [focus, setFocus] = useState<Category[]>(p.focus)
  const [err, setErr] = useState('')
  const [reset, setReset] = useState(false)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length > 20) return setErr(t('ob.nameErr'))
    d({ type: 'profile', patch: { name: name.trim(), avatar, focus: focus.length ? focus : p.focus } })
    toast({ text: t('pr.saved'), icon: '✅' })
  }

  return (
    <div className="page profile">
      <header className="page-head"><h1>{t('pr.title')}</h1></header>

      <div className="profile-grid">
        <form className="card" onSubmit={save} noValidate aria-labelledby="pc">
          <h2 id="pc" className="card-title">{t('pr.character')}</h2>
          <div className="profile-hero">
            <Avatar emoji={avatar} size={72} />
            <div>
              <b className="profile-name">{name.trim() || p.name}</b>
              <p className="muted small">{t('u.level', { n: g.lvl.level })} · {fmtNum(g.xp, lang)} XP</p>
              <p className="muted tiny">{t('pr.since', { date: fmtDate(p.createdAt, lang) })}</p>
            </div>
          </div>
          <Bar value={g.lvl.pct} label="XP" />

          <label className="field">
            <span className="field-label">{t('ob.name')}</span>
            <input className={`input ${err ? 'is-invalid' : ''}`} value={name} maxLength={20} aria-invalid={!!err} aria-describedby={err ? 'pn-err' : undefined}
              onChange={(e) => { setName(e.target.value); setErr('') }} />
            {err && <span className="field-err" id="pn-err"><Icon name="alert" size={14} /> {err}</span>}
          </label>

          <fieldset className="field">
            <legend className="field-label">{t('ob.avatar')}</legend>
            <div className="avatar-grid avatar-grid-sm">
              {AVATARS.map((a) => (
                <label key={a} className={`avatar-opt ${avatar === a ? 'is-on' : ''}`}>
                  <input type="radio" name="pavatar" checked={avatar === a} onChange={() => setAvatar(a)} aria-label={a} />
                  <span aria-hidden="true">{a}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend className="field-label">{t('pr.focus')}</legend>
            <div className="chip-row">
              {CATEGORIES.map((c) => (
                <label key={c} className={`chip ${focus.includes(c) ? 'is-on' : ''}`}>
                  <input type="checkbox" checked={focus.includes(c)} onChange={() => setFocus((f) => (f.includes(c) ? f.filter((x) => x !== c) : [...f, c]))} />
                  <span aria-hidden="true">{CATEGORY_ICON[c]}</span> {t(`cat.${c}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-actions"><span className="spacer" /><button className="btn btn-primary" type="submit">{t('pr.save')}</button></div>
        </form>

        <div className="profile-side">
          <section className="card" aria-labelledby="set-t">
            <h2 id="set-t" className="card-title">{t('nav.profile')}</h2>
            <div className="setting">
              <span>{t('pr.lang')}</span>
              <div className="seg" role="group" aria-label={t('pr.lang')}>
                {(['en', 'th'] as const).map((l) => (
                  <button key={l} type="button" className={s.settings.lang === l ? 'is-on' : ''} aria-pressed={s.settings.lang === l} onClick={() => d({ type: 'settings', patch: { lang: l } })}>{l === 'en' ? 'English' : 'ไทย'}</button>
                ))}
              </div>
            </div>
            <div className="setting">
              <span>{t('pr.theme')}</span>
              <div className="seg" role="group" aria-label={t('pr.theme')}>
                {(['light', 'dark', 'system'] as Theme[]).map((th) => (
                  <button key={th} type="button" className={s.settings.theme === th ? 'is-on' : ''} aria-pressed={s.settings.theme === th} onClick={() => d({ type: 'settings', patch: { theme: th } })}>{t(`pr.${th}`)}</button>
                ))}
              </div>
            </div>
            <div className="setting">
              <span>{t('pr.sound')}</span>
              <div className="seg" role="group" aria-label={t('pr.sound')}>
                {[true, false].map((on) => (
                  <button key={String(on)} type="button" className={s.settings.sound === on ? 'is-on' : ''} aria-pressed={s.settings.sound === on} onClick={() => d({ type: 'settings', patch: { sound: on } })}>{t(on ? 'pr.on' : 'pr.off')}</button>
                ))}
              </div>
            </div>
          </section>

          <section className="card" aria-labelledby="data-t">
            <h2 id="data-t" className="card-title">{t('pr.data')}</h2>
            <p className="muted small">{t('pr.dataD')}</p>
            {s.demo && <p className="small">🧪 {t('pr.demoNote')}</p>}
            <div className="data-actions">
              {s.demo && <button className="btn btn-ghost" onClick={() => { d({ type: 'reset' }); go('/start') }}>{t('pr.demoBtn')}</button>}
              <button className="btn btn-ghost is-danger-text" onClick={() => setReset(true)}><Icon name="trash" size={18} /> {t('pr.reset')}</button>
            </div>
          </section>
        </div>
      </div>

      <Modal open={reset} onClose={() => setReset(false)} labelledBy="rs-t">
        <div className="confirm">
          <span className="confirm-icon is-danger" aria-hidden="true"><Icon name="alert" size={24} /></span>
          <h2 id="rs-t">{t('pr.resetT')}</h2>
          <p>{t('pr.resetD')}</p>
          <div className="confirm-actions">
            <button className="btn btn-ghost" data-autofocus onClick={() => setReset(false)}>{t('q.cancel')}</button>
            <button className="btn btn-danger" onClick={() => { d({ type: 'reset' }); go('/') }}>{t('pr.resetBtn')}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
