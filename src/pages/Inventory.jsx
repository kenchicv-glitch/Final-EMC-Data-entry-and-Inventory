import Layout from '../components/Layout/Layout';
import InventoryTable from '../components/InventoryTable';

const Inventory = () => {
    return (
        <Layout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Inventory Management</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Track current stock levels and alerts.</p>
            </div>

            <InventoryTable />
        </Layout>
    );
};

export default Inventory;
