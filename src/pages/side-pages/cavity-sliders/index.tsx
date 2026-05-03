import React, { useEffect, useState } from 'react';
import { CavitySliderType } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { getCavitySliders, createCavitySlider, updateCavitySlider, deleteCavitySlider } from './api';
import Modal from '../../../components/modal';
import Button from '../../../components/button';
import { Status } from '../../../components/status';

import './styles.scss';

const blankForm = () => ({
    supplier:     '',
    productSystem:'',
    unitType:     '',
    studPocket:   '',
    finishDetail: '',
    heightMm:     '',
    widthRange:   '',
    price:        '',
    isPOA:        'false',
    priceBasis:   'per unit',
    category:     '',
    subcategory:  '',
    isActive:     'true',
});

const CavitySlidersPage: React.FC = () => {
    const [sliders, setSliders] = useState<CavitySliderType[]>([]);
    const [supplier, setSupplier] = useState('');
    const [heightMm, setHeightMm] = useState('');
    const [widthRange, setWidthRange] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<CavitySliderType | null>(null);
    const [form, setForm] = useState(blankForm());

    useEffect(() => { getCavitySliders().then(setSliders); }, []);

    const openNew = () => {
        setEditing(null);
        setForm(blankForm());
        setModalOpen(true);
    };

    const openEdit = (s: CavitySliderType) => {
        setEditing(s);
        setForm({
            supplier:      s.supplier,
            productSystem: s.productSystem,
            unitType:      s.unitType      ?? '',
            studPocket:    s.studPocket    ?? '',
            finishDetail:  s.finishDetail  ?? '',
            heightMm:      s.heightMm?.toString() ?? '',
            widthRange:    s.widthRange    ?? '',
            price:         s.price?.toString() ?? '',
            isPOA:         String(s.isPOA),
            priceBasis:    s.priceBasis    ?? 'per unit',
            category:      s.category      ?? '',
            subcategory:   s.subcategory   ?? '',
            isActive:      String(s.isActive),
        });
        setModalOpen(true);
    };

    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = () => {
        const data = {
            supplier:      form.supplier,
            productSystem: form.productSystem,
            unitType:      form.unitType      || null,
            studPocket:    form.studPocket    || null,
            finishDetail:  form.finishDetail  || null,
            heightMm:      form.heightMm      ? parseInt(form.heightMm)    : null,
            widthRange:    form.widthRange    || null,
            price:         form.price         ? parseFloat(form.price)     : null,
            isPOA:         form.isPOA === 'true',
            priceBasis:    form.priceBasis    || 'per unit',
            category:      form.category      || null,
            subcategory:   form.subcategory   || null,
            isActive:      form.isActive === 'true',
        };
        const action = editing
            ? updateCavitySlider(editing.id, { ...editing, ...data })
            : createCavitySlider(data);
        action.then(result => {
            setSliders(prev => editing
                ? prev.map(s => s.id === editing.id ? result : s)
                : [...prev, result]
            );
            closeModal();
        });
    };

    const handleDelete = () => {
        if (!editing) return;
        deleteCavitySlider(editing.id).then(() => {
            setSliders(prev => prev.filter(s => s.id !== editing.id));
            closeModal();
        });
    };

    const availableSuppliers = [...new Set(sliders.map(s => s.supplier))].sort();
    const availableHeights   = [...new Set(sliders.map(s => s.heightMm).filter(Boolean))].sort((a, b) => a! - b!) as number[];
    const availableWidths    = [...new Set(sliders.map(s => s.widthRange).filter(Boolean))].sort() as string[];

    const results = sliders.filter(s => {
        if (supplier  && s.supplier !== supplier) return false;
        if (heightMm  && s.heightMm !== parseInt(heightMm)) return false;
        if (widthRange && s.widthRange !== widthRange) return false;
        return true;
    });

    return (
        <PageWrapper title="Cavity Sliders" buttonTitle="New Cavity Slider" buttonAction={openNew}>
            <div className="cs-filters">
                <div className="cs-filter-group">
                    <label>Supplier</label>
                    <select value={supplier} onChange={e => setSupplier(e.target.value)}>
                        <option value="">All</option>
                        {availableSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="cs-filter-group">
                    <label>Height</label>
                    <select value={heightMm} onChange={e => setHeightMm(e.target.value)}>
                        <option value="">All</option>
                        {availableHeights.map(h => <option key={h} value={h}>{h} mm</option>)}
                    </select>
                </div>
                <div className="cs-filter-group">
                    <label>Width Range</label>
                    <select value={widthRange} onChange={e => setWidthRange(e.target.value)}>
                        <option value="">All</option>
                        {availableWidths.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
                {(supplier || heightMm || widthRange) && (
                    <button className="cs-clear" onClick={() => { setSupplier(''); setHeightMm(''); setWidthRange(''); }}>
                        Clear
                    </button>
                )}
            </div>

            <table className="cs-table">
                <thead>
                    <tr>
                        <th>Supplier</th>
                        <th>Product System</th>
                        <th>Unit Type</th>
                        <th>Stud / Pocket</th>
                        <th>Finish</th>
                        <th>Width Range</th>
                        <th>Price</th>
                        <th>Active</th>
                    </tr>
                </thead>
                <tbody>
                    {results.length === 0 ? (
                        <tr><td colSpan={8} className="cs-empty">No cavity sliders match the selected filters.</td></tr>
                    ) : (
                        results.map(s => (
                            <tr key={s.id} className="cs-row" onClick={() => openEdit(s)}>
                                <td>{s.supplier}</td>
                                <td>{s.productSystem}</td>
                                <td>{s.unitType ?? '—'}</td>
                                <td>{s.studPocket ?? '—'}</td>
                                <td>{s.finishDetail ?? '—'}</td>
                                <td>{s.widthRange ?? '—'}</td>
                                <td>
                                    {s.isPOA
                                        ? <span className="cs-poa">POA</span>
                                        : s.price != null ? `$${s.price.toFixed(2)}` : '—'
                                    }
                                </td>
                                <td>
                                    <Status content={s.isActive ? 'Active' : 'Inactive'} type={s.isActive ? 'good' : 'warn'} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? `Edit ${editing.productSystem}` : 'New Cavity Slider'}
                onConfirm={handleSave}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <div className="form-field">
                        <label>Supplier</label>
                        <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="e.g. Hallmark" />
                    </div>
                    <div className="form-field">
                        <label>Product System</label>
                        <input name="productSystem" value={form.productSystem} onChange={handleChange} placeholder="e.g. Slimline 75" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Unit Type</label>
                        <input name="unitType" value={form.unitType} onChange={handleChange} placeholder="e.g. Single" />
                    </div>
                    <div className="form-field">
                        <label>Stud / Pocket</label>
                        <input name="studPocket" value={form.studPocket} onChange={handleChange} placeholder="e.g. 90mm stud" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Finish</label>
                        <input name="finishDetail" value={form.finishDetail} onChange={handleChange} placeholder="e.g. Stainless" />
                    </div>
                    <div className="form-field">
                        <label>Category</label>
                        <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Residential" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Height (mm)</label>
                        <input type="number" name="heightMm" value={form.heightMm} onChange={handleChange} placeholder="e.g. 2040" />
                    </div>
                    <div className="form-field">
                        <label>Width Range</label>
                        <input name="widthRange" value={form.widthRange} onChange={handleChange} placeholder="e.g. 620–920" />
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
                    <div className="form-field">
                        <label>Price Basis</label>
                        <input name="priceBasis" value={form.priceBasis} onChange={handleChange} placeholder="e.g. per unit" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Active</label>
                        <select name="isActive" value={form.isActive} onChange={handleChange}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>
                {editing && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <Button variant="danger" onClick={handleDelete}>Delete Cavity Slider</Button>
                    </div>
                )}
            </Modal>
        </PageWrapper>
    );
};

export default CavitySlidersPage;
