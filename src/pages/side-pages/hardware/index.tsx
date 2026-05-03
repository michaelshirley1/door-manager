import React, { useEffect, useState } from 'react';
import { HardwarePageProps, HardwareTab } from './model';
import { HandleType } from '../handle-types/model';
import { HingeType } from '../hinge-types/model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Status } from '../../../components/status';
import { getHandleTypes, createHandleType, updateHandleType, deleteHandleType } from '../handle-types/api';
import { getHingeTypes, createHingeType, updateHingeType, deleteHingeType } from '../hinge-types/api';
import Modal from '../../../components/modal';
import Button from '../../../components/button';

import './styles.scss';

const blankHandleForm = () => ({ name: '', finish: '', mechanism: '', description: '', price: '', isActive: 'true' });
const blankHingeForm  = () => ({ name: '', finish: '', sizeMm: '',   description: '', price: '', isActive: 'true' });

const HardwarePage: React.FC<HardwarePageProps> = () => {
    const [tab, setTab] = useState<HardwareTab>('handles');

    const [handles, setHandles] = useState<HandleType[]>([]);
    const [hinges,  setHinges]  = useState<HingeType[]>([]);

    const [handleMechanism, setHandleMechanism] = useState('');
    const [handleFinish,    setHandleFinish]    = useState('');
    const [hingeFinish,     setHingeFinish]     = useState('');
    const [hingeSizeMm,     setHingeSizeMm]     = useState('');

    const [handleModalOpen, setHandleModalOpen] = useState(false);
    const [editingHandle,   setEditingHandle]   = useState<HandleType | null>(null);
    const [handleForm,      setHandleForm]      = useState(blankHandleForm());

    const [hingeModalOpen,  setHingeModalOpen]  = useState(false);
    const [editingHinge,    setEditingHinge]    = useState<HingeType | null>(null);
    const [hingeForm,       setHingeForm]       = useState(blankHingeForm());

    useEffect(() => {
        getHandleTypes().then(setHandles);
        getHingeTypes().then(setHinges);
    }, []);

    // Handle modal
    const openNewHandle = () => { setEditingHandle(null); setHandleForm(blankHandleForm()); setHandleModalOpen(true); };
    const openEditHandle = (h: HandleType) => {
        setEditingHandle(h);
        setHandleForm({ name: h.name, finish: h.finish ?? '', mechanism: h.mechanism ?? '', description: h.description ?? '', price: h.price.toString(), isActive: String(h.isActive) });
        setHandleModalOpen(true);
    };
    const closeHandleModal = () => { setHandleModalOpen(false); setEditingHandle(null); };
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setHandleForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const saveHandle = () => {
        const data = {
            name:        handleForm.name,
            finish:      handleForm.finish      || null,
            mechanism:   handleForm.mechanism   || null,
            description: handleForm.description || null,
            price:       parseFloat(handleForm.price) || 0,
            isActive:    handleForm.isActive === 'true',
            createdAt:   editingHandle?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        const action = editingHandle
            ? updateHandleType(editingHandle.id, { ...editingHandle, ...data })
            : createHandleType(data);
        action.then(result => {
            setHandles(prev => editingHandle
                ? prev.map(h => h.id === editingHandle.id ? result : h)
                : [...prev, result]
            );
            closeHandleModal();
        });
    };

    const deleteHandle = () => {
        if (!editingHandle) return;
        deleteHandleType(editingHandle.id).then(() => {
            setHandles(prev => prev.filter(h => h.id !== editingHandle.id));
            closeHandleModal();
        });
    };

    // Hinge modal
    const openNewHinge = () => { setEditingHinge(null); setHingeForm(blankHingeForm()); setHingeModalOpen(true); };
    const openEditHinge = (h: HingeType) => {
        setEditingHinge(h);
        setHingeForm({ name: h.name, finish: h.finish ?? '', sizeMm: h.sizeMm ?? '', description: h.description ?? '', price: h.price.toString(), isActive: String(h.isActive) });
        setHingeModalOpen(true);
    };
    const closeHingeModal = () => { setHingeModalOpen(false); setEditingHinge(null); };
    const hingeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setHingeForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const saveHinge = () => {
        const data = {
            name:        hingeForm.name,
            finish:      hingeForm.finish      || null,
            sizeMm:      hingeForm.sizeMm      || null,
            description: hingeForm.description || null,
            price:       parseFloat(hingeForm.price) || 0,
            isActive:    hingeForm.isActive === 'true',
            createdAt:   editingHinge?.createdAt ?? new Date().toISOString().split('T')[0],
        };
        const action = editingHinge
            ? updateHingeType(editingHinge.id, { ...editingHinge, ...data })
            : createHingeType(data);
        action.then(result => {
            setHinges(prev => editingHinge
                ? prev.map(h => h.id === editingHinge.id ? result : h)
                : [...prev, result]
            );
            closeHingeModal();
        });
    };

    const deleteHinge = () => {
        if (!editingHinge) return;
        deleteHingeType(editingHinge.id).then(() => {
            setHinges(prev => prev.filter(h => h.id !== editingHinge.id));
            closeHingeModal();
        });
    };

    // Filter options
    const availableMechanisms    = [...new Set(handles.map(h => h.mechanism).filter(Boolean))].sort() as string[];
    const availableHandleFinishes = [...new Set(handles.map(h => h.finish).filter(Boolean))].sort() as string[];
    const availableHingeFinishes  = [...new Set(hinges.map(h => h.finish).filter(Boolean))].sort() as string[];
    const availableHingeSizes     = [...new Set(hinges.map(h => h.sizeMm).filter(Boolean))].sort() as string[];

    const filteredHandles = handles.filter(h => {
        if (handleMechanism && h.mechanism !== handleMechanism) return false;
        if (handleFinish    && h.finish    !== handleFinish)    return false;
        return true;
    });

    const filteredHinges = hinges.filter(h => {
        if (hingeFinish && h.finish  !== hingeFinish) return false;
        if (hingeSizeMm && h.sizeMm  !== hingeSizeMm) return false;
        return true;
    });

    return (
        <PageWrapper
            title="Hardware"
            buttonTitle={tab === 'handles' ? 'New Handle' : 'New Hinge'}
            buttonAction={tab === 'handles' ? openNewHandle : openNewHinge}
        >
            <div className="hw-tabs">
                <button className={tab === 'handles' ? 'hw-tab active' : 'hw-tab'} onClick={() => setTab('handles')}>Handles</button>
                <button className={tab === 'hinges'  ? 'hw-tab active' : 'hw-tab'} onClick={() => setTab('hinges')}>Hinges</button>
            </div>

            {tab === 'handles' && (
                <div className="hw-section">
                    <div className="hw-filters">
                        <div className="hw-filter-group">
                            <label>Mechanism</label>
                            <select value={handleMechanism} onChange={e => setHandleMechanism(e.target.value)}>
                                <option value="">All</option>
                                {availableMechanisms.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="hw-filter-group">
                            <label>Finish</label>
                            <select value={handleFinish} onChange={e => setHandleFinish(e.target.value)}>
                                <option value="">All</option>
                                {availableHandleFinishes.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        {(handleMechanism || handleFinish) && (
                            <button className="hw-clear" onClick={() => { setHandleMechanism(''); setHandleFinish(''); }}>Clear</button>
                        )}
                    </div>

                    <table className="hw-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Finish</th>
                                <th>Mechanism</th>
                                <th>Price</th>
                                <th>Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHandles.length === 0 ? (
                                <tr><td colSpan={5} className="hw-empty-cell">No handles match the selected filters.</td></tr>
                            ) : (
                                filteredHandles.map(h => (
                                    <tr key={h.id} className="hw-row" onClick={() => openEditHandle(h)}>
                                        <td>{h.name}</td>
                                        <td>{h.finish ?? '—'}</td>
                                        <td>{h.mechanism ?? '—'}</td>
                                        <td>${h.price.toFixed(2)}</td>
                                        <td><Status content={h.isActive ? 'Active' : 'Inactive'} type={h.isActive ? 'good' : 'warn'} /></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'hinges' && (
                <div className="hw-section">
                    <div className="hw-filters">
                        <div className="hw-filter-group">
                            <label>Finish</label>
                            <select value={hingeFinish} onChange={e => setHingeFinish(e.target.value)}>
                                <option value="">All</option>
                                {availableHingeFinishes.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="hw-filter-group">
                            <label>Size</label>
                            <select value={hingeSizeMm} onChange={e => setHingeSizeMm(e.target.value)}>
                                <option value="">All</option>
                                {availableHingeSizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {(hingeFinish || hingeSizeMm) && (
                            <button className="hw-clear" onClick={() => { setHingeFinish(''); setHingeSizeMm(''); }}>Clear</button>
                        )}
                    </div>

                    <table className="hw-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Finish</th>
                                <th>Size</th>
                                <th>Price</th>
                                <th>Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHinges.length === 0 ? (
                                <tr><td colSpan={5} className="hw-empty-cell">No hinges match the selected filters.</td></tr>
                            ) : (
                                filteredHinges.map(h => (
                                    <tr key={h.id} className="hw-row" onClick={() => openEditHinge(h)}>
                                        <td>{h.name}</td>
                                        <td>{h.finish ?? '—'}</td>
                                        <td>{h.sizeMm ?? '—'}</td>
                                        <td>${h.price.toFixed(2)}</td>
                                        <td><Status content={h.isActive ? 'Active' : 'Inactive'} type={h.isActive ? 'good' : 'warn'} /></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Handle Modal */}
            <Modal
                isOpen={handleModalOpen}
                onClose={closeHandleModal}
                title={editingHandle ? `Edit ${editingHandle.name}` : 'New Handle'}
                onConfirm={saveHandle}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <div className="form-field">
                        <label>Name</label>
                        <input name="name" value={handleForm.name} onChange={handleFormChange} placeholder="e.g. Lever Handle" />
                    </div>
                    <div className="form-field">
                        <label>Active</label>
                        <select name="isActive" value={handleForm.isActive} onChange={handleFormChange}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Finish</label>
                        <input name="finish" value={handleForm.finish} onChange={handleFormChange} placeholder="e.g. Satin Chrome" />
                    </div>
                    <div className="form-field">
                        <label>Mechanism</label>
                        <input name="mechanism" value={handleForm.mechanism} onChange={handleFormChange} placeholder="e.g. Passage, Privacy" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Price</label>
                        <input type="number" name="price" value={handleForm.price} onChange={handleFormChange} placeholder="0.00" />
                    </div>
                </div>
                <div className="form-field">
                    <label>Description</label>
                    <textarea name="description" value={handleForm.description} onChange={handleFormChange} />
                </div>
                {editingHandle && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <Button variant="danger" onClick={deleteHandle}>Delete Handle</Button>
                    </div>
                )}
            </Modal>

            {/* Hinge Modal */}
            <Modal
                isOpen={hingeModalOpen}
                onClose={closeHingeModal}
                title={editingHinge ? `Edit ${editingHinge.name}` : 'New Hinge'}
                onConfirm={saveHinge}
                confirmLabel="Save"
            >
                <div className="form-row">
                    <div className="form-field">
                        <label>Name</label>
                        <input name="name" value={hingeForm.name} onChange={hingeFormChange} placeholder="e.g. Butt Hinge" />
                    </div>
                    <div className="form-field">
                        <label>Active</label>
                        <select name="isActive" value={hingeForm.isActive} onChange={hingeFormChange}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Finish</label>
                        <input name="finish" value={hingeForm.finish} onChange={hingeFormChange} placeholder="e.g. Satin Stainless" />
                    </div>
                    <div className="form-field">
                        <label>Size (mm)</label>
                        <input name="sizeMm" value={hingeForm.sizeMm} onChange={hingeFormChange} placeholder="e.g. 100mm" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Price</label>
                        <input type="number" name="price" value={hingeForm.price} onChange={hingeFormChange} placeholder="0.00" />
                    </div>
                </div>
                <div className="form-field">
                    <label>Description</label>
                    <textarea name="description" value={hingeForm.description} onChange={hingeFormChange} />
                </div>
                {editingHinge && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <Button variant="danger" onClick={deleteHinge}>Delete Hinge</Button>
                    </div>
                )}
            </Modal>
        </PageWrapper>
    );
};

export default HardwarePage;
