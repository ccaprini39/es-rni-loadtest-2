import {
  useEffect,
  useState,
  useCallback,
} from "react"


export default function StreamingResponse() {
  const [name, setName] = useState<string>("lupa")
  const { openCall, closeCall, clearMessages, messages, eventSource } = useStreamingResponse("/api/name-gen?name=" + name, false)

  return (
    <div className="border rounded-md h-full">
      <input
        type="text"
        disabled={eventSource !== null}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <button onClick={openCall}>Start</button><br />
      <button onClick={closeCall}>Stop</button><br />
      <button onClick={clearMessages}>Clear</button>
      <p>
        {
          typeof messages.data === "string" ?
            messages.data
            :
            JSON.stringify(messages.data, null, 2)
        }
      </p>
    </div>
  )
}

export function useStreamingResponse(url: string, clearOnClose = true) {
  interface EventMessage {
    data: string | object
  }
  const [eventSource, setEventSource] = useState<null | EventSource>(null)
  const [messages, setMessages] = useState<EventMessage>({ data: '' })

  async function openCall() {
    const source = new EventSource(url, {
      withCredentials: true,
    });
    setEventSource(source);
  }

  function closeCall() {
    if (eventSource) {
      setEventSource(null)
    }
    if (clearOnClose) setMessages({ data: '' })
  }

  function clearMessages() {
    setMessages({ data: '' })
  }

  useEffect(() => {
    if (eventSource) {
      eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
      };
      eventSource.addEventListener("update", updateMessage);

      return () => {
        eventSource.removeEventListener("update", updateMessage);
      };
    }
  }, [eventSource]);

  const updateMessage = useCallback((event: MessageEvent) => {
    if (event.data === "***Complete***") {
      setMessages(
        {
          data: {
            complete: true
          }
        }
      )
      setEventSource(null)
      return
    }
    const data = event.data;
    const newData = messages.data + data;
    setMessages({ data: newData });
  }, []);

  return {
    openCall,
    closeCall,
    clearMessages,
    messages,
    eventSource
  }
}