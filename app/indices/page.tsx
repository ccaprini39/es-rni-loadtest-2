'use client'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useRef, useState } from 'react'
import { catIndices, createIndex, deleteIndex, getIndexMappings } from './indices-server-actions'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MonacoJsonEditor } from '@/components/MonacoJsonEditor'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

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
    <Tabs className="h-full w-full p-5" defaultValue='list'>
      <TabsList>
        <TabsTrigger value='list'>List</TabsTrigger>
        <TabsTrigger value='create'>Create</TabsTrigger>
      </TabsList>
      <TabsContent value='list'>
        <Table>
          <IndexTableHeader />
          <tbody>
            {indices.map((index) => (
              <IndexTableRow key={index.index} index={index} />
            ))}
          </tbody>
        </Table>
      </TabsContent>
      <TabsContent value='create' className='h-full'>
        <CreateIndexForm />
      </TabsContent>
    </Tabs>
  )

  function IndexTableHeader() {
    return (
      <TableHeader>
        <TableRow>
          <TableHead>Index</TableHead>
          <TableHead>Health</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Primary</TableHead>
          <TableHead>Replicas</TableHead>
          <TableHead>Docs Count</TableHead>
          <TableHead>Store Size</TableHead>
          <TableHead>Primary Store Size</TableHead>
          <TableHead>Mapping</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
    )
  }

  function IndexTableRow({ index }: { index: Index }) {
    const [mapping, setMapping] = useState<any>('')
    useEffect(() => {
      async function loadMapping() {
        try {
          const data = await getIndexMappings(url, index.index)
          setMapping(data)
        } catch (error: any) {
          console.log(error.message)
        }
      }
      loadMapping()
    }, [])

    async function handleDeleteIndex(indexName: string) {
      try {
        await deleteIndex(url, indexName)
        toast.success('Index deleted successfully')
        toggleValue()
      } catch (error: any) {
        toast.error('Failed to delete index')
        console.log(error.message)
      }
    }

    return (
      <TableRow>
        <TableCell>
          <Link href={`/indices/${index.index}`}>{index.index}</Link>
        </TableCell>
        <TableCell>{index.health}</TableCell>
        <TableCell>{index.status}</TableCell>
        <TableCell>{index.pri}</TableCell>
        <TableCell>{index.rep}</TableCell>
        <TableCell>{index['docs.count']}</TableCell>
        <TableCell>{index['store.size']}</TableCell>
        <TableCell>{index['pri.store.size']}</TableCell>
        <TableCell>
          <HoverCard openDelay={100} closeDelay={500}>
            <HoverCardTrigger className='w-screen'>
              <Button>View</Button>
            </HoverCardTrigger>
            <HoverCardContent className='w-full'>
              <pre>{JSON.stringify(mapping, null, 2)}</pre>
            </HoverCardContent>
          </HoverCard>
        </TableCell>
        <TableCell>
          <Button variant='destructive' size='icon' onClick={() => handleDeleteIndex(index.index)}>
            <X />
          </Button>
        </TableCell>
      </TableRow>
    )
  }

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
      <div className='h-[500px]'>
        <div className='py-1'>
          <Label htmlFor="index-name">Index Name</Label>
          <Input id="index-name" value={indexName} onChange={(e) => setIndexName(e.target.value)} />
        </div>

        <MonacoJsonEditor
          givenRef={ref}
          givenJson={mapping}
          givenOnChange={(newJson: string | undefined) => setMapping(newJson || '')}
        />
        <Button className='my-1' onClick={handleCreateIndex}>Create Index</Button>
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
      "birth_date": {
        "type": "rni_date",
        "format": "yyyy-MM-dd"
      },
      "primary_name": {
        "type": "rni_name"
      }
    }
  }
}
