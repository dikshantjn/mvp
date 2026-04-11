import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { InputField, SelectField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useAsyncData } from '../hooks/useAsyncData';
import { useSubmitState } from '../hooks/useSubmitState';
import { useAuth } from '../state/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';

const paymentStatuses = ['due', 'paid', 'overdue'] as const;

export function PaymentsPage() {
  const { api } = useAuth();
  const submit = useSubmitState();
  const [buyerId, setBuyerId] = useState('');
  const [historyBuyerId, setHistoryBuyerId] = useState('');
  const [queryBuyerId, setQueryBuyerId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<(typeof paymentStatuses)[number]>('due');
  const [dueDate, setDueDate] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const paymentsState = useAsyncData(
    () =>
      queryBuyerId
        ? api.getPayments({ buyerId: queryBuyerId, page: 1, pageSize: 20 })
        : Promise.resolve(null),
    [api, queryBuyerId],
  );

  async function handleCreatePayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await submit.run(
      () =>
        api.createPayment({
          buyerId,
          title,
          amount: Number(amount),
          status,
          dueDate: dueDate || null,
          paidDate: paidDate || null,
          referenceNumber: referenceNumber || null,
        }),
      'Payment entry created.',
    );

    if (buyerId) {
      setQueryBuyerId(buyerId);
      setHistoryBuyerId(buyerId);
    }
  }

  return (
    <section className="page">
      <PageHeader
        title="Payments"
        description="Create manual payment entries and fetch payment history for a specific buyer through the admin payment APIs."
      />

      <div className="two-column">
        <form className="card form-grid" onSubmit={handleCreatePayment}>
          <h3>Create payment</h3>
          <InputField
            label="Buyer ID"
            value={buyerId}
            onChange={(event) => setBuyerId(event.target.value)}
            required
          />
          <InputField
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <InputField
            label="Amount"
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          <SelectField
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            {paymentStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
          <InputField
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <InputField
            label="Paid date"
            type="date"
            value={paidDate}
            onChange={(event) => setPaidDate(event.target.value)}
          />
          <InputField
            label="Reference number"
            value={referenceNumber}
            onChange={(event) => setReferenceNumber(event.target.value)}
          />

          {submit.error ? <StatusMessage tone="error" message={submit.error} /> : null}
          {submit.success ? <StatusMessage tone="success" message={submit.success} /> : null}

          <button className="button" type="submit" disabled={submit.submitting}>
            {submit.submitting ? 'Saving...' : 'Create payment'}
          </button>
        </form>

        <div className="card stack">
          <h3>View payments</h3>
          <form
            className="toolbar toolbar--inline"
            onSubmit={(event) => {
              event.preventDefault();
              setQueryBuyerId(historyBuyerId.trim());
            }}
          >
            <InputField
              label="Buyer ID"
              value={historyBuyerId}
              onChange={(event) => setHistoryBuyerId(event.target.value)}
              required
            />
            <button className="button" type="submit">
              Load history
            </button>
          </form>

          {paymentsState.error ? <StatusMessage tone="error" message={paymentsState.error} /> : null}
          {paymentsState.loading && queryBuyerId ? <div>Loading payment history...</div> : null}

          {paymentsState.data ? (
            <DataTable
              rows={paymentsState.data.items}
              emptyMessage="No payment entries returned for this buyer."
              columns={[
                { key: 'title', label: 'Title', render: (row) => row.title },
                { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
                { key: 'status', label: 'Status', render: (row) => row.status },
                { key: 'dueDate', label: 'Due date', render: (row) => formatDate(row.dueDate) },
                { key: 'paidDate', label: 'Paid date', render: (row) => formatDate(row.paidDate) },
                {
                  key: 'reference',
                  label: 'Reference',
                  render: (row) => row.referenceNumber ?? '-',
                },
              ]}
            />
          ) : (
            <div className="empty-state">
              Enter a buyer ID and load payment history from `GET /api/v1/admin/payments`.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
