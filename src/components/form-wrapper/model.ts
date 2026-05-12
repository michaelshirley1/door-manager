import React from 'react';

export interface FormWrapperProps {
    title: string;
    onSubmit: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    extraActions?: React.ReactNode;
    error?: string | null;
    children: React.ReactNode;
}
