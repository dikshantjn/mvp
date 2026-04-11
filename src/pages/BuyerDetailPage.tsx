import { Link, useParams } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../state/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';

export function BuyerDetailPage() {
  const { buyerId } = useParams<{ buyerId: string }>();
  const { api } = useAuth();
  const detailState = useAsyncData(
    () => api.getBuyerDetail(buyerId ?? ''),
    [api, buyerId],
  );
  const paymentsState = useAsyncData(
    () => api.getPayments({ buyerId: buyerId ?? '', page: 1, pageSize: 20 }),
    [api, buyerId],
  );

  if (!buyerId) {
    return <StatusMessage tone="error" message="Missing buyer id." />;
  }

  return (
    <section className="page">
      <PageHeader
        title="Buyer detail"
        description="Detailed buyer profile using GET /api/v1/admin/buyers/:buyerId plus payment history from GET /api/v1/admin/payments."
        actions={
          <Link className="button button--secondary" to="/buyers">
            Back to buyers
          </Link>
        }
      />

      {detailState.error ? <StatusMessage tone="error" message={detailState.error} /> : null}
      {detailState.loading ? <div className="card">Loading buyer detail...</div> : null}

      {detailState.data ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Buyer</span>
              <strong>{detailState.data.fullName}</strong>
              <small>{detailState.data.email}</small>
            </div>
            <div className="stat-card">
              <span>Mobile</span>
              <strong>{detailState.data.mobileNumber}</strong>
              <small>{detailState.data.status}</small>
            </div>
            <div className="stat-card">
              <span>Project</span>
              <strong>{detailState.data.unit.projectName}</strong>
              <small>{detailState.data.unit.unitNumber}</small>
            </div>
            <div className="stat-card">
              <span>Agreement value</span>
              <strong>{formatCurrency(detailState.data.unit.agreementValue)}</strong>
              <small>{formatDate(detailState.data.unit.bookingDate)}</small>
            </div>
          </div>

          <div className="card stack">
            <h3>Assigned unit</h3>
            <div className="detail-grid">
              <div>
                <span className="detail-label">Project ID</span>
                <strong>{detailState.data.unit.projectId}</strong>
              </div>
              <div>
                <span className="detail-label">Unit ID</span>
                <strong>{detailState.data.unit.unitId}</strong>
              </div>
              <div>
                <span className="detail-label">Tower</span>
                <strong>{detailState.data.unit.tower}</strong>
              </div>
              <div>
                <span className="detail-label">Floor</span>
                <strong>{detailState.data.unit.floor}</strong>
              </div>
              <div>
                <span className="detail-label">Type</span>
                <strong>{detailState.data.unit.type}</strong>
              </div>
              <div>
                <span className="detail-label">Area</span>
                <strong>{detailState.data.unit.areaSqFt} sq ft</strong>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>Total amount</span>
              <strong>{formatCurrency(detailState.data.paymentSummary.totalAmount)}</strong>
            </div>
            <div className="stat-card">
              <span>Paid amount</span>
              <strong>{formatCurrency(detailState.data.paymentSummary.paidAmount)}</strong>
            </div>
            <div className="stat-card">
              <span>Due amount</span>
              <strong>{formatCurrency(detailState.data.paymentSummary.dueAmount)}</strong>
            </div>
            <div className="stat-card">
              <span>Overdue amount</span>
              <strong>{formatCurrency(detailState.data.paymentSummary.overdueAmount)}</strong>
            </div>
          </div>

          <div className="card stack">
            <h3>Payment entries</h3>
            {paymentsState.error ? (
              <StatusMessage tone="error" message={paymentsState.error} />
            ) : null}
            {paymentsState.loading ? <div>Loading payments...</div> : null}
            {paymentsState.data ? (
              <DataTable
                rows={paymentsState.data.items}
                emptyMessage="No payment entries found."
                columns={[
                  { key: 'title', label: 'Title', render: (row) => row.title },
                  {
                    key: 'amount',
                    label: 'Amount',
                    render: (row) => formatCurrency(row.amount),
                  },
                  { key: 'status', label: 'Status', render: (row) => row.status },
                  { key: 'due', label: 'Due date', render: (row) => formatDate(row.dueDate) },
                  { key: 'paid', label: 'Paid date', render: (row) => formatDate(row.paidDate) },
                  {
                    key: 'reference',
                    label: 'Reference',
                    render: (row) => row.referenceNumber ?? '-',
                  },
                ]}
              />
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
