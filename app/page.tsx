import Image from "next/image";
import TestComponent from "./name-gen/TestComponent";
import BasicAsyncStreaming from "./client-components/BasicStreaming";

export default function Home() {
  return (
    <main>
      <BasicAsyncStreaming />
    </main>
  );
}
