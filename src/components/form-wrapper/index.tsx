import React from 'react';
import { FormWrapperProps } from './model';

import './styles.scss';
import Button from '../button';

export const FormWrapper: React.FC<FormWrapperProps> = ({ title, onSubmit, onCancel, onDelete, extraActions, children }) => {
    return (
        <div className="form-wrapper">
            <div className="form-header">
                <h1>{title}</h1>
            </div>
            <div className="form-body">
                {children}
            </div>
            <div className="form-actions">
                {onDelete && (
                    <Button variant="danger" type="button" onClick={onDelete}>Delete</Button>
                )}
                {extraActions && (
                    <div className="form-actions-extra">{extraActions}</div>
                )}
                <div className="form-actions-right">
                    <Button variant='secondary' type="button" onClick={onCancel}>Cancel</Button>
                    <Button variant='primary' type="button" onClick={onSubmit}>Save</Button>
                </div>
            </div>
        </div>
    );
};
