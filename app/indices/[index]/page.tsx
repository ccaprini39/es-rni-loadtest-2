'use client'

export default function IndexDetails({ params }: { params: { index: string } }){

  return (
    <div>
      <h1>Index Details</h1>
      <p>Index: {params.index}</p>
    </div>
  )
  
}