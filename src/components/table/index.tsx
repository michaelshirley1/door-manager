import React from 'react';
import { TableProps } from './model';

import './styles.scss';
import Button from '../button';

export function Table<T = Record<string, unknown>>({ headers, rows, onRowClick, onAddClick }: TableProps<T>) {
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header.id}>{header.title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} onClick={() => onRowClick?.(row, rowIndex)}>
                            {headers.map((header) => (
                                <td key={header.id}>
                                    {header.render
                                        ? header.render((row as Record<string, any>)[header.id], row, rowIndex)
                                        : (row as Record<string, any>)[header.id]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {onAddClick && (
                <div className="table-toolbar">
                    <Button className="table-add-btn" onClick={onAddClick}>+ Add</Button>
                </div>
            )}
        </div>
    );
}
