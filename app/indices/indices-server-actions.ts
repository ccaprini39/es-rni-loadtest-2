'use server'

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

export async function catIndices(esUrl: string): Promise<Index[]> {
  try {
    const response = await fetch(`${esUrl}/_cat/indices?format=json`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const indices: Index[] = await response.json();
    return indices;
  } catch (error) {
    throw new Error(`Failed to fetch indices: ${(error as Error).message}`);
  }
}

export async function createIndex(esUrl: string, indexName: string, body: string): Promise<void> {
  try {
    const response = await fetch(`${esUrl}/${indexName}`, {
      method: 'PUT',
      body: body,
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Failed to create index: ${(error as Error).message}`);
  }
}

export async function deleteIndex(esUrl: string, indexName: string): Promise<void> {
  try {
    const response = await fetch(`${esUrl}/${indexName}`, {
      method: 'DELETE',
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Failed to delete index: ${(error as Error).message}`);
  }
}

export async function getIndexMappings(esUrl: string, indexName: string): Promise<any> {
  try {
    const response = await fetch(`${esUrl}/${indexName}/_mapping`, {
      method: 'GET',
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const mappings = await response.json();
    return mappings[indexName].mappings;
  } catch (error) {
    throw new Error(`Failed to get index mappings: ${(error as Error).message}`);
  }
}

export async function bulkIndexDocs(esUrl: string, body: string): Promise<void> {
  try {
    const response = await fetch(`${esUrl}/_bulk`, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    const jsonResponse = await response.json();

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Failed to index documents: ${(error as Error).message}`);
  }
}

export async function getIndexInfo(url: string, index: string): Promise<any> {
  //need to get the number of docs, the size of the index, the number of shards, the number of replicas
  try {
    let docsCount = await fetch(`${url}/${index}/_count`, {
      method: 'GET',
      cache: 'no-cache',
    });
    docsCount = (await docsCount.json()).count;

    let storeSize: any = await fetch(`${url}/${index}/_stats`, {
      method: 'GET',
      cache: 'no-cache',
    });
    storeSize = (await storeSize.json()).indices[index].total.store.size_in_bytes;
    //if the store size is greater than 1GB, convert it to GB
    if (storeSize > 1000000000) {
      storeSize = `${(storeSize / 1000000000).toFixed(2)} GB`;
    } else {
      storeSize = `${(storeSize / 1000000).toFixed(2)} MB`;
    }

    return { docsCount, storeSize };
  } catch (error) {
    throw new Error(`Failed to get index info: ${(error as Error).message}`);
  }
}

export async function getTenRandomDocs(url: string, index: string): Promise<any> {
  try {
    const response = await fetch(`${url}/${index}/_search`, {
      method: 'POST',
      body: JSON.stringify({
        size: 10,
        query: {
          function_score: {
            query: {
              match_all: {}
            },
            random_score: {}
          }
        }
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse.hits.hits;
  } catch (error) {
    throw new Error(`Failed to get random documents: ${(error as Error).message}`);
  }
}

export type NodeStats = {
  name: string;
  cpuPercent: number;
  heapUsedPercent: number;
  heapUsedInBytes: number;
  heapMaxInBytes: number;
};

export async function getNodeStats(esUrl: string): Promise<NodeStats[]> {
  try {
    const response = await fetch(`${esUrl}/_nodes/stats`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    const nodes = data.nodes;

    const stats: NodeStats[] = Object.keys(nodes).map((nodeId) => {
      const node = nodes[nodeId];
      return {
        name: node.name,
        cpuPercent: node.os.cpu.percent,
        heapUsedPercent: node.jvm.mem.heap_used_percent,
        heapUsedInBytes: node.jvm.mem.heap_used_in_bytes,
        heapMaxInBytes: node.jvm.mem.heap_max_in_bytes,
      };
    });

    return stats;
  } catch (error) {
    throw new Error(`Failed to retrieve node stats: ${(error as Error).message}`);
  }
}