export type FlatType = '2 ROOM' | '3 ROOM' | '4 ROOM' | '5 ROOM' | 'EXECUTIVE';

export type BuyerStatus = 'first_timer_couple' | 'first_timer_single' | 'second_timer';

export type LoanType = 'hdb_concessionary' | 'bank_loan';

export type CommuteMode = 'transit' | 'driving';

export interface Workplace {
  id: string;
  name: string;
  region: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
}

export interface AmenitySchool {
  name: string;
  category: 'Popular' | 'Standard';
  distanceEstimate: string; // e.g. "Within 1km"
}

export interface AmenityMall {
  name: string;
  mrtConnected: boolean;
}

export interface HDBTown {
  id: string;
  name: string; // e.g. "PUNGGOL"
  displayName: string; // e.g. "Punggol"
  region: 'North' | 'North-East' | 'East' | 'West' | 'Central';
  lat: number;
  lng: number;
  mrtLines: string[]; // ['NEL', 'CPRL']
  mrtStations: string[];
  medianPrices: Record<FlatType, number>; // fallback / baseline median prices in SGD
  notableSchools: AmenitySchool[];
  shoppingMalls: AmenityMall[];
  supermarketsCount: number;
  hawkerCentresCount: number;
  hasPolyclinic: boolean;
  hasParkConnector: boolean;
  baseCommutesMinutes: Record<string, { transit: number; driving: number }>; // workplaceId -> minutes
  description: string;
  vibe: string;
}

export interface BuyerProfile {
  buyerStatus: BuyerStatus;
  monthlyHouseholdIncome: number;
  cpfOaBalance: number;
  cashSavings: number;
  monthlyOaContributionRate: number; // default ~23% of income (capped at wage ceiling)
  nearParents: boolean; // within 4km or living together for PHG
  livingWithParents: boolean;
  loanType: LoanType;
  loanTenureYears: number; // e.g. 25
  preferredFlatType: FlatType;
  selectedWorkplaceId: string;
  maxCommuteMinutes: number;
  commuteMode: CommuteMode;
  amenityPriorities: {
    primarySchools: number; // 0 to 5 importance
    shoppingMalls: number;
    mrtProximity: number;
    hawkerFood: number;
  };
}

export interface CPFGrantBreakdown {
  ehg: number; // Enhanced CPF Housing Grant
  familyGrant: number; // CPF Housing Grant for Family or Singles Grant
  phg: number; // Proximity Housing Grant
  totalGrants: number;
}

export interface CPFCalculationResult {
  grants: CPFGrantBreakdown;
  maxAffordablePrice: number;
  maxLoanAmount: number;
  msrMonthlyCap: number; // 30% of monthly income
  monthlyInstallmentAtMaxLoan: number;
  monthlyCpfContributionAvailable: number;
  cashTopUpRequiredMonthly: number;
  minDownpaymentRequired: number; // at max price
  financialHealth: 'Safe' | 'Comfortable' | 'Tight';
  loanInterestRate: number; // e.g. 0.026
}

export interface TownMatchScore {
  town: HDBTown;
  overallScore: number; // 0 to 100
  commuteScore: number; // 0 to 100
  commuteMinutes: number;
  budgetScore: number; // 0 to 100
  medianPrice: number;
  priceDiffFromBudget: number; // negative means under budget (affordable!)
  isWithinBudget: boolean;
  amenitiesScore: number; // 0 to 100
  highlightBadges: string[];
}

export interface DataGovRecord {
  _id: number;
  month: string;
  town: string;
  flat_type: string;
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: string;
  flat_model: string;
  lease_commence_date: string;
  remaining_lease: string;
  resale_price: string;
}

export interface DataGovMetadata {
  datasetId: string;
  name: string;
  lastUpdatedAt: string;
  datasetSize: number;
  coverageStart: string;
  coverageEnd: string;
  totalRecordsEstimate?: number;
}
