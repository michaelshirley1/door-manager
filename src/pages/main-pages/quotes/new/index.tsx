import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { Quote } from '../model';
import { getQuote, createQuote, updateQuote, deleteQuote } from '../api';
import { Customer } from '../../customers/model';
import { getCustomers } from '../../customers/api';

const QuoteFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Quote | undefined>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [form, setForm] = useState({
        quoteNumber:  '',
        customerId:   '',
        customerName: '',
        status:       'Draft',
        totalAmount:  '',
        validUntil:   '',
        createdBy:    '',
        notes:        '',
    });

    useEffect(() => {
        getCustomers().then(setCustomers);
        if (id) {
            getQuote(parseInt(id)).then(quote => {
                setExisting(quote);
                setForm({
                    quoteNumber:  quote.quoteNumber  ?? '',
                    customerId:   quote.customerId?.toString() ?? '',
                    customerName: quote.customerName ?? '',
                    status:       quote.status       ?? 'Draft',
                    totalAmount:  quote.totalAmount?.toString() ?? '',
                    validUntil:   quote.validUntil   ?? '',
                    createdBy:    quote.createdBy    ?? '',
                    notes:        quote.notes        ?? '',
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
            quoteNumber:  form.quoteNumber,
            customerId:   parseInt(form.customerId) || 0,
            customerName: form.customerName,
            status:       form.status,
            totalAmount:  form.totalAmount ? parseFloat(form.totalAmount) : null,
            validUntil:   form.validUntil || null,
            createdBy:    form.createdBy || null,
            notes:        form.notes || null,
        };
        const action = existing
            ? updateQuote(existing.id, { ...existing, ...data })
            : createQuote(data);
        action.then(() => navigate('/quotes'));
    };

    const handleDelete = () => {
        if (existing) deleteQuote(existing.id).then(() => navigate('/quotes'));
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.quoteNumber}` : 'New Quote'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/quotes')}
            onDelete={existing ? handleDelete : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Quote Number</label>
                    <input name="quoteNumber" value={form.quoteNumber} onChange={handleChange} placeholder="QTE-006" />
                </div>
                <div className="form-field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Declined">Declined</option>
                        <option value="Expired">Expired</option>
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
                <div className="form-field">
                    <label>Total Amount</label>
                    <input type="number" name="totalAmount" value={form.totalAmount} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-field">
                    <label>Valid Until</label>
                    <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} />
                </div>
            </div>
            <div className="form-field">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
        </FormWrapper>
    );
};

export default QuoteFormPage;
