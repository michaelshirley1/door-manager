import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { Table } from '../../../../components/table';
import Loading from '../../../../components/loading';
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
import Button from '../../../../components/button';
import JobItemModal from './job-modal';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        const numId = id ? parseInt(id) : null;

        const lookups = [
            getCustomers().then(setCustomers),
            getDoorTypes().then(setDoorTypes),
            getHingeTypes().then(setHingeTypes),
            getHandleTypes().then(setHandleTypes),
        ];

        const specific = numId
            ? [
                getQuotes().then(all => setJobQuotes(all.filter(q => q.jobId === numId))),
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
                }),
              ]
            : [
                getJobs().then(jobs => {
                    const max = jobs.reduce((acc, j) => {
                        const n = parseInt((j.jobNumber ?? '').replace(/\D/g, '')) || 0;
                        return n > acc ? n : acc;
                    }, 0);
                    setForm(prev => ({ ...prev, jobNumber: `JOB-${String(max + 1).padStart(3, '0')}` }));
                }),
              ];

        Promise.all([...lookups, ...specific])
            .catch(() => setError('Failed to load data. Check your connection and try again.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = customers.find(c => c.id === parseInt(e.target.value));
        setForm(prev => ({ ...prev, customerId: e.target.value, customerName: c ? (c.companyName ?? c.name) : '' }));
    };

    const handleSubmit = () => {
        setError(null);
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
        action
            .then(() => navigate('/jobs'))
            .catch(() => setError('Failed to save job. Please try again.'));
    };

    const handleDelete = () => {
        if (!existing) return;
        setError(null);
        deleteJob(existing.id)
            .then(() => navigate('/jobs'))
            .catch(() => setError('Failed to delete job. Please try again.'));
    };

    const ACTIVE_QUOTE_STATUSES = ['Draft', 'Sent', 'Accepted'];

    const handleGenerateQuote = async () => {
        if (!existing) return;
        setError(null);
        try {
            const activeQuote = jobQuotes.find(q => ACTIVE_QUOTE_STATUSES.includes(q.status));
            if (activeQuote) {
                const nullified = await updateQuote(activeQuote.id, { ...activeQuote, status: 'Nullified' });
                setJobQuotes(prev => prev.map(q => q.id === nullified.id ? nullified : q));
            }
            const quoteData = {
                quoteNumber:  `QTE-${existing.jobNumber ?? existing.id}`,
                customerId:   existing.customerId,
                customerName: existing.customerName,
                status:       'Draft' as const,
                totalAmount:  null,
                deliveryDate: form.scheduledDate || null,
                validUntil:   null,
                createdBy:    null,
                notes:        form.siteAddress ? `Site: ${form.siteAddress}` : (form.notes || null),
                jobId:        existing.id,
                jobNumber:    existing.jobNumber || null,
                items:        form.items,
            };
            const quote = await createQuote(quoteData);
            navigate(`/quotes/${quote.id}/edit`);
        } catch {
            setError('Failed to generate quote. Please try again.');
        }
    };

    const handleAddItem = (item: OrderItem) => {
        setForm(prev => ({ ...prev, items: [...prev.items, item] }));
        setAddModal(false);
    };

    const handleRemoveItem = (index: number) =>
        setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

    const workflowActions = existing ? (
        <Button variant="secondary" onClick={handleGenerateQuote}>Generate Quote</Button>
    ) : undefined;

    if (loading) return <Loading />;

    return (
        <>
            <FormWrapper
                title={existing ? `Job ${existing.jobNumber ?? existing.id}` : 'New Job'}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/jobs')}
                onDelete={existing ? handleDelete : undefined}
                extraActions={workflowActions}
                error={error}
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
                    <Table<OrderItem>
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
                                    <Table<Quote>
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
                                    <Table<Quote>
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
                                    <Table<Quote>
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

            <JobItemModal
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

export default JobFormPage;
