import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoicesPageProps } from './model';
import { Quote } from '../quotes/model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import { getQuotes } from '../quotes/api';

import './styles.scss';

const INVOICE_STATUSES = ['Invoice', 'Paid'];

const InvoicesPage: React.FC<InvoicesPageProps> = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Quote[]>([]);

    useEffect(() => {
        getQuotes().then(all => setInvoices(all.filter(q => INVOICE_STATUSES.includes(q.status))));
    }, []);

    return (
        <PageWrapper title="Invoices" buttonTitle="" buttonAction={() => {}}>
            <Table
                headers={[
                    { id: 'quoteNumber',  title: 'Invoice #' },
                    { id: 'customerName', title: 'Customer' },
                    { id: 'total',        title: 'Total (incl. GST)', render: (v) => v != null ? `$${Number(v).toFixed(2)}` : '—' },
                    { id: 'dueDate',      title: 'Pay By',            render: (v) => v ?? '—' },
                    { id: 'status',       title: 'Status',            render: (v) => <Status content={v} variation="invoice" /> },
                ]}
                rows={invoices}
                onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default InvoicesPage;
