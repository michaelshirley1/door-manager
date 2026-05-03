export interface HingeTypesPageProps {}

export interface HingeType {
    id: number;
    name: string;
    finish: string | null;
    sizeMm?: string | null;
    description: string | null;
    isActive: boolean;
    price: number;
    createdAt: string;
}
