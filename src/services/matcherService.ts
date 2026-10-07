import { BuyerProfile, CPFCalculationResult, HDBTown, TownMatchScore } from '../types/hdb';

/**
 * Score each town based on the 3 buyer conditions:
 * 1. Commute to selected work location
 * 2. Budget affordability against CPF calculated max price
 * 3. Amenities proximity (Schools, Malls, MRT, Food)
 */
export function matchTowns(
  towns: HDBTown[],
  profile: BuyerProfile,
  cpfResult: CPFCalculationResult
): TownMatchScore[] {
  const { selectedWorkplaceId, commuteMode, maxCommuteMinutes, preferredFlatType, amenityPriorities } =
    profile;

  const maxBudget = cpfResult.maxAffordablePrice;

  return towns.map((town) => {
    // 1. Commute Scoring
    const commuteData = town.baseCommutesMinutes[selectedWorkplaceId] || {
      transit: 40,
      driving: 25,
    };
    const commuteMinutes = commuteMode === 'driving' ? commuteData.driving : commuteData.transit;

    // Commute Score (0 - 100):
    // 15 mins or less = 100
    // At maxCommuteMinutes = 60
    // Beyond maxCommuteMinutes drops steeply
    let commuteScore = 100;
    if (commuteMinutes <= 20) {
      commuteScore = 100;
    } else if (commuteMinutes <= maxCommuteMinutes) {
      const ratio = (commuteMinutes - 20) / Math.max(1, maxCommuteMinutes - 20);
      commuteScore = Math.round(100 - ratio * 40); // 100 down to 60
    } else {
      const overMinutes = commuteMinutes - maxCommuteMinutes;
      commuteScore = Math.max(15, Math.round(60 - overMinutes * 2));
    }

    // 2. Budget Scoring
    const medianPrice = town.medianPrices[preferredFlatType] || 600000;
    const priceDiffFromBudget = medianPrice - maxBudget; // negative = affordable!
    const isWithinBudget = priceDiffFromBudget <= 0;

    let budgetScore = 50;
    if (isWithinBudget) {
      // Under budget: bonus for affordability margin
      const savings = Math.abs(priceDiffFromBudget);
      const savingsRatio = Math.min(1, savings / (maxBudget * 0.3));
      budgetScore = Math.round(80 + savingsRatio * 20); // 80 to 100
    } else {
      // Over budget: penalty based on how far over
      const overshootRatio = priceDiffFromBudget / maxBudget;
      if (overshootRatio <= 0.05) {
        budgetScore = 70; // slight stretch
      } else if (overshootRatio <= 0.15) {
        budgetScore = 50;
      } else {
        budgetScore = Math.max(10, Math.round(50 - overshootRatio * 100));
      }
    }

    // 3. Amenities Scoring
    // Factors: Notable primary schools, Malls, MRT lines, Supermarkets
    let schoolPoints = 0;
    const popularSchools = town.notableSchools.filter((s) => s.category === 'Popular').length;
    schoolPoints = popularSchools * 35 + (town.notableSchools.length - popularSchools) * 15;
    schoolPoints = Math.min(100, schoolPoints);

    let mallPoints = 0;
    const connectedMalls = town.shoppingMalls.filter((m) => m.mrtConnected).length;
    mallPoints = connectedMalls * 40 + (town.shoppingMalls.length - connectedMalls) * 20;
    mallPoints = Math.min(100, mallPoints);

    const mrtPoints = Math.min(100, town.mrtLines.length * 40 + town.mrtStations.length * 10);
    const foodPoints = Math.min(100, town.hawkerCentresCount * 12 + town.supermarketsCount * 4);

    // Weighted average according to user priority sliders (1 to 5)
    const wSchool = amenityPriorities.primarySchools || 3;
    const wMall = amenityPriorities.shoppingMalls || 3;
    const wMrt = amenityPriorities.mrtProximity || 4;
    const wFood = amenityPriorities.hawkerFood || 3;
    const totalWeights = wSchool + wMall + wMrt + wFood;

    const amenitiesScore = Math.round(
      (schoolPoints * wSchool +
        mallPoints * wMall +
        mrtPoints * wMrt +
        foodPoints * wFood) /
        totalWeights
    );

    // Composite Overall Score:
    // 40% Commute, 35% Budget, 25% Amenities
    const overallScore = Math.round(
      commuteScore * 0.4 + budgetScore * 0.35 + amenitiesScore * 0.25
    );

    // Badges
    const highlightBadges: string[] = [];
    if (overallScore >= 88) highlightBadges.push('Best Match');
    if (commuteMinutes <= 25) highlightBadges.push(`Quick Commute (${commuteMinutes}m)`);
    if (isWithinBudget && Math.abs(priceDiffFromBudget) >= 80000)
      highlightBadges.push(`Save $${Math.round(Math.abs(priceDiffFromBudget) / 1000)}k`);
    if (popularSchools >= 2) highlightBadges.push('Top Schools (1km)');
    if (connectedMalls >= 2) highlightBadges.push('Connected Malls');
    if (town.mrtLines.length >= 2) highlightBadges.push('MRT Interchange');

    return {
      town,
      overallScore,
      commuteScore,
      commuteMinutes,
      budgetScore,
      medianPrice,
      priceDiffFromBudget,
      isWithinBudget,
      amenitiesScore,
      highlightBadges: highlightBadges.slice(0, 3),
    };
  }).sort((a, b) => b.overallScore - a.overallScore);
}
