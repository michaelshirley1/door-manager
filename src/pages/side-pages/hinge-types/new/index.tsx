import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { HingeType } from '../model';
import { getHingeType, createHingeType, updateHingeType, deleteHingeType } from '../api';

const HingeTypeFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<HingeType | undefined>();
    const [form, setForm] = useState({
        name:        '',
        finish:      '',
        description: '',
        isActive:    'true',
    });

    useEffect(() => {
        if (id) {
            getHingeType(parseInt(id)).then(hingeType => {
                setExisting(hingeType);
                setForm({
                    name:        hingeType.name        ?? '',
                    finish:      hingeType.finish      ?? '',
                    description: hingeType.description ?? '',
                    isActive:    String(hingeType.isActive),
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
            description: form.description || null,
            isActive:    form.isActive === 'true',
            createdAt:   existing?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        const action = existing
            ? updateHingeType(existing.id, { ...existing, ...data })
            : createHingeType(data);
        action.then(() => navigate('/hinge-types'));
    };

    const handleDelete = () => {
        if (existing) deleteHingeType(existing.id).then(() => navigate('/hinge-types'));
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.name}` : 'New Hinge Type'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/hinge-types')}
            onDelete={existing ? handleDelete : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Butt Hinge" />
                </div>
                <div className="form-field">
                    <label>Finish</label>
                    <input name="finish" value={form.finish} onChange={handleChange} placeholder="e.g. Satin Stainless" />
                </div>
            </div>
            <div className="form-field">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
            </div>
            <div className="form-field">
                <label>Active</label>
                <select name="isActive" value={form.isActive} onChange={handleChange}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>
        </FormWrapper>
    );
};

export default HingeTypeFormPage;
