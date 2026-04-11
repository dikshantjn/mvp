import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { InputField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../state/AuthContext';

export function BuyersPage() {
  const { api } = useAuth();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, error, loading } = useAsyncData(
    () => api.getBuyers({ search: query || undefined, page: 1, pageSize: 20 }),
    [api, query],
  );

  return (
    <section className="page">
      <PageHeader
        title="Buyers"
        description="Search buyer records, review assigned units, and open the backend-provided buyer detail view."
        actions={
          <Link className="button" to="/buyers/upload">
            Upload CSV
          </Link>
        }
      />

      <form
        className="card toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(search.trim());
        }}
      >
        <InputField
          label="Search"
          placeholder="Search by buyer, mobile, project, or unit"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="button" type="submit">
          Apply
        </button>
      </form>

      {error ? <StatusMessage tone="error" message={error} /> : null}
      {loading ? <div className="card">Loading buyers...</div> : null}

      {data ? (
        <div className="card stack">
          <div className="section-meta">
            <strong>{data.total}</strong>
            <span>Total buyers</span>
          </div>
          <DataTable
            rows={data.items}
            emptyMessage="No buyers found for the current filter."
            columns={[
              {
                key: 'name',
                label: 'Buyer',
                render: (row) => (
                  <div>
                    <strong>{row.fullName}</strong>
                    <div>{row.email}</div>
                  </div>
                ),
              },
              {
                key: 'mobile',
                label: 'Mobile',
                render: (row) => row.mobileNumber,
              },
              {
                key: 'project',
                label: 'Project',
                render: (row) => row.projectName,
              },
              {
                key: 'unit',
                label: 'Unit',
                render: (row) => row.unitNumber,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <span className={`pill pill--${row.status}`}>{row.status}</span>,
              },
              {
                key: 'action',
                label: 'Action',
                render: (row) => (
                  <Link className="text-link" to={`/buyers/${row.buyerId}`}>
                    View detail
                  </Link>
                ),
              },
            ]}
          />
        </div>
      ) : null}
    </section>
  );
}
