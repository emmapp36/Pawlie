interface NoticeCardProps {
  title: string;
  description: string;
}

export function NoticeCard({ title, description }: NoticeCardProps) {
  return (
    <div className="mx-auto max-w-md rounded-card bg-surface p-8 text-center shadow-soft">
      <h1 className="font-display text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">{description}</p>
    </div>
  );
}
