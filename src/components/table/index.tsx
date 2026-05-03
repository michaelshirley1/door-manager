import React from 'react';
import { TableProps } from './model';

import './styles.scss';
import Button from '../button';

export const Table: React.FC<TableProps> = (props) => {
    const { headers, rows, onRowClick, onAddClick } = props
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
                    {rows.map((row: any, rowIndex: number) => (
                        <tr key={rowIndex} onClick={() => onRowClick?.(row, rowIndex)}>
                            {headers.map((header) => (
                                <td key={header.id}>
                                    {header.render ? header.render(row[header.id], row, rowIndex) : row[header.id]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <th>
                {onAddClick && (
                    <div className="table-toolbar">
                        <Button className="table-add-btn" onClick={onAddClick}>+ Add</Button>
                    </div>
                )}
            </th>
        </div>
    )
}
