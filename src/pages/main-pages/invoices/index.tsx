import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoicesPageProps, Invoice } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import { getInvoices } from './api';

import './styles.scss';

const InvoicesPage: React.FC<InvoicesPageProps> = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => { getInvoices().then(setInvoices); }, []);

    return (
        <PageWrapper title="Invoices" buttonTitle="New Invoice" buttonAction={() => navigate('/invoices/new')}>
            <Table
                headers={[
                    { id: 'invoiceNumber', title: 'Invoice #' },
                    { id: 'jobNumber', title: 'Job' },
                    { id: 'total', title: 'Total', render: (v) => `$${v.toFixed(2)}` },
                    { id: 'dueDate', title: 'Due Date', render: (v) => v ?? '—' },
                    { id: 'status', title: 'Status', render: (v) => <Status content={v} variation="invoice" /> },
                ]}
                rows={invoices}
                onRowClick={(row) => navigate(`/invoices/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default InvoicesPage;
