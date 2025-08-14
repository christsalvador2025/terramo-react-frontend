export type Stakeholder = {
    id: number;
    name: string;
    dataAvailable: boolean;
    chosen: boolean;
    weight: number | null;
    justification: string | null;
};