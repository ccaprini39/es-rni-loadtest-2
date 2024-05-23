'use client'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useRef, useState } from 'react'
import { catIndices } from './indices-server-actions'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MonacoJsonEditor } from '@/components/MonacoJsonEditor'
import { Button } from '@/components/ui/button'
import { VerticalResizeComponent } from '@/components/ui/ResizeComponents'

// this will be a page that handles managing and creating indices

export default function IndicesPage() {

  const [indices, setIndices] = useState<Index[]>([])
  const [url, setUrl] = useLocalStorage<string>('loadtest-url', '')

  useEffect(() => {
    async function loadIndices() {
      if (url !== '') {
        try {
          const fetchedIndices = await catIndices(url)
          setIndices(fetchedIndices)
        } catch (error: any) {
          console.log(error.message)
        }
      }
    }
    loadIndices()
  }, [])

  return (
    <div className="h-full w-full p-5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Index</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Primary</TableHead>
            <TableHead>Replicas</TableHead>
            <TableHead>Docs Count</TableHead>
            <TableHead>Docs Deleted</TableHead>
            <TableHead>Store Size</TableHead>
            <TableHead>Primary Store Size</TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          {indices.map((index) => (
            <TableRow key={index.index}>
              <TableCell>{index.index}</TableCell>
              <TableCell>{index.health}</TableCell>
              <TableCell>{index.status}</TableCell>
              <TableCell>{index.pri}</TableCell>
              <TableCell>{index.rep}</TableCell>
              <TableCell>{index['docs.count']}</TableCell>
              <TableCell>{index['docs.deleted']}</TableCell>
              <TableCell>{index['store.size']}</TableCell>
              <TableCell>{index['pri.store.size']}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
      <CreateIndexForm />
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

const sampleIndex =
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 2
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "dob": {
        "type": "date"
      }
    }
  }
}

export function CreateIndexForm() {
  const [indexName, setIndexName] = useState('')
  const [numShards, setNumShards] = useState(1)
  const [numReplicas, setNumReplicas] = useState(1)
  const [mapping, setMapping] = useState('')
  const ref = useRef<any>(null)

  function handleCreateIndex() {
    const indexCreationProps: IndexCreationProps = {
      indexName,
      numShards,
      numReplicas,
      mapping
    }
    console.log(indexCreationProps)
  }

  return (
    <div
      className='h-[400px]'
    >
      <h1>Create Index</h1>
      <VerticalResizeComponent>
        <MonacoJsonEditor
          givenRef={ref}
          givenJson={mapping}
          givenOnChange={(newJson: string | undefined) => setMapping(newJson || '')}
        />
        <Button onClick={handleCreateIndex}>Create Index</Button>
      </VerticalResizeComponent>


    </div>
  )
}