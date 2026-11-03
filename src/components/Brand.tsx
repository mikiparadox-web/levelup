import { useStore } from '../lib/store'
import { useT } from '../lib/i18n'

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="9" fill="var(--brand)" />
        <path d="M10 20.5 16 14l6 6.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 14.5 16 8l6 6.5" fill="none" stroke="var(--xp)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="logo-word">Level<b>Up</b></span>
    </span>
  )
}

export function LangSwitch() {
  const { s, d } = useStore()
  const { t } = useT()
  return (
    <div className="lang-switch" role="group" aria-label={t('pr.lang')}>
      {(['en', 'th'] as const).map((l) => (
        <button key={l} className={s.settings.lang === l ? 'is-on' : ''} aria-pressed={s.settings.lang === l} onClick={() => d({ type: 'settings', patch: { lang: l } })}>
          {l === 'en' ? 'EN' : 'ไทย'}
        </button>
      ))}
    </div>
  )
}
