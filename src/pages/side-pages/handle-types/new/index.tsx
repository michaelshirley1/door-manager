import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { HandleType } from '../model';
import { getHandleType, createHandleType, updateHandleType, deleteHandleType } from '../api';

const HandleTypeFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<HandleType | undefined>();
    const [form, setForm] = useState({
        name:        '',
        finish:      '',
        mechanism:   '',
        description: '',
        isActive:    'true',
    });

    useEffect(() => {
        if (id) {
            getHandleType(parseInt(id)).then(handleType => {
                setExisting(handleType);
                setForm({
                    name:        handleType.name        ?? '',
                    finish:      handleType.finish      ?? '',
                    mechanism:   handleType.mechanism   ?? '',
                    description: handleType.description ?? '',
                    isActive:    String(handleType.isActive),
                });
            });
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = () => {
        const data = {
            name:        form.name,
            finish:      form.finish || null,
            mechanism:   form.mechanism || null,
            description: form.description || null,
            isActive:    form.isActive === 'true',
            createdAt:   existing?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        const action = existing
            ? updateHandleType(existing.id, { ...existing, ...data })
            : createHandleType(data);
        action.then(() => navigate('/handle-types'));
    };

    const handleDelete = () => {
        if (existing) deleteHandleType(existing.id).then(() => navigate('/handle-types'));
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.name}` : 'New Handle Type'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/handle-types')}
            onDelete={existing ? handleDelete : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Lever Handle" />
                </div>
                <div className="form-field">
                    <label>Finish</label>
                    <input name="finish" value={form.finish} onChange={handleChange} placeholder="e.g. Satin Stainless" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-field">
                    <label>Mechanism</label>
                    <input name="mechanism" value={form.mechanism} onChange={handleChange} placeholder="e.g. Latch, Deadbolt, Passage" />
                </div>
                <div className="form-field">
                    <label>Active</label>
                    <select name="isActive" value={form.isActive} onChange={handleChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>
            <div className="form-field">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
            </div>
        </FormWrapper>
    );
};

export default HandleTypeFormPage;
