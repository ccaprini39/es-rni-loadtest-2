'use client'

import { useEffect, useState } from "react"
import { useStreamingResponse } from "./StreamingResponse"
import { useDidUpdate } from "@mantine/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataType, EditingMode, SortingMode, Table } from "ka-table"
import { Column } from "ka-table/models"
import "ka-table/style.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectValue,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { useLocalStorage } from "@uidotdev/usehooks"


interface DataResultPoint {
  numberOfRequests: number;
  numberOfFailures: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  currentRps: number;
  averageTook: number;
  minTook: number;
  maxTook: number;
}

export default function BasicAsyncStreaming() {
  const [indexInfoVisible, setIndexInfoVisible] = useState<boolean>(false)
  const [esUrl, setUrl] = useLocalStorage<string>('loadtest-url', '')
  const [duration, setDuration] = useState<number>(5)
  const [results, setResults] = useState<DataResultPoint[]>([])
  const { openCall, closeCall, clearMessages, messages, eventSource } = useStreamingResponse(`/api/sync-name-test?url=${esUrl}&duration=${duration}`, false)

  useDidUpdate(() => {
    if (typeof messages.data === "string") {
      try {
        const newResult = JSON.parse(messages.data)
        setResults([...results, newResult])
      } catch (e) {
        console.error(messages.data)
        setResults([])
        return
      }
    }
    console.log(results)
  }, [messages])

  return (
    <div className="border rounded-md h-full">
      <div
        className="flex flex-row justify-between"
      >
        <div className="grid w-full max-w-lg items-center gap-1.5 outline outline-1 rounded-md p-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            type="number"
            id="duration"
            disabled={eventSource !== null}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
          />
        </div>
      </div>
      <div
        className="flex flex-row justify-between"
      >
        <Button
          onClick={openCall}
          className="bg-green-500 hover:bg-green-300 m-2"
          disabled={eventSource !== null}
        >
          Start
        </Button>
        <Button
          onClick={closeCall}
          className="bg-red-500 hover:bg-red-300 m-2"
          disabled={eventSource === null}
        >
          Stop
        </Button>
        <Button
          onClick={clearMessages}
          className="m-2"
        >
          Clear
        </Button>
      </div>
      <Body results={results} />
    </div>
  )
}

export function Body({ results }: { results: DataResultPoint[] }) {
  //this will be tabs for statistics, charts
  if (results.length === 0) {
    return <div className="dashboard-body w-full">No results</div>
  }
  return (
    <div className="dashboard-body w-full">
      <Tabs defaultValue="stats">
        <TabsList>
          <TabsTrigger value="stats" className="bg-gray-400 w-[300px]">
            Stats
          </TabsTrigger>
          <TabsTrigger value="charts" className="bg-gray-400 w-[300px]">
            Charts
          </TabsTrigger>
          <TabsTrigger value="download" className="bg-gray-400 w-[300px]">
            Download
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="stats"
          className="m-2 dashboard-body-content border border-white rounded"
        >
          <KaTable data={results} />
        </TabsContent>
        <TabsContent value="charts">
          <Chart data={results} />
        </TabsContent>
        <TabsContent value="download">
          <DownloadComponent data={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const sampleResults =
  [
    {
      "numberOfRequests": 1,
      "numberOfFailures": 0,
      "averageResponseTime": 67.19179999828339,
      "minResponseTime": 67.19179999828339,
      "maxResponseTime": 67.19179999828339,
      "currentRps": 14.882768433433068,
      "averageTook": 6,
      "minTook": 6,
      "maxTook": 6
    },
    {
      "numberOfRequests": 2,
      "numberOfFailures": 0,
      "averageResponseTime": 60.12229999899864,
      "minResponseTime": 53.0527999997139,
      "maxResponseTime": 67.19179999828339,
      "currentRps": 18.849146510747648,
      "averageTook": 5,
      "minTook": 4,
      "maxTook": 6
    },
    {
      "numberOfRequests": 3,
      "numberOfFailures": 0,
      "averageResponseTime": 61.04739999771118,
      "minResponseTime": 53.0527999997139,
      "maxResponseTime": 67.19179999828339,
      "currentRps": 15.898857827283202,
      "averageTook": 5.333333333333333,
      "minTook": 4,
      "maxTook": 6
    }
  ]

function KaTable({ data }: { data: DataResultPoint[] }) {
  const columns: Column[] =
    [
      { key: 'numberOfRequests', title: 'Number of Requests', dataType: DataType.Number, colGroup: { style: { minWidth: 50 } } },
      { key: 'numberOfFailures', title: 'Number of Failures', dataType: DataType.Number, colGroup: { style: { minWidth: 50 } } },
      { key: 'averageResponseTime', title: 'Average Response Time', dataType: DataType.Number, colGroup: { style: { minWidth: 50 } } },
      { key: 'minResponseTime', title: 'Min Response Time', dataType: DataType.Number, colGroup: { style: { minWidth: 50 } } },
      { key: 'maxResponseTime', title: 'Max Response Time', dataType: DataType.Number, colGroup: { style: { minWidth: 50 } } },
      { key: 'currentRps', title: 'Current RPS', dataType: DataType.Number, colGroup: { style: { minWidth: 50 } } },
      { key: 'averageTook', title: 'Average Took', dataType: DataType.Number, colGroup: { style: { minWidth: 50 } } },
      { key: 'minTook', title: 'Min Took', dataType: DataType.Number, colGroup: { style: { minWidth: 50 } } },
      { key: 'maxTook', title: 'Max Took', dataType: DataType.Number, colGroup: { style: { minWidth: 50 } } },
    ]
  return (
    <Table
      data={data}
      columns={columns}
      editingMode={EditingMode.None}
      rowKeyField="id"
      sortingMode={SortingMode.Single}
      columnResizing={true}
    />
  )
}

function Chart({ data }: { data: DataResultPoint[] }) {
  const [selectedVariable, setSelectedVariable] = useState<string>("currentRps")

  return (
    <div className="flex flex-col h-full w-full">
      <div className='mb-5'>
        <Select onValueChange={(value: string) => setSelectedVariable(value)}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Current RPS" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Variable</SelectLabel>
              <SelectItem value="currentRps">Current RPS</SelectItem>
              <SelectItem value="averageTook">Average Took</SelectItem>
              <SelectItem value="minTook">Min Took</SelectItem>
              <SelectItem value="maxTook">Max Took</SelectItem>
              <SelectItem value="averageResponseTime">Avg Response Time</SelectItem>
              <SelectItem value="minResponseTime">Min Response Time</SelectItem>
              <SelectItem value="maxResponseTime">Max Response Time</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <LineChart
        className="bg-gray-100 mx-2"
        width={2500}
        height={500}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={selectedVariable} stroke="#8884d8" />
      </LineChart>
    </div>
  );
}

export function DownloadComponent({ data }: { data: DataResultPoint[] }) {
  return (
    <div>
      <Button onClick={() => {
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "results.json";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
      }}>
        Download
      </Button>
    </div>
  )
}