export function calculatePrizePool(participantCount: number) {
  const overallPrize = participantCount * 20;
  const weeklyPrizePerWeek = participantCount * 5;
  const totalWeeklyPrize = weeklyPrizePerWeek * 4;
  const totalPrizePool = participantCount * 40;

  return {
    overallPrize,
    weeklyPrizePerWeek,
    totalWeeklyPrize,
    totalPrizePool,
    perPersonBuyIn: 40,
    participantCount,
  };
}

export function fmt(amount: number): string {
  return `$${amount}`;
}
