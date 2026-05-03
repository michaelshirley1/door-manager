import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrdersPageProps } from './model';
import { Quote } from '../quotes/model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import { getQuotes } from '../quotes/api';

const ORDER_STATUSES = ['Order', 'Dispatched', 'Delivered'];

const OrdersPage: React.FC<OrdersPageProps> = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Quote[]>([]);

    useEffect(() => {
        getQuotes().then(all => setOrders(all.filter(q => ORDER_STATUSES.includes(q.status))));
    }, []);

    return (
        <PageWrapper title="Orders" buttonTitle="" buttonAction={() => {}}>
            <Table
                headers={[
                    { id: 'quoteNumber',  title: 'Order #' },
                    { id: 'customerName', title: 'Customer' },
                    { id: 'createdBy',    title: 'Created By',    render: (v) => v ?? '—' },
                    { id: 'totalAmount',  title: 'Total (excl. GST)', render: (v) => v != null ? `$${Number(v).toFixed(2)}` : '—' },
                    { id: 'deliveryDate', title: 'Delivery Date', render: (v) => v ?? '—' },
                    { id: 'status',       title: 'Status',        render: (v) => <Status content={v} variation="quotes" /> },
                ]}
                rows={orders}
                onRowClick={(row) => navigate(`/quotes/${row.id}/edit`)}
            />
        </PageWrapper>
    );
};

export default OrdersPage;
