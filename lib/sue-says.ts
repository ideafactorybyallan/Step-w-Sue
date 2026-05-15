export interface TitleConfig {
  label: string;
  emoji: string;
  colorClass: string;
}

export const SUE_SAYS_QUOTES = [
  "Every step is a step away from the couch. Keep going!",
  "Those steps aren't going to count themselves!",
  "The couch is calling — but so is the podium.",
  "If Sue can do it, so can you. (And yes, Sue is watching.)",
  "Put on your shoes. No really, go. I'll wait.",
  "I didn't organize this challenge so you could sit there.",
  "Your legs work. Use them!",
  "Step up. Show up. Let's go! (I mean it.)",
  "The person in first place is also tired. They just kept walking.",
  "Remember: every step counts. Even the ones to the fridge.",
  "Friendly reminder that I know where you live.",
  "It's not about winning... okay it IS about winning. Walk faster.",
  "Rain? Excuses are waterproof. Steps are not.",
  "Your future self will thank you. Start walking.",
  "Even a slow walk beats a fast sit.",
  "Less scrolling. More strolling.",
  "The prize money won't walk itself to you.",
  "Victoria Day is PROUD of you. Don't let her down.",
  "Somewhere out there, a family member is walking right now. Are you?",
  "You got this. Sue believes in you. Now GO.",
];

export function getRandomSueSays(): string {
  return SUE_SAYS_QUOTES[Math.floor(Math.random() * SUE_SAYS_QUOTES.length)];
}

export const PARTICIPANT_TITLES: Record<string, TitleConfig> = {
  first:         { label: 'The Pacesetter',      emoji: '👑', colorClass: 'bg-gold/20 text-gold-dark border-gold/40' },
  second:        { label: 'Hot On Their Heels',  emoji: '🔥', colorClass: 'bg-sw-pink/10 text-sw-pink-dark border-sw-pink/30' },
  third:         { label: 'The Dark Horse',      emoji: '⚡', colorClass: 'bg-sw-teal/10 text-sw-teal-dark border-sw-teal/30' },
  middle:        { label: 'The Grinder',         emoji: '💪', colorClass: 'bg-navy/10 text-navy border-navy/20' },
  last:          { label: 'The Comeback Kid',    emoji: '🌱', colorClass: 'bg-sw-teal/10 text-sw-teal-dark border-sw-teal/30' },
  not_submitted: { label: 'Still Tying Shoes',   emoji: '😴', colorClass: 'bg-gray-100 text-gray-500 border-gray-200' },
  late:          { label: 'Monday Night Panic',  emoji: '🚨', colorClass: 'bg-sw-pink/10 text-sw-pink border-sw-pink/30' },
};

export function getParticipantTitle(
  rank: number,
  total: number,
  hasSubmission: boolean,
  hasLate: boolean,
): TitleConfig {
  if (!hasSubmission) return PARTICIPANT_TITLES.not_submitted;
  if (hasLate && rank > Math.ceil(total / 2)) return PARTICIPANT_TITLES.late;
  if (rank === 1) return PARTICIPANT_TITLES.first;
  if (rank === 2) return PARTICIPANT_TITLES.second;
  if (rank === 3) return PARTICIPANT_TITLES.third;
  if (rank === total) return PARTICIPANT_TITLES.last;
  return PARTICIPANT_TITLES.middle;
}
