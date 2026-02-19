import Layout from '../components/Layout/Layout';
import StockForm from '../components/StockForm';

const Movements = () => {
    return (
        <Layout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Record Stock Movement</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Log incoming stock or daily usage.</p>
            </div>

            <StockForm type="movement" />
        </Layout>
    );
};

export default Movements;
