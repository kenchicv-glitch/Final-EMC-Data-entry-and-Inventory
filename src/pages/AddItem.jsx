import Layout from '../components/Layout/Layout';
import StockForm from '../components/StockForm';

const AddItem = () => {
    return (
        <Layout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Add New Item</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Create a new inventory SKU.</p>
            </div>

            <StockForm type="add" />
        </Layout>
    );
};

export default AddItem;
