'use client';

import { motion } from '@pawlie/tokens';
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Halo } from '@/components/ui/halo';
import { api } from '@/lib/api';

interface ChatPanelProps {
  petId: string;
  petName: string;
  onClose: () => void;
}

interface AssistantTurn {
  id: string;
  role: 'assistant';
  text: string;
  streaming: boolean;
  triageQuestion?: string;
  quickReplies?: string[];
  emergency?: { reason: string; hotline: string };
  journalSuggestion?: string;
}

interface UserTurn {
  id: string;
  role: 'user';
  text: string;
}

interface ErrorTurn {
  id: string;
  role: 'error';
  text: string;
}

type Turn = AssistantTurn | UserTurn | ErrorTurn;

const extractTel = (hotline: string): string | null => {
  const match = hotline.match(/(\+?\d[\d\s-]{6,}\d)/);
  return match ? match[0].replace(/[\s-]/g, '') : null;
};

export function ChatPanel({ petId, petName, onClose }: ChatPanelProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 'greeting',
      role: 'assistant',
      text: `Hi, I'm Pawlie. Ask me anything about ${petName} — health, food, training, or behaviour.`,
      streaming: false,
    },
  ]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    inputRef.current?.focus();
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setClosing(true);
    setVisible(false);
    setTimeout(onClose, motion.exitMs);
  }

  const transitionMs = closing ? motion.exitMs : motion.enterMs;

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const assistantId = crypto.randomUUID();
    setTurns((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: trimmed },
      { id: assistantId, role: 'assistant', text: '', streaming: true },
    ]);
    setInput('');
    setSending(true);

    const patchAssistant = (patch: Partial<AssistantTurn>) => {
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === assistantId && turn.role === 'assistant' ? { ...turn, ...patch } : turn,
        ),
      );
    };

    try {
      for await (const event of api.chat(petId, trimmed, conversationId)) {
        switch (event.kind) {
          case 'meta':
            setConversationId(event.conversationId);
            break;
          case 'token':
            setTurns((prev) =>
              prev.map((turn) =>
                turn.id === assistantId && turn.role === 'assistant'
                  ? { ...turn, text: turn.text + event.text }
                  : turn,
              ),
            );
            break;
          case 'triage_question':
            patchAssistant({ triageQuestion: event.question, quickReplies: event.quickReplies });
            break;
          case 'emergency_flag':
            patchAssistant({ emergency: { reason: event.reason, hotline: event.hotline } });
            break;
          case 'journal_suggestion':
            patchAssistant({ journalSuggestion: event.title });
            break;
          case 'done':
            patchAssistant({ streaming: false });
            break;
        }
      }
    } catch {
      patchAssistant({ streaming: false });
      setTurns((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'error',
          text: "Couldn't reach Pawlie. Check that the API server is running on port 4000.",
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleQuickReply(assistantId: string, reply: string) {
    setTurns((prev) =>
      prev.map((turn) =>
        turn.id === assistantId && turn.role === 'assistant'
          ? { ...turn, quickReplies: undefined }
          : turn,
      ),
    );
    void sendMessage(reply);
  }

  function handleScrimKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') handleClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        role="presentation"
        onClick={handleClose}
        onKeyDown={handleScrimKeyDown}
        className="absolute inset-0 bg-[#12160F]/45 transition-opacity"
        style={{ opacity: visible ? 1 : 0, transitionDuration: `${transitionMs}ms` }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Chat with Pawlie about ${petName}`}
        className="relative flex h-full w-full max-w-md flex-col rounded-l-card bg-surface shadow-lift transition-transform"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transitionDuration: `${transitionMs}ms`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <Halo size={44} tone="mint">
            <span aria-hidden className="text-sm font-bold text-on-mint">
              {petName.slice(0, 1)}
            </span>
          </Halo>
          <div className="flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.09em] text-mint-deep">
              Ask Pawlie
            </p>
            <h2 className="font-display text-base font-bold">{petName}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close chat"
            className="flex h-9 w-9 items-center justify-center rounded-pill text-ink-soft transition-colors hover:bg-mint-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint-deep"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
        >
          {turns.map((turn) => (
            <TurnBubble
              key={turn.id}
              turn={turn}
              onQuickReply={(reply) => handleQuickReply(turn.id, reply)}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-line px-5 py-4">
          <label htmlFor="pawlie-chat-input" className="sr-only">
            Message Pawlie about {petName}
          </label>
          <div className="flex items-center gap-2 rounded-pill bg-mint-tint px-2 py-2 pl-4">
            <input
              id="pawlie-chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={`Ask about ${petName}...`}
              autoComplete="off"
              disabled={sending}
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-mint text-on-mint transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M2 8h11M8 2l5 6-5 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] text-ink-soft">
            Pawlie is not a veterinarian. For emergencies, contact a vet immediately.
          </p>
        </form>
      </div>
    </div>
  );
}

function TurnBubble({
  turn,
  onQuickReply,
}: {
  turn: Turn;
  onQuickReply: (reply: string) => void;
}) {
  if (turn.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-chat rounded-br-md bg-mint px-4 py-2.5 text-sm font-semibold text-on-mint">
          {turn.text}
        </p>
      </div>
    );
  }

  if (turn.role === 'error') {
    return (
      <div className="rounded-panel bg-danger-soft px-4 py-3 text-sm text-danger">{turn.text}</div>
    );
  }

  const tel = turn.emergency ? extractTel(turn.emergency.hotline) : null;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="max-w-[85%] rounded-chat rounded-bl-md bg-surface px-4 py-2.5 text-sm shadow-soft">
        {turn.text}
        {turn.streaming && (
          <span className="ml-1 inline-block h-3 w-[2px] animate-pulse bg-mint-deep align-middle" />
        )}
      </div>

      {turn.emergency && (
        <div className="w-full max-w-[85%] rounded-panel bg-sky-soft px-4 py-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.09em] text-sky-deep">
            This could be serious
          </p>
          <p className="mt-1 text-sm text-sky-deep">{turn.emergency.hotline}</p>
          {tel && (
            <a
              href={`tel:${tel}`}
              className="mt-3 inline-flex items-center justify-center rounded-pill bg-sky-deep px-5 py-2 text-xs font-bold text-white transition-transform active:scale-95"
            >
              Call now
            </a>
          )}
        </div>
      )}

      {turn.quickReplies && turn.quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {turn.quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onQuickReply(reply)}
              className="rounded-pill bg-mint-tint px-3.5 py-1.5 text-xs font-semibold text-mint-deep transition-colors hover:bg-mint hover:text-on-mint"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {turn.journalSuggestion && (
        <p className="pl-1 text-[11px] text-ink-soft">
          Logged to journal &middot; {turn.journalSuggestion}
        </p>
      )}
    </div>
  );
}
