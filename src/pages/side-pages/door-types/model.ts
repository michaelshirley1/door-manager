export interface DoorTypesPageProps {}

export interface DoorPricingEntry {
    id: number;
    doorTypeId: number;
    heightMm: number;
    widthMm: number;
    price: number;
}

export interface DoorType {
    id: number;
    name: string;
    leafType?: string | null;
    material: string | null;
    productRange?: string | null;
    heightMm?: number | null;
    widthSize?: string | null;
    skinThickness?: string | null;
    description: string | null;
    isPOA?: boolean;
    price: number;
    notes?: string | null;
    isActive: boolean;
    prices?: DoorPricingEntry[];
    createdAt: string;
}
