import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { DoorType, DoorPricingEntry } from '../model';
import { getDoorType, createDoorType, updateDoorType, deleteDoorType, getDoorTypePrices, createDoorTypePrice, deleteDoorTypePrice } from '../api';
import Button from '../../../../components/button';

const STANDARD_HEIGHTS = [1980, 2200, 2400];

const DoorTypeFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<DoorType | undefined>();
    const [prices, setPrices] = useState<DoorPricingEntry[]>([]);
    const [newPrice, setNewPrice] = useState({ heightMm: '1980', widthMm: '', price: '' });
    const [form, setForm] = useState({
        name:        '',
        material:    '',
        description: '',
        isActive:    'true',
    });

    useEffect(() => {
        if (id) {
            getDoorType(parseInt(id)).then(doorType => {
                setExisting(doorType);
                setForm({
                    name:        doorType.name        ?? '',
                    material:    doorType.material    ?? '',
                    description: doorType.description ?? '',
                    isActive:    String(doorType.isActive),
                });
            });
            getDoorTypePrices(parseInt(id)).then(setPrices);
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = () => {
        const data = {
            name:        form.name,
            material:    form.material || null,
            description: form.description || null,
            isActive:    form.isActive === 'true',
            price:       existing?.price ?? 0,
            createdAt:   existing?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        const action = existing
            ? updateDoorType(existing.id, { ...existing, ...data })
            : createDoorType(data);
        action.then(() => navigate('/door-types'));
    };

    const handleDelete = () => {
        if (existing) deleteDoorType(existing.id).then(() => navigate('/door-types'));
    };

    const handleAddPrice = () => {
        if (!existing || !newPrice.heightMm || !newPrice.widthMm || !newPrice.price) return;
        createDoorTypePrice(existing.id, {
            heightMm: parseInt(newPrice.heightMm),
            widthMm:  parseInt(newPrice.widthMm),
            price:    parseFloat(newPrice.price),
        }).then(entry => {
            setPrices(prev => [...prev, entry]);
            setNewPrice(prev => ({ ...prev, widthMm: '', price: '' }));
        });
    };

    const handleDeletePrice = (entryId: number) => {
        if (!existing) return;
        deleteDoorTypePrice(existing.id, entryId).then(() =>
            setPrices(prev => prev.filter(p => p.id !== entryId))
        );
    };

    return (
        <FormWrapper
            title={existing ? `Edit ${existing.name}` : 'New Door Type'}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/door-types')}
            onDelete={existing ? handleDelete : undefined}
        >
            <div className="form-row">
                <div className="form-field">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Solid Timber" />
                </div>
                <div className="form-field">
                    <label>Material</label>
                    <input name="material" value={form.material} onChange={handleChange} placeholder="e.g. Timber, Steel, Aluminium" />
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

            {existing && (
                <div className="form-field">
                    <label>Pricing (Height × Width)</label>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                        <thead>
                            <tr style={{ background: '#f4f5f7', textAlign: 'left' }}>
                                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Height (mm)</th>
                                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Width (mm)</th>
                                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Price</th>
                                <th style={{ padding: '8px 12px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {prices
                                .slice()
                                .sort((a, b) => a.heightMm - b.heightMm || a.widthMm - b.widthMm)
                                .map(p => (
                                    <tr key={p.id} style={{ borderTop: '1px solid #e0e0e0' }}>
                                        <td style={{ padding: '8px 12px' }}>{p.heightMm}</td>
                                        <td style={{ padding: '8px 12px' }}>{p.widthMm}</td>
                                        <td style={{ padding: '8px 12px' }}>${p.price.toFixed(2)}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                            <Button variant="danger" onClick={() => handleDeletePrice(p.id)}>Remove</Button>
                                        </td>
                                    </tr>
                                ))}
                            <tr style={{ borderTop: '1px solid #e0e0e0', background: '#fafafa' }}>
                                <td style={{ padding: '8px 12px' }}>
                                    <select
                                        value={newPrice.heightMm}
                                        onChange={e => setNewPrice(prev => ({ ...prev, heightMm: e.target.value }))}
                                        style={{ width: '100%' }}
                                    >
                                        {STANDARD_HEIGHTS.map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                    <input
                                        type="number"
                                        placeholder="e.g. 810"
                                        value={newPrice.widthMm}
                                        onChange={e => setNewPrice(prev => ({ ...prev, widthMm: e.target.value }))}
                                        style={{ width: '100%' }}
                                    />
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={newPrice.price}
                                        onChange={e => setNewPrice(prev => ({ ...prev, price: e.target.value }))}
                                        style={{ width: '100%' }}
                                    />
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                    <Button variant="secondary" onClick={handleAddPrice}>Add</Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                        Standard heights: 1980, 2200, 2400. Non-standard sizes can be priced manually on the quote.
                    </p>
                </div>
            )}
        </FormWrapper>
    );
};

export default DoorTypeFormPage;
