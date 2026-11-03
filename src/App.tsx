import { useEffect } from 'react'
import { ToastProvider } from './components/ui'
import { LangProvider } from './lib/i18n'
import { go, useRoute } from './lib/router'
import { setSoundEnabled } from './lib/sound'
import { StoreProvider, useStore } from './lib/store'
import { AppShell } from './screens/AppShell'
import { Landing } from './screens/Landing'
import { Onboarding } from './screens/Onboarding'
import { Profile } from './screens/Profile'
import { Progress } from './screens/Progress'
import { QuestForm } from './screens/QuestForm'
import { Quests } from './screens/Quests'
import { Today } from './screens/Today'

function Router() {
  const { s } = useStore()
  const path = useRoute()
  const needsProfile = !['/', '/start'].includes(path)

  useEffect(() => { if (needsProfile && !s.profile) go('/') }, [needsProfile, s.profile])
  useEffect(() => { setSoundEnabled(s.settings.sound) }, [s.settings.sound])
  useEffect(() => {
    const root = document.documentElement
    root.lang = s.settings.lang
    if (s.settings.theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', s.settings.theme)
  }, [s.settings.lang, s.settings.theme])
  useEffect(() => {
    const names: Record<string, string> = { '/today': 'Today', '/quests': 'Quests', '/progress': 'Progress', '/profile': 'Profile', '/start': 'Get started' }
    document.title = names[path] ? `${names[path]} · LevelUp` : 'LevelUp'
  }, [path])

  if (path === '/') return <Landing />
  if (path === '/start') return <Onboarding />
  if (!s.profile) return null

  const edit = path.match(/^\/quests\/([^/]+)\/edit$/)
  const screen =
    path === '/today' ? <Today /> :
    path === '/quests' ? <Quests /> :
    path === '/quests/new' ? <QuestForm key="new" /> :
    edit ? <QuestForm key={edit[1]} id={edit[1]} /> :
    path === '/progress' ? <Progress /> :
    path === '/profile' ? <Profile /> :
    <Today />
  return <AppShell path={path}>{screen}</AppShell>
}

function WithLang() {
  const { s } = useStore()
  return (
    <LangProvider lang={s.settings.lang}>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </LangProvider>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <WithLang />
    </StoreProvider>
  )
}
