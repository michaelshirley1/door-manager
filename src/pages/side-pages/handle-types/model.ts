export interface HandleTypesPageProps {}

export interface HandleType {
    id: number;
    name: string;
    finish: string | null;
    mechanism: string | null;
    description: string | null;
    isActive: boolean;
    price: number;
    createdAt: string;
}
