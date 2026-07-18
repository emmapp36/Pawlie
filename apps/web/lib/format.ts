export function ageLabel(birthDateIso: string | null): string {
  if (!birthDateIso) return 'Unknown';

  const birth = new Date(birthDateIso);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return 'Unknown';
  if (months < 12) return `${months} mo`;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (remainder === 0) return `${years} yr${years === 1 ? '' : 's'}`;
  return `${years}y ${remainder}m`;
}

export function weightLabel(kg: number | undefined): string {
  return kg === undefined ? '—' : `${kg.toFixed(1)} kg`;
}

export function bcsLabel(score: number | null | undefined): string {
  return score === null || score === undefined ? '—' : `${score} / 9`;
}
