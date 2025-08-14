import { Stakeholder } from "./stakeholder";

export type MeasureGrading = {
  key: string;
  prio: number;
  statusQuo?: number;
};

export type StakeholderMeasureGrading = {
  stakeholder: number;
  gradings: MeasureGrading[];
};

export type ChosenStakeholder = {
  id: number;
  weight: number | null;
  justification: string | null;
};

export type IroSelection = {
  key: string;
  prio: number;
  relevant: boolean | null;
  justification: string | null;
};

export type IroAssessment = {
  key: string;
  impact: number | null;
  risk: number | null;
  opportunity: number | null;
  justification: string;
  chosen: boolean;
};

export type Reporting = {
  key: string;
  name: string;
  impact: string | null;
  risk: string | null;
  riskMitigation: string | null;
  targets: string | null;
};

export type Customer = {
  id: number;
  name: string;
  base64Image: string;
  stakeholders: Stakeholder[];
  stakeholderMeasureGradings: StakeholderMeasureGrading[];
  chosenStakeholders: ChosenStakeholder[];
  measureGradings: MeasureGrading[];
  iroSelection: IroSelection[];
  iroAssessment: IroAssessment[];
  reportings: Reporting[];
};