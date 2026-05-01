import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { Table } from '../../../../components/table';
import { Job, OrderItem } from '../model';
import { getJob, createJob, updateJob, deleteJob } from '../api';
import { Customer } from '../../customers/model';
import { getCustomers } from '../../customers/api';

const blankItem = (): OrderItem => ({
    id: 0,
    itemType: 'Door',
    drilling: null,
    quantity: null,
    sortOrder: null,
    createdAt: null,
});

const JobFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Job | undefined>();
    const [customers, setCustomers] = useState<Customer[]>([]);
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
        if (id) {
            getJob(parseInt(id)).then(job => {
                setExisting(job);
                setForm({
                    jobNumber:     job.jobNumber     ?? '',
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
            siteAddress:     form.siteAddress || null,
            assignedTo:      form.assignedTo || null,
            scheduledDate:   form.scheduledDate || null,
            completedDate:   form.completedDate || null,
            purchaseOrderId: existing?.purchaseOrderId ?? null,
            notes:           form.notes || null,
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

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.jobNumber ?? 'Job'}` : 'New Job'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/jobs')}
            onDelete={existing ? handleDelete : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Job Number</label>
                    <input name="jobNumber" value={form.jobNumber} onChange={handleChange} placeholder="JOB-006" />
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
            <div className="form-field">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} />
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
                        { id: 'quantity',     title: 'Qty',      render: (v) => v ?? '—' },
                    ]}
                    rows={form.items}
                    onAddClick={() => setForm(prev => ({ ...prev, items: [...prev.items, blankItem()] }))}
                />
            </div>
        </FormWrapper>
    );
};

export default JobFormPage;
