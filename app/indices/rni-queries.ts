'use server'

import { generateRandomDate, generateSingleRandomName } from "../name-gen/exported-functions";

export async function executeQuery(url: string, index: string, query: string): Promise<any> {
  try {
    const response = await fetch(`${url}/${index}/_search`, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`Failed to execute query: ${(error as Error).message}`);
  }
}

export async function executeRandomQuery(url: string, index: string): Promise<any> {
  const name = generateSingleRandomName()
  const dob = generateRandomDate()
  const query = buildQuery(name, dob)
  try {
    const response = await fetch(`${url}/${index}/_search`, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    const took = result.took
    console.log(`Query took ${took} ms`)
    return took;
  } catch (error) {
    throw new Error(`Failed to execute query: ${(error as Error).message}`);
  }
}

export async function executeRandomQueries(url: string, index: string, numQueries: number): Promise<any> {
  let results = []
  for (let i = 0; i < numQueries; i++) {
    results.push(await executeRandomQuery(url, index))
  }
  //now the results array will contain the time it took to execute each query
  const min = Math.min(...results)
  const max = Math.max(...results)
  const avg = results.reduce((a, b) => a + b, 0) / results.length
  return {min, max, avg}
}

function buildQuery(name: string, dob: string): string {
  let rniQuery = 
  {
      "query" : {
          "bool" : {
              "should" : [
                  {
                      "match" : {primary_name : `{"data" : "${name}", "entityType" : "PERSON"}`}
                  },
                  {
                      "match" : {birth_date : dob}
                  }
              ]
          }
      }
  }
  let rescorer =  
  {
      "rescore" : {
          "window_size" : 10,
          "query" : {
              "rescore_query" : {
                  "function_score" : {
                      "doc_score" : {
                          "fields" : {
                              "primary_name" : {"query_value" : {"data" : name, "entityType" : "PERSON"}},
                              "birth_date" : {"query_value" : dob}
                          }
                      }
                  }
              },
              "query_weight" : 0.0,
              "rescore_query_weight" : 1.0
          }
      }
  }
  const query = {...rniQuery, ...rescorer}
  return JSON.stringify(query)
}