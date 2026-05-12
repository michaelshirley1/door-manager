import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { Table } from '../../../../components/table';
import Loading from '../../../../components/loading';
import Button from '../../../../components/button';
import { Quote, QuoteStatus } from '../model';
import { getQuote, createQuote, updateQuote, deleteQuote } from '../api';
import { Customer } from '../../customers/model';
import { getCustomers } from '../../customers/api';
import { DoorType } from '../../../side-pages/door-types/model';
import { HingeType } from '../../../side-pages/hinge-types/model';
import { HandleType } from '../../../side-pages/handle-types/model';
import { getDoorTypes } from '../../../side-pages/door-types/api';
import { getHingeTypes } from '../../../side-pages/hinge-types/api';
import { getHandleTypes } from '../../../side-pages/handle-types/api';
import { OrderItem } from '../../jobs/model';
import QuoteItemModal from './item-modal';

const ORDER_STATUSES = ['Order', 'Dispatched', 'Delivered'];
const INVOICE_STATUSES = ['Invoice', 'Paid'];

const calcItemsTotal = (items: OrderItem[]): number =>
    items.reduce((sum, item) => sum + ((item.unitPrice ?? 0) * (item.quantity ?? 1)), 0);

const QuoteFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Quote | undefined>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [doorTypes, setDoorTypes] = useState<DoorType[]>([]);
    const [hingeTypes, setHingeTypes] = useState<HingeType[]>([]);
    const [handleTypes, setHandleTypes] = useState<HandleType[]>([]);
    const [addModal, setAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        quoteNumber:  '',
        customerId:   '',
        customerName: '',
        status:       'Draft',
        deliveryDate: '',
        validUntil:   '',
        createdBy:    '',
        notes:        '',
        items:        [] as OrderItem[],
        subtotal:     '',
        taxRate:      '0.10',
        dueDate:      '',
        amountPaid:   '',
        jobId:        null as number | null,
        jobNumber:    null as string | null,
    });

    useEffect(() => {
        if (!id) { navigate('/quotes'); return; }

        const lookups = [
            getCustomers().then(setCustomers),
            getDoorTypes().then(setDoorTypes),
            getHingeTypes().then(setHingeTypes),
            getHandleTypes().then(setHandleTypes),
            getQuote(parseInt(id)).then(quote => {
                setExisting(quote);
                setForm({
                    quoteNumber:  quote.quoteNumber  ?? '',
                    customerId:   quote.customerId?.toString() ?? '',
                    customerName: quote.customerName ?? '',
                    status:       quote.status       ?? 'Draft',
                    deliveryDate: quote.deliveryDate ?? '',
                    validUntil:   quote.validUntil   ?? '',
                    createdBy:    quote.createdBy    ?? '',
                    notes:        quote.notes        ?? '',
                    items:        quote.items        ?? [],
                    subtotal:     quote.subtotal?.toString() ?? '',
                    taxRate:      quote.taxRate?.toString()  ?? '0.10',
                    dueDate:      quote.dueDate      ?? '',
                    amountPaid:   quote.amountPaid?.toString() ?? '',
                    jobId:        quote.jobId        ?? null,
                    jobNumber:    quote.jobNumber    ?? null,
                });
            }),
        ];

        Promise.all(lookups)
            .catch(() => setError('Failed to load data. Check your connection and try again.'))
            .finally(() => setLoading(false));
    }, [id]);

    const itemsTotal = calcItemsTotal(form.items);
    const subtotalValue = parseFloat(form.subtotal) || 0;
    const taxRateValue  = parseFloat(form.taxRate)  || 0.10;
    const taxAmount     = Math.round(subtotalValue * taxRateValue * 100) / 100;
    const grandTotal    = Math.round((subtotalValue + taxAmount) * 100) / 100;

    const isOrder   = ORDER_STATUSES.includes(form.status);
    const isInvoice = INVOICE_STATUSES.includes(form.status);

    const getReturnPath = () => {
        if (form.jobId) return `/jobs/${form.jobId}/edit`;
        return '/quotes';
    };

    const stageLabel = () => {
        if (isInvoice) return 'Invoice';
        if (isOrder)   return 'Order';
        return 'Quote';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = customers.find(c => c.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, customerId: e.target.value, customerName: c ? (c.companyName ?? c.name) : '' }));
    };

    const buildSaveData = (): Omit<Quote, 'id'> => ({
        quoteNumber:  form.quoteNumber,
        customerId:   parseInt(form.customerId) || 0,
        customerName: form.customerName,
        status:       form.status as QuoteStatus,
        totalAmount:  itemsTotal || null,
        deliveryDate: form.deliveryDate || null,
        validUntil:   form.validUntil   || null,
        createdBy:    form.createdBy    || null,
        notes:        form.notes        || null,
        items:        form.items,
        subtotal:     form.subtotal   ? subtotalValue  : null,
        taxRate:      form.subtotal   ? taxRateValue   : null,
        taxAmount:    form.subtotal   ? taxAmount      : null,
        total:        form.subtotal   ? grandTotal     : null,
        amountPaid:   form.amountPaid ? parseFloat(form.amountPaid) : null,
        dueDate:      form.dueDate    || null,
        issuedAt:     existing?.issuedAt ?? null,
        paidAt:       existing?.paidAt   ?? null,
        jobId:        form.jobId,
        jobNumber:    form.jobNumber,
    });

    const handleSubmit = () => {
        setError(null);
        const data = buildSaveData();
        const action = existing
            ? updateQuote(existing.id, { ...existing, ...data })
            : createQuote(data);
        action
            .then(() => navigate(getReturnPath()))
            .catch(() => setError('Failed to save. Please try again.'));
    };

    const handleDelete = () => {
        if (!existing) return;
        setError(null);
        deleteQuote(existing.id)
            .then(() => navigate(getReturnPath()))
            .catch(() => setError('Failed to delete. Please try again.'));
    };

    const transitionStatus = (newStatus: string, extra?: Partial<Quote>) => {
        if (!existing) return;
        setError(null);
        const data: Quote = { ...existing, ...buildSaveData(), status: newStatus as Quote['status'], ...extra };
        updateQuote(existing.id, data)
            .then(updated => {
                setExisting(updated);
                setForm(prev => ({ ...prev, status: newStatus }));
            })
            .catch(() => setError('Failed to update status. Please try again.'));
    };

    const handleConvertToOrder = () => transitionStatus('Order');
    const handleMarkDispatched = () => transitionStatus('Dispatched');
    const handleMarkDelivered  = () => transitionStatus('Delivered');

    const handleConvertToInvoice = () => {
        if (!existing) return;
        setError(null);
        const sub    = itemsTotal;
        const tRate  = 0.10;
        const tAmt   = Math.round(sub * tRate * 100) / 100;
        const gTotal = Math.round((sub + tAmt) * 100) / 100;
        const extra: Partial<Quote> = {
            subtotal:  sub,
            taxRate:   tRate,
            taxAmount: tAmt,
            total:     gTotal,
            issuedAt:  new Date().toISOString().split('T')[0],
        };
        const data: Quote = { ...existing, ...buildSaveData(), status: 'Invoice', ...extra };
        updateQuote(existing.id, data)
            .then(updated => {
                setExisting(updated);
                setForm(prev => ({
                    ...prev,
                    status:   'Invoice',
                    subtotal: sub.toFixed(2),
                    taxRate:  tRate.toString(),
                }));
            })
            .catch(() => setError('Failed to convert to invoice. Please try again.'));
    };

    const handleMarkPaid = () => {
        transitionStatus('Paid', { paidAt: new Date().toISOString().split('T')[0] });
    };

    const handlePrintDocket = (type: 'Production' | 'Dispatch') => {
        const win = window.open('', '_blank');
        if (!win) return;
        const itemRows = form.items.map(item => {
            const dt = doorTypes.find(d => d.id === item.doorTypeId);
            const ht = handleTypes.find(h => h.id === item.handleTypeId);
            const typeName = dt?.name ?? item.itemType;
            const handleInfo = ht ? ` + ${ht.name}${ht.finish ? ` (${ht.finish})` : ''}` : '';
            return `<tr>
                <td>${item.room ?? '—'}</td>
                <td>${item.assembly ?? '—'}</td>
                <td>${typeName}${handleInfo}</td>
                <td>${item.heightMm ?? '—'} × ${item.widthMm ?? '—'}</td>
                <td>${item.colourFinish ?? '—'}</td>
                <td>${item.handSide ?? '—'}</td>
                <td>${item.quantity ?? 1}</td>
            </tr>`;
        }).join('');
        win.document.write(`
            <html><head><title>${type} Docket — ${form.quoteNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
                h2 { margin-bottom: 4px; }
                p { margin: 2px 0; color: #555; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                th { background: #f0f0f0; padding: 8px; text-align: left; font-size: 12px; border: 1px solid #ccc; }
                td { padding: 8px; font-size: 12px; border: 1px solid #ccc; }
            </style></head><body>
            <h2>${type} Docket</h2>
            <p><strong>Order:</strong> ${form.quoteNumber}</p>
            <p><strong>Customer:</strong> ${form.customerName}</p>
            ${form.deliveryDate ? `<p><strong>Delivery Date:</strong> ${form.deliveryDate}</p>` : ''}
            <table>
                <thead><tr><th>Room</th><th>Assembly</th><th>Type</th><th>Size (H×W mm)</th><th>Finish</th><th>Hang</th><th>Qty</th></tr></thead>
                <tbody>${itemRows}</tbody>
            </table>
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    const handleAddItem = (item: OrderItem) => {
        setForm(prev => ({ ...prev, items: [...prev.items, item] }));
        setAddModal(false);
    };

    const handleRemoveItem = (index: number) =>
        setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

    const workflowActions = existing ? (
        <>
            {form.status === 'Accepted' && (
                <Button variant="primary" onClick={handleConvertToOrder}>Convert to Order</Button>
            )}
            {form.status === 'Order' && (
                <>
                    <Button variant="secondary" onClick={() => handlePrintDocket('Production')}>Print Production Docket</Button>
                    <Button variant="secondary" onClick={() => handlePrintDocket('Dispatch')}>Print Dispatch Docket</Button>
                    <Button variant="primary" onClick={handleMarkDispatched}>Mark Dispatched</Button>
                </>
            )}
            {form.status === 'Dispatched' && (
                <Button variant="primary" onClick={handleMarkDelivered}>Mark Delivered</Button>
            )}
            {form.status === 'Delivered' && (
                <Button variant="primary" onClick={handleConvertToInvoice}>Convert to Invoice</Button>
            )}
            {form.status === 'Invoice' && (
                <Button variant="primary" onClick={handleMarkPaid}>Mark Paid</Button>
            )}
        </>
    ) : undefined;

    if (loading) return <Loading />;

    return (
        <>
            <FormWrapper
                title={existing ? `${stageLabel()} ${existing.quoteNumber}` : 'New Quote'}
                onSubmit={handleSubmit}
                onCancel={() => navigate(getReturnPath())}
                onDelete={existing ? handleDelete : undefined}
                extraActions={workflowActions}
                error={error}
            >
                {form.jobNumber && (
                    <div className="form-field">
                        <label>From Job</label>
                        <input
                            value={form.jobNumber}
                            readOnly
                            style={{ background: '#f0f0f0', color: '#666', cursor: 'pointer' }}
                            onClick={() => form.jobId && navigate(`/jobs/${form.jobId}/edit`)}
                            title="Click to open job"
                        />
                    </div>
                )}

                <div className="form-row">
                    <div className="form-field">
                        <label>Quote / Order Number</label>
                        <input name="quoteNumber" value={form.quoteNumber} onChange={handleChange} placeholder="QTE-001" />
                    </div>
                    <div className="form-field">
                        <label>Status</label>
                        <select name="status" value={form.status} onChange={handleChange}>
                            <optgroup label="Quote">
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Declined">Declined</option>
                                <option value="Expired">Expired</option>
                            </optgroup>
                            <optgroup label="Order">
                                <option value="Order">Order</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">Delivered</option>
                            </optgroup>
                            <optgroup label="Invoice">
                                <option value="Invoice">Invoice</option>
                                <option value="Paid">Paid</option>
                            </optgroup>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Customer</label>
                        <select name="customerId" value={form.customerId} onChange={handleCustomerChange}>
                            <option value="">Select customer...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.companyName ?? c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Created By</label>
                        <input name="createdBy" value={form.createdBy} onChange={handleChange} placeholder="Staff member" />
                    </div>
                </div>
                <div className="form-row">
                    {(isOrder || isInvoice) && (
                        <div className="form-field">
                            <label>Delivery Date</label>
                            <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} />
                        </div>
                    )}
                    {!isOrder && !isInvoice && (
                        <>
                            <div className="form-field">
                                <label>Delivery Date</label>
                                <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} />
                            </div>
                            <div className="form-field">
                                <label>Valid Until</label>
                                <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} />
                            </div>
                        </>
                    )}
                </div>

                <div className="form-field">
                    <label>Items</label>
                    <Table<OrderItem>
                        headers={[
                            { id: 'itemType',     title: 'Type' },
                            { id: 'room',         title: 'Room',     render: (v) => v ?? '—' },
                            { id: 'assembly',     title: 'Assembly', render: (v) => v ?? '—' },
                            { id: 'heightMm',     title: 'H (mm)',   render: (v) => v ?? '—' },
                            { id: 'widthMm',      title: 'W (mm)',   render: (v) => v ?? '—' },
                            { id: 'colourFinish', title: 'Finish',   render: (v) => v ?? '—' },
                            { id: 'quantity',     title: 'Qty',      render: (v) => v ?? 1 },
                            { id: 'unitPrice',    title: 'Price',    render: (v) => v != null ? `$${Number(v).toFixed(2)}` : '—' },
                            {
                                id: '_remove',
                                title: '',
                                render: (_v, _row, index) => (
                                    <Button variant="danger" onClick={() => handleRemoveItem(index!)}>Remove</Button>
                                ),
                            },
                        ]}
                        rows={form.items}
                        onAddClick={() => setAddModal(true)}
                    />
                </div>

                {form.items.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#666', fontSize: '0.85rem' }}>TOTAL (excl. GST)</span>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e' }}>${itemsTotal.toFixed(2)}</span>
                    </div>
                )}

                {isInvoice && (
                    <>
                        <hr style={{ border: 'none', borderTop: '1px solid #e8e8e8', margin: '8px 0' }} />
                        <div className="form-row">
                            <div className="form-field">
                                <label>Subtotal (excl. GST)</label>
                                <input type="number" name="subtotal" value={form.subtotal} onChange={handleChange} placeholder="0.00" />
                            </div>
                            <div className="form-field">
                                <label>GST Rate</label>
                                <input type="number" name="taxRate" value={form.taxRate} onChange={handleChange} step="0.01" placeholder="0.10" />
                            </div>
                            <div className="form-field">
                                <label>Total (incl. GST)</label>
                                <input value={`$${grandTotal.toFixed(2)}`} readOnly style={{ background: '#f0f0f0', fontWeight: 600 }} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Pay By Date</label>
                                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                            </div>
                            {form.status === 'Paid' && (
                                <div className="form-field">
                                    <label>Amount Paid</label>
                                    <input type="number" name="amountPaid" value={form.amountPaid} onChange={handleChange} placeholder="0.00" />
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="form-field">
                    <label>Notes</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} />
                </div>
            </FormWrapper>

            <QuoteItemModal
                isOpen={addModal}
                sortOrder={form.items.length}
                doorTypes={doorTypes}
                hingeTypes={hingeTypes}
                handleTypes={handleTypes}
                onAdd={handleAddItem}
                onClose={() => setAddModal(false)}
            />
        </>
    );
};

export default QuoteFormPage;
