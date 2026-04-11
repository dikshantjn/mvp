import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { InputField, SelectField, TextareaField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useAsyncData } from '../hooks/useAsyncData';
import { useSubmitState } from '../hooks/useSubmitState';
import { useAuth } from '../state/AuthContext';
import { formatDate } from '../utils/format';

const ticketStatuses = ['open', 'in_progress', 'resolved', 'closed'] as const;
const ticketPriorities = ['low', 'medium', 'high'] as const;

export function TicketsPage() {
  const { api } = useAuth();
  const submit = useSubmitState();
  const [filterStatus, setFilterStatus] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [status, setStatus] = useState<(typeof ticketStatuses)[number]>('resolved');
  const [priority, setPriority] = useState<(typeof ticketPriorities)[number]>('medium');
  const [resolutionNote, setResolutionNote] = useState('');

  const ticketsState = useAsyncData(
    () => api.getTickets({ status: filterStatus || undefined, page: 1, pageSize: 20 }),
    [api, filterStatus],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit.run(
      () => api.updateTicket(ticketId, { status, priority, resolutionNote }),
      'Ticket updated successfully.',
    );
  }

  return (
    <section className="page">
      <PageHeader
        title="Tickets"
        description="Review buyer tickets and update status, priority, and resolution notes through the exact admin ticket endpoints."
      />

      <div className="two-column">
        <div className="card stack">
          <form
            className="toolbar toolbar--inline"
            onSubmit={(event) => {
              event.preventDefault();
              setFilterStatus(filterStatus);
            }}
          >
            <SelectField
              label="Status filter"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              {ticketStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
          </form>

          {ticketsState.error ? <StatusMessage tone="error" message={ticketsState.error} /> : null}
          {ticketsState.loading ? <div>Loading tickets...</div> : null}

          {ticketsState.data ? (
            <DataTable
              rows={ticketsState.data.items}
              emptyMessage="No tickets returned for this filter."
              columns={[
                {
                  key: 'subject',
                  label: 'Ticket',
                  render: (row) => (
                    <div>
                      <strong>{row.subject}</strong>
                      <div>{row.buyerName}</div>
                    </div>
                  ),
                },
                { key: 'category', label: 'Category', render: (row) => row.category },
                { key: 'status', label: 'Status', render: (row) => row.status },
                { key: 'priority', label: 'Priority', render: (row) => row.priority },
                { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
              ]}
            />
          ) : null}
        </div>

        <form className="card form-grid" onSubmit={handleSubmit}>
          <h3>Update ticket</h3>
          <InputField
            label="Ticket ID"
            value={ticketId}
            onChange={(event) => setTicketId(event.target.value)}
            required
          />
          <SelectField
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            {ticketStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as typeof priority)}
          >
            {ticketPriorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
          <TextareaField
            label="Resolution note"
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
            rows={5}
            required
          />

          {submit.error ? <StatusMessage tone="error" message={submit.error} /> : null}
          {submit.success ? <StatusMessage tone="success" message={submit.success} /> : null}

          <button className="button" type="submit" disabled={submit.submitting}>
            {submit.submitting ? 'Saving...' : 'Update ticket'}
          </button>
        </form>
      </div>
    </section>
  );
}
