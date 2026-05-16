interface TitleConfig {
  label: string;
  emoji: string;
  colorClass: string;
}

// Contextual Sue voice — short, curated quotes per app state.
// Use `sueFor(context)` to pick a random one. Quotes stay in Sue's voice:
// confident, lightly sarcastic, never patronizing.
export type SueContext =
  | 'loading'
  | 'empty'
  | 'success-pb'
  | 'success-top3'
  | 'success-climbed'
  | 'success-default'
  | 'late-submit'
  | 'monday-nudge'
  | 'observer'
  | 'top3-header';

const CONTEXT_QUOTES: Record<SueContext, string[]> = {
  loading: [
    'Tallying the damage…',
    'Counting your steps. And judging.',
    'Pulling the receipts…',
    'Sue is checking your work.',
  ],
  empty: [
    "No one's stepped up yet. Be the legend.",
    'Empty leaderboard. Bold move.',
    'The podium is just sitting there. Take it.',
  ],
  'success-pb': [
    "Now THAT'S a week. Personal best secured.",
    'Look at you. Sue is begrudgingly impressed.',
    "Best week yet. Don't get cocky. Yet.",
  ],
  'success-top3': [
    'Podium energy. Keep it up.',
    'Top three. Sue notices these things.',
    "The view's better up here, isn't it?",
  ],
  'success-climbed': [
    'Movement on the leaderboard. I see you.',
    'Up the rankings you go. Keep walking.',
    'Climbing. Sue approves.',
  ],
  'success-default': [
    'Logged. Steps don’t lie.',
    'Submitted. Now go for another walk.',
    "Locked in. On to next week's chaos.",
  ],
  'late-submit': [
    "Late, but it counts. Don't make it a habit.",
    'Cutting it close. Sue is watching.',
    "Better late than not at all. Sue is judging, but it's in.",
  ],
  'monday-nudge': [
    "It's Monday. Sue is awake. Submit your steps.",
    "Submission Monday — don't make Sue come find you.",
    "Don't leave steps on the table. Lock it in.",
  ],
  observer: [
    "You've got the best seat. Sue's keeping score.",
    'Watch closely. Cheer if you must. Definitely judge.',
    "No steps to log, but plenty of drama to enjoy.",
  ],
  'top3-header': [
    'These three are untouchable. For now.',
    'Top three. The view is good up here.',
    'The podium. Sue salutes.',
  ],
};

export function sueFor(ctx: SueContext): string {
  const list = CONTEXT_QUOTES[ctx];
  return list[Math.floor(Math.random() * list.length)];
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
  "Steps don't lie. Your phone is telling on you.",
  "I'm not mad. I'm just disappointed. (And also a little mad.)",
  "Walk now, brag later.",
  "The leaderboard is RIGHT THERE. Don't be at the bottom.",
  "If you're reading this, you should be walking.",
  "Excuses don't burn calories. Walking does.",
  "Your dog wants to go for a walk. Listen to your dog.",
  "Pace of a turtle still beats parked on the couch.",
  "I see you scrolling. I see you.",
  "Pretend you forgot something at the store. Walk back.",
  "Park further away. Yes, on purpose.",
  "Take the stairs. The elevator is for people not in a step challenge.",
  "Walking meetings exist for a reason. Steal that idea.",
  "Your steps are showing. Make them count.",
  "Auntie Sue says: HUSTLE.",
  "There's no 'I' in steps. But there is in 'WIN.' Wait, no there isn't.",
  "The cousins are watching. Don't embarrass yourself.",
  "Steps before snacks. Or steps AND snacks. Either way: STEPS.",
  "You don't have to be fast. You just have to start.",
  "One more loop around the block won't kill you.",
  "Your phone tracks steps. Your phone is also a snitch.",
  "Be the family member they talk about at Thanksgiving — for the right reasons.",
  "Today's steps are tomorrow's bragging rights.",
  "Walk like someone owes you money.",
  "If your watch buzzes, it's me. Get up.",
  "$$$ is on the line. Walk for the money. Walk for the glory.",
  "Sitting is the new smoking. Stand up. Walk somewhere. ANYWHERE.",
  "You can rest when the challenge is over. Until then: MOVE.",
  "I organized this whole thing. The least you can do is walk.",
  "Last place gets nothing but my judgement. Don't be last.",
  "Your future grandkids will hear about this. Make it good.",
  "Take a walk. Call your mother. (Hi, it's me.)",
  "If walking was easy everyone would do it. Oh wait, it is. Do it.",
  "The driveway counts. The mailbox counts. GO.",
];

const PARTICIPANT_TITLES: Record<string, TitleConfig> = {
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
