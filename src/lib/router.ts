import { useEffect, useState } from 'react'

// Hash routes (#/today) work on any static host without server rewrites.
const read = () => (location.hash.replace(/^#/, '') || '/').split('?')[0]

export function useRoute() {
  const [path, setPath] = useState(read)
  useEffect(() => {
    const on = () => { setPath(read()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return path
}

export const go = (path: string) => { location.hash = path }
