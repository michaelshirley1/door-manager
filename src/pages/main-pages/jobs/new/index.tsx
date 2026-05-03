import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { Table } from '../../../../components/table';
import { Job, OrderItem } from '../model';
import { getJob, createJob, updateJob, deleteJob, getJobs } from '../api';
import { Customer } from '../../customers/model';
import { getCustomers } from '../../customers/api';
import { DoorType } from '../../../side-pages/door-types/model';
import { HingeType } from '../../../side-pages/hinge-types/model';
import { HandleType } from '../../../side-pages/handle-types/model';
import { getDoorTypes } from '../../../side-pages/door-types/api';
import { getHingeTypes } from '../../../side-pages/hinge-types/api';
import { getHandleTypes } from '../../../side-pages/handle-types/api';
import { Quote } from '../../quotes/model';
import { createQuote, getQuotes, updateQuote } from '../../quotes/api';
import { Status } from '../../../../components/status';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';

const blankItem = (): OrderItem => ({
    id: 0,
    itemType: 'Door',
    drilling: null,
    quantity: null,
    sortOrder: null,
    createdAt: null,
});

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

const JobFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Job | undefined>();
    const [jobQuotes, setJobQuotes] = useState<Quote[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [doorTypes, setDoorTypes] = useState<DoorType[]>([]);
    const [hingeTypes, setHingeTypes] = useState<HingeType[]>([]);
    const [handleTypes, setHandleTypes] = useState<HandleType[]>([]);
    const [addModal, setAddModal] = useState(false);
    const [addNote, setAddNote] = useState(false);
    const [itemForm, setItemForm] = useState(blankItemForm());

    const [form, setForm] = useState({
        jobNumber:     '',
        customerId:    '',
        customerName:  '',
        status:        'Scheduled',
        siteAddress:   '',
        assignedTo:    '',
        scheduledDate: '',
        completedDate: '',
        notes:         '',
        items:         [] as OrderItem[],
    });

    useEffect(() => {
        getCustomers().then(setCustomers);
        getDoorTypes().then(setDoorTypes);
        getHingeTypes().then(setHingeTypes);
        getHandleTypes().then(setHandleTypes);
        if (!id) {
            getJobs().then(jobs => {
                const max = jobs.reduce((acc, j) => {
                    const n = parseInt((j.jobNumber ?? '').replace(/\D/g, '')) || 0;
                    return n > acc ? n : acc;
                }, 0);
                setForm(prev => ({ ...prev, jobNumber: `JOB-${String(max + 1).padStart(3, '0')}` }));
            });
        }
        if (id) {
            const numId = parseInt(id);
            getQuotes().then(all => setJobQuotes(all.filter(q => q.jobId === numId)));
            getJob(numId).then(job => {
                setExisting(job);
                setForm({
                    jobNumber:     job.jobNumber ?? '',
                    customerId:    job.customerId?.toString() ?? '',
                    customerName:  job.customerName  ?? '',
                    status:        job.status        ?? 'Scheduled',
                    siteAddress:   job.siteAddress   ?? '',
                    assignedTo:    job.assignedTo    ?? '',
                    scheduledDate: job.scheduledDate ?? '',
                    completedDate: job.completedDate ?? '',
                    notes:         job.notes         ?? '',
                    items:         job.items         ?? [],
                });
            });
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = customers.find(c => c.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, customerId: e.target.value, customerName: c ? (c.companyName ?? c.name) : '' }));
    };

    const handleSubmit = () => {
        const data = {
            jobNumber:       form.jobNumber || null,
            customerId:      parseInt(form.customerId) || 0,
            customerName:    form.customerName,
            status:          form.status,
            siteAddress:     form.siteAddress     || null,
            assignedTo:      form.assignedTo      || null,
            scheduledDate:   form.scheduledDate   || null,
            completedDate:   form.completedDate   || null,
            purchaseOrderId: existing?.purchaseOrderId ?? null,
            notes:           form.notes            || null,
            items:           form.items,
        };
        const action = existing
            ? updateJob(existing.id, { ...existing, ...data })
            : createJob(data);
        action.then(() => navigate('/jobs'));
    };

    const handleDelete = () => {
        if (existing) deleteJob(existing.id).then(() => navigate('/jobs'));
    };

    const ACTIVE_QUOTE_STATUSES = ['Draft', 'Sent', 'Accepted'];

    const handleGenerateQuote = async () => {
        if (!existing) return;

        const activeQuote = jobQuotes.find(q => ACTIVE_QUOTE_STATUSES.includes(q.status));
        if (activeQuote) {
            const nullified = await updateQuote(activeQuote.id, { ...activeQuote, status: 'Nullified' });
            setJobQuotes(prev => prev.map(q => q.id === nullified.id ? nullified : q));
        }

        const quoteData = {
            quoteNumber:  `QTE-${existing.jobNumber ?? existing.id}`,
            customerId:   existing.customerId,
            customerName: existing.customerName,
            status:       'Draft',
            totalAmount:  null,
            deliveryDate: form.scheduledDate || null,
            validUntil:   null,
            createdBy:    null,
            notes:        form.siteAddress ? `Site: ${form.siteAddress}` : (form.notes || null),
            jobId:        existing.id,
            jobNumber:    existing.jobNumber || null,
            items:        form.items,
        };
        createQuote(quoteData).then(quote => navigate(`/quotes/${quote.id}/edit`));
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

    const handleDoorDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            ...blankItem(),
            itemType:     itemForm.itemType,
            doorTypeId:   itemForm.doorTypeId   ? parseInt(itemForm.doorTypeId)   : null,
            hingeTypeId:  itemForm.hingeTypeId  ? parseInt(itemForm.hingeTypeId)  : null,
            handleTypeId: itemForm.handleTypeId ? parseInt(itemForm.handleTypeId) : null,
            room:         itemForm.room         || null,
            assembly:     itemForm.assembly     || null,
            heightMm:     itemForm.heightMm     ? parseInt(itemForm.heightMm)     : null,
            widthMm:      itemForm.widthMm      ? parseInt(itemForm.widthMm)      : null,
            thicknessMm:  itemForm.thicknessMm  ? parseInt(itemForm.thicknessMm)  : null,
            handSide:     itemForm.handSide     || null,
            colourFinish: itemForm.colourFinish  || null,
            glazing:      itemForm.glazing       || null,
            fireRating:   itemForm.fireRating    || null,
            drilling:     itemForm.drilling === 'true',
            drillSize:    itemForm.drillSize     || null,
            quantity:     itemForm.quantity      ? parseInt(itemForm.quantity)     : null,
            unitPrice:    itemForm.unitPrice     ? parseFloat(itemForm.unitPrice)  : null,
            notes:        itemForm.notes         || null,
            sortOrder:    form.items.length,
        };
        setForm(prev => ({ ...prev, items: [...prev.items, item] }));
        setItemForm(blankItemForm());
        setAddModal(false);
    };

    const handleRemoveItem = (index: number) =>
        setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

    const activeOnly = <T extends { isActive: boolean }>(list: T[]) => list.filter(x => x.isActive);

    const workflowActions = existing ? (
        <Button variant="secondary" onClick={handleGenerateQuote}>Generate Quote</Button>
    ) : undefined;

    return (
        <>
            <FormWrapper
                title={existing ? `Job ${existing.jobNumber ?? existing.id}` : 'New Job'}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/jobs')}
                onDelete={existing ? handleDelete : undefined}
                extraActions={workflowActions}
            >
                <div className="form-row">
                    <div className="form-field">
                        <label>Job Number</label>
                        <input name="jobNumber" value={form.jobNumber} readOnly style={{ background: '#f0f0f0', color: '#666' }} />
                    </div>
                    <div className="form-field">
                        <label>Status</label>
                        <select name="status" value={form.status} onChange={handleChange}>
                            <option value="Scheduled">Scheduled</option>
                            <option value="InProgress">In Progress</option>
                            <option value="OnHold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Customer</label>
                        <select name="customerId" value={form.customerId} onChange={handleCustomerChange}>
                            <option value="">Select customer...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.companyName ?? c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-field">
                    <label>Site Address</label>
                    <input name="siteAddress" value={form.siteAddress} onChange={handleChange} placeholder="123 Main St" />
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Assigned To</label>
                        <input name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Staff member" />
                    </div>
                    <div className="form-field">
                        <label>Scheduled Date</label>
                        <input type="date" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label>Completed Date</label>
                        <input type="date" name="completedDate" value={form.completedDate} onChange={handleChange} />
                    </div>
                </div>

                {addNote ? (
                    <>
                        <div className="form-field">
                            <label>Notes</label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} />
                        </div>
                        <Button variant="secondary" onClick={() => { setAddNote(false); setForm(prev => ({ ...prev, notes: '' })); }}>
                            Remove Note
                        </Button>
                    </>
                ) : (
                    <Button variant="secondary" onClick={() => setAddNote(true)}>Add Note</Button>
                )}

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
                            { id: 'quantity',     title: 'Qty',      render: (v) => v ?? '—' },
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

                {existing && (() => {
                    const quoteStage   = jobQuotes.filter(q => ['Draft','Sent','Accepted','Declined','Expired','Nullified'].includes(q.status));
                    const orderStage   = jobQuotes.filter(q => ['Order','Dispatched','Delivered'].includes(q.status));
                    const invoiceStage = jobQuotes.filter(q => ['Invoice','Paid'].includes(q.status));
                    return (
                        <>
                            {quoteStage.length > 0 && (
                                <div className="form-field">
                                    <label>Quotes</label>
                                    <Table
                                        headers={[
                                            { id: 'quoteNumber', title: 'Quote #' },
                                            { id: 'createdBy',   title: 'Created By',   render: (v) => v ?? '—' },
                                            { id: 'totalAmount', title: 'Total (excl. GST)', render: (v) => v != null ? `$${Number(v).toFixed(2)}` : '—' },
                                            { id: 'validUntil',  title: 'Valid Until',  render: (v) => v ?? '—' },
                                            { id: 'status',      title: 'Status',       render: (v) => <Status content={v} variation="quotes" /> },
                                        ]}
                                        rows={quoteStage}
                                        onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
                                    />
                                </div>
                            )}
                            {orderStage.length > 0 && (
                                <div className="form-field">
                                    <label>Orders</label>
                                    <Table
                                        headers={[
                                            { id: 'quoteNumber',  title: 'Order #' },
                                            { id: 'totalAmount',  title: 'Total (excl. GST)', render: (v) => v != null ? `$${Number(v).toFixed(2)}` : '—' },
                                            { id: 'deliveryDate', title: 'Delivery Date', render: (v) => v ?? '—' },
                                            { id: 'status',       title: 'Status',        render: (v) => <Status content={v} variation="quotes" /> },
                                        ]}
                                        rows={orderStage}
                                        onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
                                    />
                                </div>
                            )}
                            {invoiceStage.length > 0 && (
                                <div className="form-field">
                                    <label>Invoices</label>
                                    <Table
                                        headers={[
                                            { id: 'quoteNumber', title: 'Invoice #' },
                                            { id: 'total',       title: 'Total (incl. GST)', render: (v) => v != null ? `$${Number(v).toFixed(2)}` : '—' },
                                            { id: 'dueDate',     title: 'Pay By',    render: (v) => v ?? '—' },
                                            { id: 'status',      title: 'Status',    render: (v) => <Status content={v} variation="invoice" /> },
                                        ]}
                                        rows={invoiceStage}
                                        onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
                                    />
                                </div>
                            )}
                        </>
                    );
                })()}
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
                        <input type="number" name="heightMm" value={itemForm.heightMm} onChange={handleDoorDimensionChange} placeholder="1980" />
                    </div>
                    <div className="form-field">
                        <label>Width (mm)</label>
                        <input type="number" name="widthMm" value={itemForm.widthMm} onChange={handleDoorDimensionChange} placeholder="810" />
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

export default JobFormPage;
