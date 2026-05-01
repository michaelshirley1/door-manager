import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormWrapper } from '../../../../components/form-wrapper';
import { Table } from '../../../../components/table';
import { Job, OrderItem } from '../model';
import { getJob, createJob, updateJob, deleteJob } from '../api';
import { Customer } from '../../customers/model';
import { getCustomers } from '../../customers/api';
import { DoorType } from '../../../side-pages/door-types/model';
import { HingeType } from '../../../side-pages/hinge-types/model';
import { HandleType } from '../../../side-pages/handle-types/model';
import { getDoorTypes } from '../../../side-pages/door-types/api';
import { getHingeTypes } from '../../../side-pages/hinge-types/api';
import { getHandleTypes } from '../../../side-pages/handle-types/api';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';

const blankItem = (): OrderItem => ({
    id: 0,
    itemType: 'Door',
    drilling: null,
    quantity: null,
    sortOrder: null,
    createdAt: null,
});

const blankItemForm = () => ({
    itemType:     'Door' as OrderItem['itemType'],
    doorTypeId:   '',
    hingeTypeId:  '',
    handleTypeId: '',
    room:         '',
    assembly:     '',
    heightMm:     '',
    widthMm:      '',
    thicknessMm:  '',
    handSide:     '',
    colourFinish: '',
    glazing:      '',
    fireRating:   '',
    drilling:     'false',
    drillSize:    '',
    quantity:     '',
    unitPrice:    '',
    notes:        '',
});

const JobFormPage: React.FC = () => {
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const [existing, setExisting] = useState<Job | undefined>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [doorTypes, setDoorTypes] = useState<DoorType[]>([]);
    const [hingeTypes, setHingeTypes] = useState<HingeType[]>([]);
    const [handleTypes, setHandleTypes] = useState<HandleType[]>([]);

    const [addModal, setAddModal] = useState<boolean>(false);
    const [addNote, setAddNote] = useState<boolean>(false);

    const [itemForm, setItemForm] = useState(blankItemForm());
    
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
        getDoorTypes().then(setDoorTypes);
        getHingeTypes().then(setHingeTypes);
        getHandleTypes().then(setHandleTypes);
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

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setItemForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleItemTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setItemForm({ ...blankItemForm(), itemType: e.target.value as OrderItem['itemType'] });

    const handleAddItem = () => {
        const item: OrderItem = {
            ...blankItem(),
            itemType:     itemForm.itemType,
            doorTypeId:   itemForm.doorTypeId   ? parseInt(itemForm.doorTypeId)   : null,
            hingeTypeId:  itemForm.hingeTypeId  ? parseInt(itemForm.hingeTypeId)  : null,
            handleTypeId: itemForm.handleTypeId ? parseInt(itemForm.handleTypeId) : null,
            room:         itemForm.room || null,
            assembly:     itemForm.assembly || null,
            heightMm:     itemForm.heightMm ? parseInt(itemForm.heightMm) : null,
            widthMm:      itemForm.widthMm ? parseInt(itemForm.widthMm) : null,
            thicknessMm:  itemForm.thicknessMm ? parseInt(itemForm.thicknessMm) : null,
            handSide:     itemForm.handSide || null,
            colourFinish: itemForm.colourFinish || null,
            glazing:      itemForm.glazing || null,
            fireRating:   itemForm.fireRating || null,
            drilling:     itemForm.drilling === 'true',
            drillSize:    itemForm.drillSize || null,
            quantity:     itemForm.quantity ? parseInt(itemForm.quantity) : null,
            unitPrice:    itemForm.unitPrice ? parseFloat(itemForm.unitPrice) : null,
            notes:        itemForm.notes || null,
            sortOrder:    form.items.length,
        };
        setForm(prev => ({ ...prev, items: [...prev.items, item] }));
        setItemForm(blankItemForm());
        setAddModal(false);
    };

    const activeOnly = <T extends { isActive: boolean }>(list: T[]) => list.filter(x => x.isActive);

    return (
        <>
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
                {addNote ?
                    <>
                        <div className="form-field">
                            <label>Notes</label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} />
                        </div>
                        <Button 
                            onClick={()=>{
                                setAddNote(false)
                                setForm(prev => ({ ...prev, notes: "" }));
                            }}
                        >
                            Remove Note
                        </Button>
                    </>
                    
                    :
                    <Button 
                        onClick={()=>{setAddNote(true)}}
                        variant='secondary'
                    >
                        Add Note
                    </Button>
                }
                
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
                        onAddClick={() => setAddModal(true)}
                    />
                </div>
            </FormWrapper>

            <Modal
                isOpen={addModal}
                onClose={() => { setAddModal(false); setItemForm(blankItemForm()); }}
                title="Add Item"
                onConfirm={handleAddItem}
                confirmLabel="Add Item"
            >
                <div className="form-row">
                    <div className="form-field">
                        <label>Type</label>
                        <select name="itemType" value={itemForm.itemType} onChange={handleItemTypeChange}>
                            <option value="Door">Door</option>
                            <option value="Handle">Handle</option>
                            <option value="Hinge">Hinge</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Freight">Freight</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Quantity</label>
                        <input type="number" name="quantity" value={itemForm.quantity} onChange={handleItemChange} placeholder="1" />
                    </div>
                </div>
                
                <div className="form-row">
                    {itemForm.itemType === 'Door' && (
                        <div className="form-field">
                            <label>Door Type</label>
                            <select name="doorTypeId" value={itemForm.doorTypeId} onChange={handleItemChange}>
                                <option value="">Select door type...</option>
                                {activeOnly(doorTypes).map(d => (
                                    <option key={d.id} value={d.id}>{d.name}{d.material ? ` — ${d.material}` : ''}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {itemForm.itemType === 'Hinge' && (
                        <div className="form-field">
                            <label>Hinge Type</label>
                            <select name="hingeTypeId" value={itemForm.hingeTypeId} onChange={handleItemChange}>
                                <option value="">Select hinge type...</option>
                                {activeOnly(hingeTypes).map(h => (
                                    <option key={h.id} value={h.id}>{h.name}{h.finish ? ` — ${h.finish}` : ''}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {itemForm.itemType === 'Handle' && (
                        <div className="form-field">
                            <label>Handle Type</label>
                            <select name="handleTypeId" value={itemForm.handleTypeId} onChange={handleItemChange}>
                                <option value="">Select handle type...</option>
                                {activeOnly(handleTypes).map(h => (
                                    <option key={h.id} value={h.id}>{h.name}{h.finish ? ` — ${h.finish}` : ''}{h.mechanism ? ` (${h.mechanism})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="form-field">
                        <label>Unit Price</label>
                        <input type="number" name="unitPrice" readOnly value={itemForm.doorTypeId} onChange={handleItemChange} placeholder="0.00" />
                    </div>
                </div>
                

                <div className="form-row">
                    <div className="form-field">
                        <label>Room</label>
                        <input name="room" value={itemForm.room} onChange={handleItemChange} placeholder="e.g. Bedroom 1" />
                    </div>
                    <div className="form-field">
                        <label>Assembly</label>
                        <input name="assembly" value={itemForm.assembly} onChange={handleItemChange} placeholder="e.g. A1" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Height (mm)</label>
                        <input type="number" name="heightMm" value={itemForm.heightMm} onChange={handleItemChange} placeholder="2040" />
                    </div>
                    <div className="form-field">
                        <label>Width (mm)</label>
                        <input type="number" name="widthMm" value={itemForm.widthMm} onChange={handleItemChange} placeholder="820" />
                    </div>
                    <div className="form-field">
                        <label>Thickness (mm)</label>
                        <input type="number" name="thicknessMm" value={itemForm.thicknessMm} onChange={handleItemChange} placeholder="40" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Hand Side</label>
                        <select name="handSide" value={itemForm.handSide} onChange={handleItemChange}>
                            <option value="">—</option>
                            <option value="Left">Left</option>
                            <option value="Right">Right</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Colour / Finish</label>
                        <input name="colourFinish" value={itemForm.colourFinish} onChange={handleItemChange} placeholder="e.g. Primed White" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Glazing</label>
                        <input name="glazing" value={itemForm.glazing} onChange={handleItemChange} placeholder="e.g. Clear 6mm" />
                    </div>
                    <div className="form-field">
                        <label>Fire Rating</label>
                        <input name="fireRating" value={itemForm.fireRating} onChange={handleItemChange} placeholder="e.g. FRR 60" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label>Drilling</label>
                        <select name="drilling" value={itemForm.drilling} onChange={handleItemChange}>
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                        </select>
                    </div>
                    {itemForm.drilling === 'true' && (
                        <div className="form-field">
                            <label>Drill Size</label>
                            <input name="drillSize" value={itemForm.drillSize} onChange={handleItemChange} placeholder="e.g. 54mm" />
                        </div>
                    )}
                </div>
                <div className="form-field">
                    <label>Notes</label>
                    <textarea name="notes" value={itemForm.notes} onChange={handleItemChange} />
                </div>
            </Modal>
        </>
    );
};

export default JobFormPage;
