import { ChatLauncher } from '@/components/chat/chat-launcher';
import { Card } from '@/components/ui/card';
import { Halo } from '@/components/ui/halo';
import { NoticeCard } from '@/components/ui/notice-card';
import { StatCell } from '@/components/ui/stat-cell';
import { api } from '@/lib/api';
import { ageLabel, bcsLabel, weightLabel } from '@/lib/format';
import type { Pet, WeightEntry } from '@pawlie/domain';

const PawIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 13.2c-2.6 0-5.4 2.1-5.4 4.5 0 1.6 1.1 2.6 2.7 2.6 1 0 1.8-.5 2.7-.5s1.7.5 2.7.5c1.6 0 2.7-1 2.7-2.6 0-2.4-2.8-4.5-5.4-4.5zM6.3 8.4c-1.1-.2-2.2.7-2.5 2-.3 1.4.4 2.7 1.5 2.9 1.1.2 2.2-.7 2.5-2 .3-1.4-.4-2.7-1.5-2.9zm11.4 0c-1.1.2-1.8 1.5-1.5 2.9.3 1.3 1.4 2.2 2.5 2 1.1-.2 1.8-1.5 1.5-2.9-.3-1.3-1.4-2.2-2.5-2zM9.4 3.3c-1.2.1-2 1.5-1.8 3s1.2 2.6 2.4 2.5c1.2-.1 2-1.5 1.8-3s-1.2-2.6-2.4-2.5zm5.2 0c-1.2-.1-2.2 1-2.4 2.5s.6 2.9 1.8 3c1.2.1 2.2-1 2.4-2.5s-.6-2.9-1.8-3z" />
  </svg>
);

const checklist = [
  { label: 'Morning walk', done: true },
  { label: 'Apoquel — 16mg with food', done: true },
  { label: '10 min recall practice', done: false },
  { label: 'Evening meal', done: false },
];

const reminders = [
  { title: 'Heartworm preventive', due: 'Tomorrow' },
  { title: 'DHPP booster', due: 'In 12 days' },
];

async function loadDashboard(petId: string): Promise<{ pet: Pet; weights: WeightEntry[] }> {
  const [pet, weights] = await Promise.all([api.pets.get(petId), api.weights.list(petId, 1)]);
  return { pet, weights };
}

export default async function DashboardPage() {
  const petId = process.env.DEMO_PET_ID;

  if (!petId) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <NoticeCard
          title="No demo pet configured"
          description="Set DEMO_PET_ID in apps/web/.env.local, then run npm run db:seed."
        />
      </main>
    );
  }

  let pet: Pet;
  let weights: WeightEntry[];
  try {
    ({ pet, weights } = await loadDashboard(petId));
  } catch {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <NoticeCard
          title="Pawlie's API isn't reachable"
          description="Make sure the backend is running on http://localhost:4000."
        />
      </main>
    );
  }

  const latestWeight = weights[0];
  const doneCount = checklist.filter((item) => item.done).length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-center gap-5">
        <Halo size={84}>
          <span className="text-on-mint">
            <PawIcon size={34} />
          </span>
        </Halo>
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.09em] text-mint-deep">
            Good morning
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {pet.name}&rsquo;s day
          </h1>
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="sm:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold">Today&rsquo;s care</h2>
            <span className="text-sm font-bold tabular-nums text-mint-deep">
              {doneCount}/{checklist.length}
            </span>
          </div>
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm">
                <span
                  className={`h-5 w-5 rounded-pill ${
                    item.done ? 'bg-mint' : 'bg-mint-tint'
                  }`}
                  aria-hidden
                />
                <span className={item.done ? 'text-ink-soft line-through' : ''}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold">Vitals</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCell icon={<PawIcon size={16} />} label="Age" value={ageLabel(pet.birthDate)} />
            <StatCell
              icon={<PawIcon size={16} />}
              label="Weight"
              value={weightLabel(latestWeight?.weightKg)}
            />
            <StatCell
              icon={<PawIcon size={16} />}
              label="BCS"
              value={bcsLabel(latestWeight?.bodyConditionScore)}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold">Coming up</h2>
          <ul className="space-y-3">
            {reminders.map((reminder) => (
              <li key={reminder.title} className="flex items-center justify-between text-sm">
                <span>{reminder.title}</span>
                <span className="rounded-pill bg-sky-soft px-3 py-1 text-xs font-bold text-sky-deep">
                  {reminder.due}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="sm:col-span-2">
          <ChatLauncher petId={pet.id} petName={pet.name} />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-soft">
        Pawlie is not a veterinarian. For emergencies, contact a vet immediately.
      </p>
    </main>
  );
}
