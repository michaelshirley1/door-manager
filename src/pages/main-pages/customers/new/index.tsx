import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { Customer } from '../model';
import { getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../api';

const CustomerFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Customer | undefined>();
    const [form, setForm] = useState({
        name:        '',
        companyName: '',
        email:       '',
        phone:       '',
        address:     '',
        notes:       '',
    });

    useEffect(() => {
        if (id) {
            getCustomer(parseInt(id)).then(customer => {
                setExisting(customer);
                setForm({
                    name:        customer.name        ?? '',
                    companyName: customer.companyName ?? '',
                    email:       customer.email       ?? '',
                    phone:       customer.phone       ?? '',
                    address:     customer.address     ?? '',
                    notes:       customer.notes       ?? '',
                });
            });
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = () => {
        const data = {
            name:        form.name,
            companyName: form.companyName || null,
            email:       form.email || null,
            phone:       form.phone || null,
            address:     form.address || null,
            notes:       form.notes || null,
            createdAt:   existing?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        const action = existing
            ? updateCustomer(existing.id, { ...existing, ...data })
            : createCustomer(data);
        action.then(() => navigate('/customers'));
    };

    const handleDelete = () => {
        if (existing) deleteCustomer(existing.id).then(() => navigate('/customers'));
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.name}` : 'New Customer'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/customers')}
            onDelete={existing ? handleDelete : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
                </div>
                <div className="form-field">
                    <label>Company Name</label>
                    <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Optional" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-field">
                    <label>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
                </div>
                <div className="form-field">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="021 000 0000" />
                </div>
            </div>
            <div className="form-field">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="123 Street, City" />
            </div>
            <div className="form-field">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
        </FormWrapper>
    );
};

export default CustomerFormPage;
