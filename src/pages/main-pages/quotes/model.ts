export interface QuotesPageProps {}

export type QuoteStatus =
    | 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired' | 'Nullified'
    | 'Order' | 'Dispatched' | 'Delivered'
    | 'Invoice' | 'Paid';

export interface Quote {
    id: number;
    quoteNumber: string;
    customerId: number;
    customerName: string;
    status: QuoteStatus;
    totalAmount: number | null;
    deliveryDate: string | null;
    validUntil: string | null;
    createdBy: string | null;
    notes: string | null;
    jobId?: number | null;
    jobNumber?: string | null;
    items?: import('../jobs/model').OrderItem[];
    // Populated when converted to Invoice
    subtotal?: number | null;
    taxRate?: number | null;
    taxAmount?: number | null;
    total?: number | null;
    amountPaid?: number | null;
    dueDate?: string | null;
    issuedAt?: string | null;
    paidAt?: string | null;
}
