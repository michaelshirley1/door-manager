import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobPageProps, Job } from './model';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { Status } from '../../../components/status';
import Loading from '../../../components/loading';
import { getJobs } from './api';

import './styles.scss';

const JobPage: React.FC<JobPageProps> = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getJobs()
            .then(setJobs)
            .catch(() => setError('Failed to load jobs.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <PageWrapper title="Jobs" buttonTitle="New Job" buttonAction={() => navigate('/jobs/new')}>
            {loading ? <Loading /> : error ? (
                <p style={{ color: '#c62828', padding: '16px' }}>{error}</p>
            ) : (
                <Table<Job>
                    headers={[
                        { id: 'jobNumber', title: 'Job #' },
                        { id: 'customerName', title: 'Customer' },
                        { id: 'siteAddress', title: 'Site Address' },
                        { id: 'assignedTo', title: 'Assigned To', render: (v) => v ?? '—' },
                        { id: 'scheduledDate', title: 'Scheduled Date', render: (v) => v ?? '—' },
                        { id: 'status', title: 'Status', render: (v) => <Status content={v} variation="job" /> },
                    ]}
                    rows={jobs}
                    onRowClick={(row) => navigate(`/jobs/${row.id}/edit`)}
                />
            )}
        </PageWrapper>
    );
};

export default JobPage;
