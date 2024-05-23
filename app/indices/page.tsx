'use client'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useRef, useState } from 'react'
import { catIndices, createIndex } from './indices-server-actions'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MonacoJsonEditor } from '@/components/MonacoJsonEditor'
import { Button } from '@/components/ui/button'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// this will be a page that handles managing and creating indices

export default function IndicesPage() {

  const [indices, setIndices] = useState<Index[]>([])
  const [url, setUrl] = useLocalStorage<string>('loadtest-url', '')
  const [value, setValue] = useState(false)
  function toggleValue() { setValue(!value) }

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
  }, [value])

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
  function CreateIndexForm() {
    const [indexName, setIndexName] = useState('')
    const [mapping, setMapping] = useState(JSON.stringify(sampleIndex, null, 2))
    const ref = useRef<any>(null)

    async function handleCreateIndex() {
      const indexCreationProps: IndexCreationProps = {
        indexName,
        body: JSON.stringify(JSON.parse(mapping))
      }
      try {
        await createIndex(url, indexCreationProps.indexName, indexCreationProps.body)
        toast.success('Index created successfully')
        toggleValue()
      }
      catch (error: any) {
        toast.error('Failed to create index')
        console.log(error.message)
      }
    }

    return (
      <div className='h-[400px] py-1'>
        <h1>Create Index</h1>
        <div>
          <Label htmlFor="index-name">Index Name</Label>
          <Input id="index-name" value={indexName} onChange={(e) => setIndexName(e.target.value)} />
        </div>

        <MonacoJsonEditor
          givenRef={ref}
          givenJson={mapping}
          givenOnChange={(newJson: string | undefined) => setMapping(newJson || '')}
        />
        <Button onClick={handleCreateIndex}>Create Index</Button>
      </div>
    )
  }
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
  body: string;
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
