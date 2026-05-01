export interface JobPageProps {}

export interface Job {
    id: number;
    jobNumber: string | null;
    customerId: number;
    customerName: string;
    status: string;
    siteAddress: string | null;
    assignedTo: string | null;
    scheduledDate: string | null;
    completedDate: string | null;
    purchaseOrderId: number | null;
    notes: string | null;
    items?: OrderItem[]
}

export interface OrderItem {
  id: number;
  jobId?: number;
  quoteId?: number | null;
  itemType: 'Door' | 'Handle' | 'Hinge' | 'Hardware' | 'Freight';
  doorTypeId?: number | null;
  hingeTypeId?: number | null;
  handleTypeId?: number | null;
  room?: string | null;
  assembly?: string | null;
  heightMm?: number | null;
  widthMm?: number | null;
  thicknessMm?: number | null;
  handSide?: string | null;
  drilling: boolean | null;
  drillSize?: string | null;
  jam?: string | null;
  colourFinish?: string | null;
  glazing?: string | null;
  fireRating?: string | null;
  trackSystem?: string | null;
  trackType?: string | null;
  quantity: number | null;
  unitPrice?: number | null;
  notes?: string | null;
  sortOrder: number | null;
  createdAt: Date | null;
}
