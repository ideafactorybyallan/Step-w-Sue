import { Badge } from './ui/Badge';
import { PARTICIPANT_TITLES } from '@/lib/sue-says';

interface Props {
  titleKey: string;
  emoji?: string;
}

export function ParticipantTitle({ titleKey, emoji }: Props) {
  const cfg = PARTICIPANT_TITLES[titleKey] ?? PARTICIPANT_TITLES.middle;
  return (
    <Badge colorClass={cfg.colorClass}>
      {emoji ?? cfg.emoji} {cfg.label}
    </Badge>
  );
}
