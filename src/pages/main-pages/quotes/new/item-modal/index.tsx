import React, { useState } from 'react';
import Modal from '../../../../../components/modal';
import { blankItemForm, lookupDoorPrice, activeOnly, buildOrderItem } from '../../../../../shared/item-utils';
import { QuoteItemModalProps } from './model';

const STANDARD_HEIGHTS = ['1980', '2200', '2400'];

const QuoteItemModal: React.FC<QuoteItemModalProps> = ({ isOpen, sortOrder, doorTypes, hingeTypes, handleTypes, onAdd, onClose }) => {
    const [itemForm, setItemForm] = useState(blankItemForm());

    const handleClose = () => {
        setItemForm(blankItemForm());
        onClose();
    };

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setItemForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleItemTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setItemForm({ ...blankItemForm(), itemType: e.target.value as typeof itemForm.itemType });

    const handleDoorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const price = lookupDoorPrice(doorTypes, e.target.value, itemForm.heightMm, itemForm.widthMm);
        setItemForm(prev => ({ ...prev, doorTypeId: e.target.value, unitPrice: price }));
    };

    const handleDoorDimensionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const updated = { ...itemForm, [e.target.name]: e.target.value };
        const price = lookupDoorPrice(doorTypes, updated.doorTypeId, updated.heightMm, updated.widthMm);
        setItemForm({ ...updated, unitPrice: price || itemForm.unitPrice });
    };

    const handleHingeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const h = hingeTypes.find(h => h.id === parseInt(e.target.value));
        setItemForm(prev => ({ ...prev, hingeTypeId: e.target.value, unitPrice: h?.price?.toString() ?? '' }));
    };

    const handleHandleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const h = handleTypes.find(h => h.id === parseInt(e.target.value));
        setItemForm(prev => ({ ...prev, handleTypeId: e.target.value, unitPrice: h?.price?.toString() ?? '' }));
    };

    const handleAddItem = () => {
        onAdd(buildOrderItem(itemForm, sortOrder, 1));
        setItemForm(blankItemForm());
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
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
                        <select name="doorTypeId" value={itemForm.doorTypeId} onChange={handleDoorTypeChange}>
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
                        <select name="hingeTypeId" value={itemForm.hingeTypeId} onChange={handleHingeTypeChange}>
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
                        <select name="handleTypeId" value={itemForm.handleTypeId} onChange={handleHandleTypeChange}>
                            <option value="">Select handle type...</option>
                            {activeOnly(handleTypes).map(h => (
                                <option key={h.id} value={h.id}>{h.name}{h.finish ? ` — ${h.finish}` : ''}{h.mechanism ? ` (${h.mechanism})` : ''}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="form-field">
                    <label>Unit Price</label>
                    <input type="number" name="unitPrice" value={itemForm.unitPrice} onChange={handleItemChange} placeholder="0.00" />
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
                    <select name="heightMm" value={itemForm.heightMm} onChange={handleDoorDimensionChange}>
                        {STANDARD_HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                        <option value="custom">Other</option>
                    </select>
                    {itemForm.heightMm === 'custom' && (
                        <input type="number" name="heightMm" value="" placeholder="Custom height" onChange={handleDoorDimensionChange} />
                    )}
                </div>
                <div className="form-field">
                    <label>Width (mm)</label>
                    <input type="number" name="widthMm" value={itemForm.widthMm} onChange={handleDoorDimensionChange} placeholder="e.g. 810" />
                </div>
                <div className="form-field">
                    <label>Thickness (mm)</label>
                    <input type="number" name="thicknessMm" value={itemForm.thicknessMm} onChange={handleItemChange} placeholder="32" />
                </div>
            </div>

            <div className="form-row">
                <div className="form-field">
                    <label>Hang Side</label>
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

            {itemForm.itemType === 'Door' && (
                <div className="form-row">
                    <div className="form-field">
                        <label>Handle</label>
                        <select name="handleTypeId" value={itemForm.handleTypeId} onChange={handleItemChange}>
                            <option value="">None</option>
                            {activeOnly(handleTypes).map(h => (
                                <option key={h.id} value={h.id}>
                                    {h.name}{h.finish ? ` — ${h.finish}` : ''}{h.mechanism ? ` (${h.mechanism})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

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
    );
};

export default QuoteItemModal;
