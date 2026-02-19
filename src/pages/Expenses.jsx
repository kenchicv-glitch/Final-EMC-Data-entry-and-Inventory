import Layout from '../components/Layout/Layout';
import ExpenseTable from '../components/ExpenseTable';

const Expenses = () => {
    return (
        <Layout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Expenses</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Track and manage your expenditures.</p>
            </div>

            <ExpenseTable />
        </Layout>
    );
};

export default Expenses;
