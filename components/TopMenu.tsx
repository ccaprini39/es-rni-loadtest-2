'use client'

import { useLocalStorage } from '@uidotdev/usehooks'
import { Input } from './ui/input'
import { Label } from './ui/label'
import Link from 'next/link'
import { ModeToggle } from './ModeToggle'
import FullScreenToggle from './FullscreenToggle'

export default function TopMenu() {
  const [url, setUrl] = useLocalStorage<string>('loadtest-url', '')
  const [index, setIndex] = useLocalStorage<string>('loadtest-index', '')

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <div>
          <Link href="/" className="hover:text-primary">Home</Link>
        </div>
        <div>
          <Link href="/indices" className="hover:text-primary">Indices</Link>
        </div>
      </nav>
      <div className="flex flex-row w-full gap-4 md:ml-auto md:gap-2 py-1 lg:gap-4">
        <div className="ml-auto flex-grow w-full sm:flex-initial py-1">
          <Label htmlFor="elasticsearch-url" >Elasticsearch URL</Label>
          <Input
            id="elasticsearch-url"
            value={url}
            onChange={(e) => { setUrl(e.target.value) }}
          />
        </div>
        <div className="ml-auto flex-grow w-full sm:flex-initial py-1">
          <Label htmlFor="index">Index</Label>
          <Input
            id="index"
            value={index}
            onChange={(e) => { setIndex(e.target.value) }}
          />
        </div>
      </div>
      <div className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <ModeToggle />
        <FullScreenToggle />
      </div>
    </header>
  )
}