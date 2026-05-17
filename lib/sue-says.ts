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
  | 'top3-header'
  | 'weekly-roast-winner'
  | 'weekly-roast-pb'
  | 'weekly-roast-close';

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
  'weekly-roast-winner': [
    "Another week, another champion. The rest of you: noted.",
    "That's how it's done. Everyone else, take notes.",
    "Week locked. Winner crowned. Sue is satisfied.",
  ],
  'weekly-roast-pb': [
    "Personal best AND a win? Somebody's been hiding something.",
    "A new record in this house. Sue is begrudgingly impressed.",
    "Peak performance. The rest of you have your work cut out.",
  ],
  'weekly-roast-close': [
    "That was close. Someone should be nervous.",
    "Nail-biter week. Nobody's safe.",
    "Tight race. Sue enjoyed watching you all suffer.",
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

export type { TitleConfig };

const PARTICIPANT_TITLES: Record<string, TitleConfig> = {
  pre_comp:        { label: 'Still Tying Shoes',   emoji: '👟', colorClass: 'bg-gray-100 text-gray-500 border-gray-200' },
  defending_champ: { label: "Last Week's Legend",  emoji: '👑', colorClass: 'bg-gold/20 text-gold-dark border-gold/40' },
  frontrunner:     { label: 'The Frontrunner',     emoji: '🚀', colorClass: 'bg-navy/12 text-navy border-navy/20' },
  most_improved:   { label: 'Most Improved',       emoji: '📈', colorClass: 'bg-sw-teal/10 text-sw-teal-dark border-sw-teal/30' },
  climber:         { label: 'The Climber',         emoji: '🧗', colorClass: 'bg-sw-teal/10 text-sw-teal-dark border-sw-teal/30' },
  rival:           { label: 'The Rival',           emoji: '🔥', colorClass: 'bg-sw-pink/10 text-sw-pink-dark border-sw-pink/30' },
  on_the_bubble:   { label: 'On the Bubble',       emoji: '⚡', colorClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  dark_horse:      { label: 'The Dark Horse',      emoji: '🐎', colorClass: 'bg-navy/[0.07] text-navy/70 border-navy/15' },
  sleeper:         { label: 'The Sleeper',         emoji: '🌙', colorClass: 'bg-gray-100 text-gray-500 border-gray-200' },
  caboose:         { label: 'The Caboose',         emoji: '🚂', colorClass: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export interface TitleEntry {
  participantId: string;
  rank: number;
  stepsByWeek: Map<number, number>;
  prevRank: number;
}

export function assignParticipantTitles(
  entries: TitleEntry[],
  lastWeekWinnerId: string | null,
  challengeStarted: boolean,
  mostRecentWeek: number | null,
): Map<string, TitleConfig> {
  const result = new Map<string, TitleConfig>();

  if (!challengeStarted) {
    for (const e of entries) result.set(e.participantId, PARTICIPANT_TITLES.pre_comp);
    return result;
  }

  const assigned = new Set<string>();
  const assign = (id: string, title: TitleConfig) => {
    if (!assigned.has(id)) { result.set(id, title); assigned.add(id); }
  };

  // 1. Last Week's Legend — winner of the most recently locked week
  if (lastWeekWinnerId) {
    const e = entries.find((e) => e.participantId === lastWeekWinnerId);
    if (e) assign(e.participantId, PARTICIPANT_TITLES.defending_champ);
  }

  // 2. The Frontrunner — rank #1 overall (even if also Last Week's Legend, they only get one title)
  const rank1 = entries.find((e) => e.rank === 1);
  if (rank1) assign(rank1.participantId, PARTICIPANT_TITLES.frontrunner);

  // 3. Most Improved — biggest positive jump vs own prior-week average (week 2+ only)
  if (mostRecentWeek !== null && mostRecentWeek > 1) {
    let bestDelta = -Infinity;
    let bestId: string | null = null;
    for (const e of entries) {
      if (assigned.has(e.participantId)) continue;
      const recentSteps = e.stepsByWeek.get(mostRecentWeek) ?? 0;
      if (recentSteps === 0) continue;
      const prior = [...e.stepsByWeek.entries()]
        .filter(([wn]) => wn < mostRecentWeek)
        .map(([, s]) => s);
      if (prior.length === 0) continue;
      const avg = prior.reduce((a, b) => a + b, 0) / prior.length;
      const delta = recentSteps - avg;
      if (delta > bestDelta) { bestDelta = delta; bestId = e.participantId; }
    }
    if (bestId) assign(bestId, PARTICIPANT_TITLES.most_improved);
  }

  // 4. The Climber — biggest positive rank gain vs previous-week overall rank
  {
    let bestGain = 0;
    let bestId: string | null = null;
    for (const e of entries) {
      if (assigned.has(e.participantId)) continue;
      const gain = e.prevRank - e.rank; // positive = moved up the standings
      if (gain > bestGain) { bestGain = gain; bestId = e.participantId; }
    }
    if (bestId) assign(bestId, PARTICIPANT_TITLES.climber);
  }

  // 5–7. Rank-based slots for unassigned people
  const rank2 = entries.find((e) => e.rank === 2);
  if (rank2) assign(rank2.participantId, PARTICIPANT_TITLES.rival);

  const rank3 = entries.find((e) => e.rank === 3);
  if (rank3) assign(rank3.participantId, PARTICIPANT_TITLES.on_the_bubble);

  const last = entries.find((e) => e.rank === entries.length);
  if (last) assign(last.participantId, PARTICIPANT_TITLES.caboose);

  // 8–9. Remaining middle — top half → Dark Horse, bottom half → Sleeper
  const remaining = entries
    .filter((e) => !assigned.has(e.participantId))
    .sort((a, b) => a.rank - b.rank);
  const mid = Math.ceil(remaining.length / 2);
  remaining.forEach((e, i) => {
    assign(e.participantId, i < mid ? PARTICIPANT_TITLES.dark_horse : PARTICIPANT_TITLES.sleeper);
  });

  return result;
}
