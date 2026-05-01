import React from 'react';
import { IModal } from './model';

import './style.scss';
import Button from '../button';

const Modal: React.FC<IModal> = (props) => {
    const {isOpen, onClose, title, children, onConfirm, confirmLabel = 'Confirm'} = props
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    {onConfirm && (
                        <Button className="modal-confirm-btn" onClick={onConfirm}>{confirmLabel}</Button>
                    )}
                    <Button className="modal-close-btn" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;