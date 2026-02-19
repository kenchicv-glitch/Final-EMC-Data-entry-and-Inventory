import Layout from '../components/Layout/Layout';
import ExpenseForm from '../components/ExpenseForm';

const AddExpense = () => {
    return (
        <Layout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Add Expense</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Record a new payment or cost.</p>
            </div>

            <ExpenseForm />
        </Layout>
    );
};

export default AddExpense;
