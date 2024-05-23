'use client'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import React from "react"

export function HorizontalComponentsResize({children}: {children: any[]}) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-grow w-full h-full"
    >
      {children.map((child: any, index: number) => {
        const isLast: boolean = index === children.length - 1
        return (
          <React.Fragment key={index}>
            <ResizablePanel defaultSize={10}>
              <div className="flex h-full p-2">
                {child}
              </div>
            </ResizablePanel>
            {isLast ? null : <ResizableHandle withHandle />}
          </React.Fragment>
        )
      })}
    </ResizablePanelGroup>
  )
}

export function VerticalResizeComponent({children}: {children: any[]}) {
  return (
    <ResizablePanelGroup
      direction="vertical"
      className="flex-grow w-full h-full"
    >
      {children.map((child: any, index: number) => {
        const isLast: boolean = index === children.length - 1
        return (
          <React.Fragment key={index}>
            <ResizablePanel defaultSize={10}>
              <div className="flex h-full p-2">
                {child}
              </div>
            </ResizablePanel>
            {isLast ? null : <ResizableHandle withHandle />}
          </React.Fragment>
        )
      })}
    </ResizablePanelGroup>
  )
}