'use client'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'
import { catIndices } from './indices-server-actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// this will be a page that handles managing and creating indices

export default function IndicesPage() {
  const [url, setUrl] = useLocalStorage<string>('')
  const [indices, setIndices] = useState<Index[]>([])

  useEffect(() => {
    async function loadIndices() {
      if (url !== '') {
        try {
          const fetchedIndices = await catIndices(url)
          setIndices(fetchedIndices)
          alert('Indices loaded')
        } catch (error : any) {
          console.log(error.message)
        }
      }
    }
    loadIndices()
  }, [url])

  return (
    <div className="h-full w-full p-5">
      <h1>Indices</h1>

      <div className='flex flex-row'>
        <Label htmlFor="elasticsearch-url">Elasticsearch URL</Label>
        <Input
          id="elasticsearch-url"
          value={url}
          onChange={(e) => { setUrl(e.target.value) }}
        />
      </div>


    </div>
  )
}

type Index = {
  health: string;
  status: string;
  index: string;
  uuid: string;
  pri: string;
  rep: string;
  'docs.count': string;
  'docs.deleted': string;
  'store.size': string;
  'pri.store.size': string;
}

type IndexCreationProps = {
  indexName: string;
  numShards: number;
  numReplicas: number;
  mapping: string;
}