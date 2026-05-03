import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    headers: headerItem[]
    rows: any[]
    onRowClick?: (row: any, index: number) => void
    onAddClick?: () => void
}

export interface headerItem {
    id: string
    title: string
    render?: (value: any, row: any, index?: number) => React.ReactNode
}
