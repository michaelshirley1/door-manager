import React, { useEffect, useState } from 'react';
import { DoorsPageProps } from './model';
import { DoorType } from '../door-types/model';
import { PageWrapper } from '../../../components/page-wrapper';
import { getDoorTypes, createDoorType, updateDoorType, deleteDoorType } from '../door-types/api';
import Modal from '../../../components/modal';
import Button from '../../../components/button';
import { Status } from '../../../components/status';

import './styles.scss';

const STANDARD_HEIGHTS = [1980, 2200, 2400];

const blankForm = () => ({
    name:         '',
    leafType:     '',
    material:     '',
    heightMm:     '',
    widthSize:    '',
    skinThickness:'',
    price:        '',
    isPOA:        'false',
    notes:        '',
    isActive:     'true',
});

const DoorsPage: React.FC<DoorsPageProps> = () => {
    const [doorTypes, setDoorTypes] = useState<DoorType[]>([]);
    const [heightMm, setHeightMm] = useState('');
    const [leafType, setLeafType] = useState('');
    const [material, setMaterial] = useState('');
    const [widthSize, setWidthSize] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<DoorType | null>(null);
    const [form, setForm] = useState(blankForm());

    useEffect(() => { getDoorTypes().then(setDoorTypes); }, []);

    const openNew = () => {
        setEditing(null);
        setForm(blankForm());
        setModalOpen(true);
    };

    const openEdit = (dt: DoorType) => {
        setEditing(dt);
        setForm({
            name:          dt.name,
            leafType:      dt.leafType      ?? '',
            material:      dt.material      ?? '',
            heightMm:      dt.heightMm?.toString() ?? '',
            widthSize:     dt.widthSize     ?? '',
            skinThickness: dt.skinThickness ?? '',
            price:         dt.price.toString(),
            isPOA:         String(dt.isPOA ?? false),
            notes:         dt.notes         ?? '',
            isActive:      String(dt.isActive),
        });
        setModalOpen(true);
    };

    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = () => {
        const data = {
            name:          form.name,
            leafType:      form.leafType      || null,
            material:      form.material      || null,
            heightMm:      form.heightMm      ? parseInt(form.heightMm)    : null,
            widthSize:     form.widthSize     || null,
            skinThickness: form.skinThickness || null,
            price:         parseFloat(form.price) || 0,
            isPOA:         form.isPOA === 'true',
            notes:         form.notes         || null,
            isActive:      form.isActive === 'true',
            description:   editing?.description ?? null,
            createdAt:     editing?.createdAt   ?? new Date().toISOString().split('T')[0],
        };
        const action = editing
            ? updateDoorType(editing.id, { ...editing, ...data })
            : createDoorType(data);
        action.then(result => {
            setDoorTypes(prev => editing
                ? prev.map(d => d.id === editing.id ? result : d)
                : [...prev, result]
            );
            closeModal();
        });
    };

    const handleDelete = () => {
        if (!editing) return;
        deleteDoorType(editing.id).then(() => {
            setDoorTypes(prev => prev.filter(d => d.id !== editing.id));
            closeModal();
        });
    };

    const filteredByHeight = heightMm
        ? doorTypes.filter(d => d.heightMm === parseInt(heightMm))
        : doorTypes;

    const availableLeafTypes = [...new Set(filteredByHeight.map(d => d.leafType).filter(Boolean))] as string[];

    const filteredByLeaf = leafType
        ? filteredByHeight.filter(d => d.leafType === leafType)
        : filteredByHeight;

    const availableMaterials = [...new Set(filteredByLeaf.map(d => d.material).filter(Boolean))] as string[];

    const filteredByMaterial = material
        ? filteredByLeaf.filter(d => d.material === material)
        : filteredByLeaf;

    const availableWidths = [...new Set(filteredByMaterial.map(d => d.widthSize).filter(Boolean))] as string[];

    const results = widthSize
        ? filteredByMaterial.filter(d => d.widthSize === widthSize)
        : filteredByMaterial;

    const handleHeightChange = (v: string) => { setHeightMm(v); setLeafType(''); setMaterial(''); setWidthSize(''); };
    const handleLeafChange   = (v: string) => { setLeafType(v); setMaterial(''); setWidthSize(''); };
    const handleMaterialChange = (v: string) => { setMaterial(v); setWidthSize(''); };

    return (
        <PageWrapper title="Doors" buttonTitle="New Door" buttonAction={openNew}>
            <div className="doors-filters">
                <div className="doors-filter-group">
                    <label>Height</label>
                    <select value={heightMm} onChange={e => handleHeightChange(e.target.value)}>
                        <option value="">All</option>
                        {[...new Set(doorTypes.map(d => d.heightMm).filter(Boolean))].sort().map(h => (
                            <option key={h} value={h!}>{h} mm</option>
                        ))}
                    </select>
                </div>
                <div className="doors-filter-group">
                    <label>Category</label>
                    <select value={leafType} onChange={e => handleLeafChange(e.target.value)} disabled={availableLeafTypes.length === 0}>
                        <option value="">All</option>
                        {availableLeafTypes.map(lt => <option key={lt} value={lt}>{lt}</option>)}
                    </select>
                </div>
                <div className="doors-filter-group">
                    <label>Core</label>
                    <select value={material} onChange={e => handleMaterialChange(e.target.value)} disabled={availableMaterials.length === 0}>
                        <option value="">All</option>
                        {availableMaterials.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="doors-filter-group">
                    <label>Width</label>
                    <select value={widthSize} onChange={e => setWidthSize(e.target.value)} disabled={availableWidths.length === 0}>
                        <option value="">All</option>
                        {availableWidths.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
                {(heightMm || leafType || material || widthSize) && (
                    <button className="doors-clear" onClick={() => { setHeightMm(''); setLeafType(''); setMaterial(''); setWidthSize(''); }}>
                        Clear
                    </button>
                )}
            </div>

            <table className="doors-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Core</th>
                        <th>Height</th>
                        <th>Width</th>
                        <th>Price</th>
                        <th>Notes</th>
                        <th>Active</th>
                    </tr>
                </thead>
                <tbody>
                    {results.length === 0 ? (
                        <tr><td colSpan={8} className="doors-empty">No doors match the selected filters.</td></tr>
                    ) : (
                        results.map(d => (
                            <tr key={d.id} className="doors-row" onClick={() => openEdit(d)}>
                                <td>{d.name}</td>
                                <td>{d.leafType ?? '—'}</td>
                                <td>{d.material ?? '—'}</td>
                                <td>{d.heightMm ? `${d.heightMm} mm` : '—'}</td>
                                <td>{d.widthSize ?? '—'}</td>
                                <td>
                                    {d.isPOA
                                        ? <span className="doors-poa">POA</span>
                                        : `$${d.price.toFixed(2)}`
                                    }
                                </td>
                                <td>
                                    {d.notes
                                        ? <>
                                            {d.notes.toLowerCase().includes('made to order') && (
                                                <span className="doors-badge">Made to order</span>
                                            )}
                                            {' '}{d.notes}
                                          </>
                                        : '—'
                                    }
                                </td>
                                <td>
                                    <Status content={d.isActive ? 'Active' : 'Inactive'} type={d.isActive ? 'good' : 'warn'} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? `Edit ${editing.name}` : 'New Door'}
                onConfirm={handleSave}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <div className="form-field">
                        <label>Name</label>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Flush Panel" />
                    </div>
                    <div className="form-field">
                        <label>Active</label>
                        <select name="isActive" value={form.isActive} onChange={handleChange}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Category (Leaf Type)</label>
                        <input name="leafType" value={form.leafType} onChange={handleChange} placeholder="e.g. Flush Panel, Grooved" />
                    </div>
                    <div className="form-field">
                        <label>Core (Material)</label>
                        <input name="material" value={form.material} onChange={handleChange} placeholder="e.g. Hollowcore, Solidcore" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Height (mm)</label>
                        <select name="heightMm" value={form.heightMm} onChange={handleChange}>
                            <option value="">—</option>
                            {STANDARD_HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Width</label>
                        <input name="widthSize" value={form.widthSize} onChange={handleChange} placeholder="e.g. 820" />
                    </div>
                    <div className="form-field">
                        <label>Skin Thickness</label>
                        <input name="skinThickness" value={form.skinThickness} onChange={handleChange} placeholder="e.g. 3mm" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Price</label>
                        <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" />
                    </div>
                    <div className="form-field">
                        <label>POA</label>
                        <select name="isPOA" value={form.isPOA} onChange={handleChange}>
                            <option value="false">No</option>
                            <option value="true">Yes (Price on Application)</option>
                        </select>
                    </div>
                </div>
                <div className="form-field">
                    <label>Notes</label>
                    <input name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. Made to order" />
                </div>
                {editing && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <Button variant="danger" onClick={handleDelete}>Delete Door</Button>
                    </div>
                )}
            </Modal>
        </PageWrapper>
    );
};

export default DoorsPage;
