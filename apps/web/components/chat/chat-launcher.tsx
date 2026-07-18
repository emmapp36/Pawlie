'use client';

import { useState } from 'react';
import { PillButton } from '@/components/ui/pill-button';
import { ChatPanel } from './chat-panel';

interface ChatLauncherProps {
  petId: string;
  petName: string;
}

export function ChatLauncher({ petId, petName }: ChatLauncherProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PillButton fullWidth onClick={() => setOpen(true)}>
        Ask Pawlie about {petName}
      </PillButton>
      {open && (
        <ChatPanel petId={petId} petName={petName} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
