'use client'

import { useFullscreen } from '@mantine/hooks';
import { Expand, Shrink } from 'lucide-react';
import { Button } from './ui/button';

export default function FullScreenToggle() {
  const { toggle, fullscreen } = useFullscreen();

  return (
    <div>
      {fullscreen ?
        <Button onClick={toggle} size={'icon'}>
          <Shrink
            className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all'
          />
        </Button>
        :
        <Button onClick={toggle} size={'icon'}>
          <Expand
            className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all'
          />
        </Button>
      }
      <span className="sr-only">Toggle fullscreen</span>
    </div>
  )
}