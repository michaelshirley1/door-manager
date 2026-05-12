import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotesPageProps, Quote } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import { getQuotes } from './api';

import './styles.scss';

const QUOTE_STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired', 'Nullified'];

const QuotesPage: React.FC<QuotesPageProps> = () => {
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getQuotes()
            .then(all => setQuotes(all.filter(q => QUOTE_STATUSES.includes(q.status))))
            .catch(() => setError('Failed to load quotes.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <PageWrapper title="Quotes">
            {loading ? <Loading /> : error ? (
                <p style={{ color: '#c62828', padding: '16px' }}>{error}</p>
            ) : (
                <Table<Quote>
                    headers={[
                        { id: 'quoteNumber', title: 'Quote / Order #' },
                        { id: 'customerName', title: 'Customer' },
                        { id: 'createdBy', title: 'Created By', render: (v) => v ?? '—' },
                        { id: 'totalAmount', title: 'Total', render: (v) => v != null ? `$${Number(v).toFixed(2)}` : '—' },
                        { id: 'deliveryDate', title: 'Delivery Date', render: (v) => v ?? '—' },
                        { id: 'status', title: 'Status', render: (v) => <Status content={v} variation="quotes" /> },
                    ]}
                    rows={quotes}
                    onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
                />
            )}
        </PageWrapper>
    );
};

export default QuotesPage;
