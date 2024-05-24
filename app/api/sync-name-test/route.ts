import { getNodeStats } from "@/app/indices/indices-server-actions";
import { executeRandomQuery } from "@/app/indices/rni-queries";
import { NextRequest, NextResponse } from "next/server";
import { EventNotifier, getSSEWriter } from "ts-sse";
export const dynamic = "force-dynamic";

type SyncEvents = EventNotifier<{
  update: {
    data: string;
    event: "update";
  };
  complete: {
    data: string;
    event: "update";
  };
  close: {
    data: never;
  };
  error: {
    data: never;
  };
}>;
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
  cpu: number;
  index: string;
}
async function executeEsSearch(esUrl: string, index: string) {
  const startTime = performance.now();
  const response = await executeRandomQuery(esUrl, index);
  const status = response.status;
  const endTime = performance.now();
  const totalTime = endTime - startTime;

  return { status : status,  took: response.took, totalTime: totalTime };
}

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const index = searchParams.get("index");
  const duration = searchParams.get("duration");
  let durationInt = parseInt(duration || "30");

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  req.signal.onabort = () => {
    console.log("aborting");
    writer.close();
  };

  async function syncStatusStream(notifier: SyncEvents) {
    if (!url) {
      notifier.update({ data: 'No URL provided', event: "update" });
      return;
    } else if (!duration) {
      notifier.update({ data: 'No duration provided', event: "update" });
      return;
    } else if (!index) {
      notifier.update({ data: 'No index provided', event: "update" });
      return;
    }
    const startTime = performance.now();
    let totalResults : DataResultPoint = {
      numberOfRequests: 0,
      numberOfFailures: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      currentRps: 0,
      averageTook: 0,
      minTook: 0,
      maxTook: 0,
      cpu: 0,
      index: index
    }
    while (performance.now() - startTime < durationInt * 1000) {
      const timeRemaining = durationInt * 1000 - (performance.now() - startTime)
      const { status, took, totalTime } = await executeEsSearch(url, index);
      totalResults.numberOfRequests += 1
      if (status !== 200) {
        totalResults.numberOfFailures += 1
      }
      totalResults.averageResponseTime = (totalResults.averageResponseTime * (totalResults.numberOfRequests - 1) + totalTime) / totalResults.numberOfRequests
      totalResults.averageTook = (totalResults.averageTook * (totalResults.numberOfRequests - 1) + took) / totalResults.numberOfRequests
      if (totalResults.minResponseTime === 0 || totalTime < totalResults.minResponseTime) {
        totalResults.minResponseTime = totalTime
      }
      if (totalResults.maxResponseTime === 0 || totalTime > totalResults.maxResponseTime) {
        totalResults.maxResponseTime = totalTime
      }
      if (totalResults.minTook === 0 || took < totalResults.minTook) {
        totalResults.minTook = took
      }
      if (totalResults.maxTook === 0 || took > totalResults.maxTook) {
        totalResults.maxTook = took
      }
      totalResults.currentRps = 1000 / totalTime 
      //I only want to update the ui every 10 queries
      if ((totalResults.numberOfRequests % 10 === 0 )|| (timeRemaining < 1000)) {
        const start = performance.now();
        const stats = await getNodeStats(url);
        const end = performance.now();
        const time = end - start;
        durationInt += time / 1000;
        totalResults.cpu = stats[0].cpuPercent;
        notifier.update({ data: JSON.stringify(totalResults), event: "update" });
      } 
    }

    notifier.update({ data: "***Complete***", event: "update" });
    return
  }

  syncStatusStream(getSSEWriter(writer, encoder));

  return new NextResponse(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control":
        "no-cache, no-transform, must-revalidate, max-age=0, s-maxage=0",
      Connection: "keep-alive",
    },
  });
}