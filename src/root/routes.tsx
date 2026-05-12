import { Routes, Route } from 'react-router-dom';
import Layout from './layout/layout';

import { HomePage } from '../pages/home';

import JobPage from '../pages/main-pages/jobs';
import QuotesPage from '../pages/main-pages/quotes';
import CustomersPage from '../pages/main-pages/customers';

import JobFormPage from '../pages/main-pages/jobs/new';
import QuoteFormPage from '../pages/main-pages/quotes/new';
import CustomerFormPage from '../pages/main-pages/customers/new';

import DoorsPage from '../pages/side-pages/doors';
import CavitySlidersPage from '../pages/side-pages/cavity-sliders';
import HardwarePage from '../pages/side-pages/hardware';

export default function App() {
  return (
    <Layout>
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/jobs" element={<JobPage />} />
            <Route path="/jobs/new" element={<JobFormPage />} />
            <Route path="/jobs/:id/edit" element={<JobFormPage />} />

            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/quotes/:id/edit" element={<QuoteFormPage />} />

            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/new" element={<CustomerFormPage />} />
            <Route path="/customers/:id/edit" element={<CustomerFormPage />} />

            <Route path="/doors" element={<DoorsPage />} />
            <Route path="/cavity-sliders" element={<CavitySlidersPage />} />
            <Route path="/hardware" element={<HardwarePage />} />
        </Routes>
    </Layout>
  );
}
