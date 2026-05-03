import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { Table } from '../../../../components/table';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';
import { Quote } from '../model';
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

const STANDARD_HEIGHTS = ['1980', '2200', '2400'];

const ORDER_STATUSES = ['Order', 'Dispatched', 'Delivered'];
const INVOICE_STATUSES = ['Invoice', 'Paid'];

const blankItemForm = () => ({
    itemType:     'Door' as OrderItem['itemType'],
    doorTypeId:   '',
    hingeTypeId:  '',
    handleTypeId: '',
    room:         '',
    assembly:     '',
    heightMm:     '1980',
    widthMm:      '',
    thicknessMm:  '32',
    handSide:     '',
    colourFinish: '',
    glazing:      '',
    fireRating:   '',
    drilling:     'false',
    drillSize:    '',
    quantity:     '1',
    unitPrice:    '',
    notes:        '',
});

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
    const [itemForm, setItemForm] = useState(blankItemForm());

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
        getCustomers().then(setCustomers);
        getDoorTypes().then(setDoorTypes);
        getHingeTypes().then(setHingeTypes);
        getHandleTypes().then(setHandleTypes);
        if (id) {
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
            });
        }
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
        status:       form.status,
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
        const data = buildSaveData();
        const action = existing
            ? updateQuote(existing.id, { ...existing, ...data })
            : createQuote(data);
        action.then(() => navigate(getReturnPath()));
    };

    const handleDelete = () => {
        if (existing) deleteQuote(existing.id).then(() => navigate(getReturnPath()));
    };

    const transitionStatus = (newStatus: string, extra?: Partial<Quote>) => {
        if (!existing) return;
        const data: Quote = { ...existing, ...buildSaveData(), status: newStatus, ...extra };
        updateQuote(existing.id, data).then(updated => {
            setExisting(updated);
            setForm(prev => ({ ...prev, status: newStatus }));
        });
    };

    const handleConvertToOrder = () => transitionStatus('Order');

    const handleMarkDispatched = () => transitionStatus('Dispatched');

    const handleMarkDelivered = () => transitionStatus('Delivered');

    const handleConvertToInvoice = () => {
        if (!existing) return;
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
        updateQuote(existing.id, data).then(updated => {
            setExisting(updated);
            setForm(prev => ({
                ...prev,
                status:   'Invoice',
                subtotal: sub.toFixed(2),
                taxRate:  tRate.toString(),
            }));
        });
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

    // Item modal handlers
    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setItemForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleItemTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setItemForm({ ...blankItemForm(), itemType: e.target.value as OrderItem['itemType'] });

    const lookupDoorPrice = (doorTypeId: string, heightMm: string, widthMm: string): string => {
        if (!doorTypeId) return '';
        const dt = doorTypes.find(d => d.id === parseInt(doorTypeId));
        if (!dt) return '';
        if (dt.prices && heightMm && widthMm) {
            const entry = dt.prices.find(
                p => p.heightMm === parseInt(heightMm) && p.widthMm === parseInt(widthMm)
            );
            if (entry) return entry.price.toString();
        }
        return dt.price?.toString() ?? '';
    };

    const handleDoorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const price = lookupDoorPrice(e.target.value, itemForm.heightMm, itemForm.widthMm);
        setItemForm(prev => ({ ...prev, doorTypeId: e.target.value, unitPrice: price }));
    };

    const handleDoorDimensionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const updated = { ...itemForm, [e.target.name]: e.target.value };
        const price = lookupDoorPrice(updated.doorTypeId, updated.heightMm, updated.widthMm);
        setItemForm({ ...updated, unitPrice: price || itemForm.unitPrice });
    };

    const handleHingeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const h = hingeTypes.find(h => h.id === parseInt(e.target.value));
        setItemForm(prev => ({ ...prev, hingeTypeId: e.target.value, unitPrice: h?.price?.toString() ?? '' }));
    };

    const handleHandleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const h = handleTypes.find(h => h.id === parseInt(e.target.value));
        setItemForm(prev => ({ ...prev, handleTypeId: e.target.value, unitPrice: h?.price?.toString() ?? '' }));
    };

    const handleAddItem = () => {
        const item: OrderItem = {
            id:           0,
            itemType:     itemForm.itemType,
            doorTypeId:   itemForm.doorTypeId   ? parseInt(itemForm.doorTypeId)   : null,
            hingeTypeId:  itemForm.hingeTypeId  ? parseInt(itemForm.hingeTypeId)  : null,
            handleTypeId: itemForm.handleTypeId ? parseInt(itemForm.handleTypeId) : null,
            room:         itemForm.room || null,
            assembly:     itemForm.assembly || null,
            heightMm:     itemForm.heightMm ? parseInt(itemForm.heightMm) : null,
            widthMm:      itemForm.widthMm  ? parseInt(itemForm.widthMm)  : null,
            thicknessMm:  itemForm.thicknessMm ? parseInt(itemForm.thicknessMm) : null,
            handSide:     itemForm.handSide || null,
            colourFinish: itemForm.colourFinish || null,
            glazing:      itemForm.glazing || null,
            fireRating:   itemForm.fireRating || null,
            drilling:     itemForm.drilling === 'true',
            drillSize:    itemForm.drillSize || null,
            quantity:     itemForm.quantity ? parseInt(itemForm.quantity) : 1,
            unitPrice:    itemForm.unitPrice ? parseFloat(itemForm.unitPrice) : null,
            notes:        itemForm.notes || null,
            sortOrder:    form.items.length,
            createdAt:    null,
        };
        setForm(prev => ({ ...prev, items: [...prev.items, item] }));
        setItemForm(blankItemForm());
        setAddModal(false);
    };

    const handleRemoveItem = (index: number) =>
        setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

    const activeOnly = <T extends { isActive: boolean }>(list: T[]) => list.filter(x => x.isActive);

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

    return (
        <>
            <FormWrapper
                title={existing ? `${stageLabel()} ${existing.quoteNumber}` : 'New Quote'}
                onSubmit={handleSubmit}
                onCancel={() => navigate(getReturnPath())}
                onDelete={existing ? handleDelete : undefined}
                extraActions={workflowActions}
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
                    <Table
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

            <Modal
                isOpen={addModal}
                onClose={() => { setAddModal(false); setItemForm(blankItemForm()); }}
                title="Add Item"
                onConfirm={handleAddItem}
                confirmLabel="Add Item"
            >
                <div className="form-row">
                    <div className="form-field">
                        <label>Type</label>
                        <select name="itemType" value={itemForm.itemType} onChange={handleItemTypeChange}>
                            <option value="Door">Door</option>
                            <option value="Handle">Handle</option>
                            <option value="Hinge">Hinge</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Quantity</label>
                        <input type="number" name="quantity" value={itemForm.quantity} onChange={handleItemChange} placeholder="1" />
                    </div>
                </div>

                <div className="form-row">
                    {itemForm.itemType === 'Door' && (
                        <div className="form-field">
                            <label>Door Type</label>
                            <select name="doorTypeId" value={itemForm.doorTypeId} onChange={handleDoorTypeChange}>
                                <option value="">Select door type...</option>
                                {activeOnly(doorTypes).map(d => (
                                    <option key={d.id} value={d.id}>{d.name}{d.material ? ` — ${d.material}` : ''}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {itemForm.itemType === 'Hinge' && (
                        <div className="form-field">
                            <label>Hinge Type</label>
                            <select name="hingeTypeId" value={itemForm.hingeTypeId} onChange={handleHingeTypeChange}>
                                <option value="">Select hinge type...</option>
                                {activeOnly(hingeTypes).map(h => (
                                    <option key={h.id} value={h.id}>{h.name}{h.finish ? ` — ${h.finish}` : ''}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {itemForm.itemType === 'Handle' && (
                        <div className="form-field">
                            <label>Handle Type</label>
                            <select name="handleTypeId" value={itemForm.handleTypeId} onChange={handleHandleTypeChange}>
                                <option value="">Select handle type...</option>
                                {activeOnly(handleTypes).map(h => (
                                    <option key={h.id} value={h.id}>{h.name}{h.finish ? ` — ${h.finish}` : ''}{h.mechanism ? ` (${h.mechanism})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="form-field">
                        <label>Unit Price</label>
                        <input type="number" name="unitPrice" value={itemForm.unitPrice} onChange={handleItemChange} placeholder="0.00" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label>Room</label>
                        <input name="room" value={itemForm.room} onChange={handleItemChange} placeholder="e.g. Bedroom 1" />
                    </div>
                    <div className="form-field">
                        <label>Assembly</label>
                        <input name="assembly" value={itemForm.assembly} onChange={handleItemChange} placeholder="e.g. A1" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label>Height (mm)</label>
                        <select name="heightMm" value={itemForm.heightMm} onChange={handleDoorDimensionChange}>
                            {STANDARD_HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                            <option value="custom">Other</option>
                        </select>
                        {itemForm.heightMm === 'custom' && (
                            <input type="number" name="heightMm" placeholder="Custom height" onChange={handleDoorDimensionChange} />
                        )}
                    </div>
                    <div className="form-field">
                        <label>Width (mm)</label>
                        <input type="number" name="widthMm" value={itemForm.widthMm} onChange={handleDoorDimensionChange} placeholder="e.g. 810" />
                    </div>
                    <div className="form-field">
                        <label>Thickness (mm)</label>
                        <input type="number" name="thicknessMm" value={itemForm.thicknessMm} onChange={handleItemChange} placeholder="32" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label>Hang Side</label>
                        <select name="handSide" value={itemForm.handSide} onChange={handleItemChange}>
                            <option value="">—</option>
                            <option value="Left">Left</option>
                            <option value="Right">Right</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Colour / Finish</label>
                        <input name="colourFinish" value={itemForm.colourFinish} onChange={handleItemChange} placeholder="e.g. Primed White" />
                    </div>
                </div>

                {itemForm.itemType === 'Door' && (
                    <div className="form-row">
                        <div className="form-field">
                            <label>Handle</label>
                            <select name="handleTypeId" value={itemForm.handleTypeId} onChange={handleItemChange}>
                                <option value="">None</option>
                                {activeOnly(handleTypes).map(h => (
                                    <option key={h.id} value={h.id}>
                                        {h.name}{h.finish ? ` — ${h.finish}` : ''}{h.mechanism ? ` (${h.mechanism})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-field">
                        <label>Glazing</label>
                        <input name="glazing" value={itemForm.glazing} onChange={handleItemChange} placeholder="e.g. Clear 6mm" />
                    </div>
                    <div className="form-field">
                        <label>Fire Rating</label>
                        <input name="fireRating" value={itemForm.fireRating} onChange={handleItemChange} placeholder="e.g. FRR 60" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label>Drilling</label>
                        <select name="drilling" value={itemForm.drilling} onChange={handleItemChange}>
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                        </select>
                    </div>
                    {itemForm.drilling === 'true' && (
                        <div className="form-field">
                            <label>Drill Size</label>
                            <input name="drillSize" value={itemForm.drillSize} onChange={handleItemChange} placeholder="e.g. 54mm" />
                        </div>
                    )}
                </div>

                <div className="form-field">
                    <label>Notes</label>
                    <textarea name="notes" value={itemForm.notes} onChange={handleItemChange} />
                </div>
            </Modal>
        </>
    );
};

export default QuoteFormPage;
