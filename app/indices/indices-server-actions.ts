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

export async function createIndex(esUrl : string, indexName : string, body : string) : Promise<void> {
  console.log('url:', esUrl)
  console.log('Creating index:', indexName)
  console.log('Body:', body)
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