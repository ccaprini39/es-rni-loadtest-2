import { generate100Names } from "./server-actions";


export default async function TestComponent(){
  let names = await generate100Names();
  return (
    <div className="m-5">
      {names.map((name, index) => (
        <p key={index}>{name}</p>
      ))}
    </div>
  )
}