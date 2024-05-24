'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useEffect, useRef, useState } from "react"
import { bulkIndexDocs, getIndexInfo, getIndexMappings, getNodeStats, getTenRandomDocs } from "../indices-server-actions"
import { useLocalStorage } from "@uidotdev/usehooks"
import { generateRandomDate, generateSingleRandomName } from "@/app/name-gen/exported-functions"
import { Label } from "@radix-ui/react-label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { HorizontalComponentsResize } from "@/components/ui/ResizeComponents"
import { executeQuery, executeRandomQueries, executeRandomQuery } from "../rni-queries"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function IndexDetails({ params }: { params: { index: string } }) {

  const index = params.index
  const [mapping, setMapping] = useState<any>({})
  const [indexInfo, setIndexInfo] = useState<any>({})
  const [url, setUrl] = useLocalStorage<string>('loadtest-url', '')
  const [sampleDocs, setSampleDocs] = useState<any[]>([{}])
  const [value, setValue] = useState(false)
  function toggleValue() { setValue(!value) }


  useEffect(() => {
    async function loadMapping() {
      try {
        const fetchedMapping = await getIndexMappings(url, index)
        setMapping(fetchedMapping)
      } catch (error: any) {
        console.log(error.message)
      }
      try {
        const fetchedIndexInfo = await getIndexInfo(url, index)
        setIndexInfo(fetchedIndexInfo)
      } catch (error: any) {
        console.log(error.message)
      }
      try {
        const fetchedSampleDocs = await getTenRandomDocs(url, index)
        setSampleDocs(fetchedSampleDocs)
      } catch (error: any) {
        console.log(error.message)
      }
    }
    loadMapping()
  }, [value])

  return (
    <div className="h-full w-full p-5">
      <div className="w-full flex flex-row justify-between">
        <h1 className=" text-3xl">Index: {index}</h1>
        <div>
          {indexInfo.storeSize && <p>Store Size: {indexInfo.storeSize}</p>}
          {indexInfo.docsCount && <p>Number of Documents: {indexInfo.docsCount}</p>}
        </div>
      </div>

      <Tabs defaultValue='stats'>
        <TabsList>
          <TabsTrigger value='mapping'>Mapping</TabsTrigger>
          <TabsTrigger value='docs'>Example Documents</TabsTrigger>
          <TabsTrigger value='stats'>Stats</TabsTrigger>
          <TabsTrigger value='bulk'>Bulk Index</TabsTrigger>
          <TabsTrigger value='search'>Search</TabsTrigger>
          <TabsTrigger value='searches'>Seaches</TabsTrigger>
        </TabsList>
        <TabsContent value='mapping'>
          <Mapping />
        </TabsContent>
        <TabsContent value='docs'>
          <Docs />
        </TabsContent>
        <TabsContent value='stats'>
          <Stats />
        </TabsContent>
        <TabsContent value='bulk'>
          <BulkIndex />
        </TabsContent>
        <TabsContent value='search'>
          <SingleSearch />
        </TabsContent>
        <TabsContent value='searches'>
          <MultiSearch />
        </TabsContent>
      </Tabs>
    </div>
  )

  function BulkIndex() {
    const [numberOfDocs, setNumberOfDocs] = useState<number>(100)
    const [running, setRunning] = useState<boolean>(false)
    const bulk = buildBulkSizeN(10)


    if (Object.keys(mapping).length === 0) {
      return <div></div>
    }

    async function sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    async function handleCreateNObjects() {
      setRunning(true)
      const numberOfBatches = Math.floor(numberOfDocs / 1000)
      const remainder = numberOfDocs % 1000
      for (let i = 0; i < numberOfBatches; i++) {
        const bulk = buildBulkSizeN(1000)
        try {
          await bulkIndexDocs(url, bulk)
          toast.success('Indexed 1000 documents, batch ' + (i + 1) + ' of ' + numberOfBatches)
        } catch (error: any) {
          toast.error(error.message)
        }
        console.log((i))
      }
      if (remainder > 0) {
        const bulk = buildBulkSizeN(remainder)
        try {
          await bulkIndexDocs(url, bulk)
          toast.success('Indexed ' + remainder + ' documents')
        } catch (error: any) {
          toast.error(error.message)
        }
      }
      await sleep(500)
      toggleValue()
      setRunning(false)
    }

    return (
      <div>
        <div className="w-1/2">
          <Label htmlFor="number-of-docs">Number of Documents to index</Label>
          <Input
            id="number-of-docs"
            type="number"
            value={numberOfDocs}
            onChange={(e) => setNumberOfDocs(parseInt(e.target.value))}
          />
        </div>
        <Button disabled={running} onClick={handleCreateNObjects}>Create {numberOfDocs} Objects</Button>
        <p>Example of bulk object:</p>
        <pre>{bulk}</pre>
      </div>
    )
  }

  function buildBulkFromMappings() {
    // iterates over the properties and builds a bulk index
    // if the type string is rni_name, then it will be a random name
    // if the type is date or rni_date, then it will be a random date

    let bulk: string = `{"index": {"_index": "${index}"}}\n{`
    const properties = mapping.properties
    for (const key in properties) {
      const type = properties[key].type
      if (type === 'rni_name') {
        bulk += (`"${key}": {"data" : "${generateSingleRandomName()}", "entityType" : "PERSON"}`)
      } else if (type === 'date' || type === 'rni_date') {
        bulk += (`"${key}": "${generateRandomDate()}"`)
      }
      //if this is the last key, then don't add a comma
      if (key !== Object.keys(properties)[Object.keys(properties).length - 1]) {
        bulk += ','
      }
    }
    bulk += '}\n'
    return bulk
  }

  function buildBulkSizeN(n: number) {
    let bulk = ''
    for (let i = 0; i < n; i++) {
      bulk += buildBulkFromMappings()
    }
    return bulk

  }

  function Stats(){
    const [stats, setStats] = useState<any>({})
    useEffect(() =>{
      async function fetchStats(){
        try{
          const stats = await getNodeStats(url)
          setStats(stats)
        } catch (error: any){
          toast.error('Failed to fetch stats')
          console.log(error.message)
        }
      }
      fetchStats()
    },[])

    return(
      <div>
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      </div>
    )
  }

  function getFieldsFromMappings() {
    const properties = mapping.properties
    let fields: string[] = []
    for (const key in properties) {
      fields.push(key)
    }
    return fields
  }

  function SingleSearch() {
    const query = buildQuery(generateSingleRandomName(), generateRandomDate())
    const [searchBody, setSearchBody] = useState<string>(query)
    const searchRef = useRef<any>(null)
    const [searchResults, setSearchResults] = useState<any>('')

    async function getNewSearchBody() {
      const query = buildQuery(generateSingleRandomName(), generateRandomDate())
      setSearchBody(query)
    }

    async function handleSearch() {
      try {
        const bodyString = searchBody
        //const response = await executeRandomQuery(url, index)
        const response = await executeQuery(url, index, bodyString)
        setSearchResults(JSON.stringify(response, null, 2))
      } catch (error: any) {
        toast.error('Failed to execute search')
        console.log(error.message)
      }
    }

    return (
      <div className="h-[700px] rounded-md border">
        <HorizontalComponentsResize>
          <ScrollArea className="h-full w-full flex flex-col">
            <div className="flex flex-row justify-between">
              <Button onMouseDown={handleSearch}>
                Search
              </Button>
              <Button onMouseDown={getNewSearchBody}>
                New Search
              </Button>
            </div>
            <pre>{searchBody}</pre>
          </ScrollArea>
          <ScrollArea className="h-full w-full rounded-md border p-4">
            <pre>{searchResults}</pre>
          </ScrollArea>
        </HorizontalComponentsResize>
      </div>
    )
  }

  function Docs() {
    return (
      <ScrollArea className="h-[700px] w-full">
        <pre>{JSON.stringify(sampleDocs, null, 2)}</pre>
      </ScrollArea>
    )
  }

  function Mapping() {
    return (
      <ScrollArea>
        <pre>{JSON.stringify(mapping, null, 2)}</pre>
      </ScrollArea>
    )
  }

  function MultiSearch() {
    const [running, setRunning] = useState<boolean>(false)
    const [searchResults, setSearchResults] = useState<any>('')
    const [numQueries, setNumQueries] = useState<number>(20)

    async function handleSearch() {
      setRunning(true)
      try {
        const results = await executeRandomQueries(url, index, numQueries)
        setSearchResults(JSON.stringify(results, null, 2))
      } catch (error: any) {
        toast.error('Failed to execute search')
        console.log(error.message)
      }
      setRunning(false)
    }
    return (
      <div>
        <div>
          <Label htmlFor="num-queries">Number of Queries</Label>
          <Input
            id="num-queries"
            type="number"
            value={numQueries}
            onChange={(e) => setNumQueries(parseInt(e.target.value))}
          />
        </div>
        <Button disabled={running} onClick={handleSearch}>Search</Button>
        <pre>{searchResults}</pre>
      </div>
    )
  }
}

type Mappings =
  {
    properties: {
      [key: string]: {
        type: string
      }
    }
  }

function buildQuery(name: string, dob: string): string {
  let rniQuery =
  {
    "query": {
      "bool": {
        "should": [
          {
            "match": { primary_name: `{"data" : "${name}", "entityType" : "PERSON"}` }
          },
          {
            "match": { birth_date: dob }
          }
        ]
      }
    }
  }
  let rescorer =
  {
    "rescore": {
      "window_size": 10,
      "query": {
        "rescore_query": {
          "function_score": {
            "doc_score": {
              "fields": {
                "primary_name": { "query_value": { "data": name, "entityType": "PERSON" } },
                "birth_date": { "query_value": dob }
              }
            }
          }
        },
        "query_weight": 0.0,
        "rescore_query_weight": 1.0
      }
    }
  }
  const query = { ...rniQuery, ...rescorer }
  return JSON.stringify(query, null, 2)
}