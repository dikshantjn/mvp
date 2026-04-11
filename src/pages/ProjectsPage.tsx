import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../state/AuthContext';

export function ProjectsPage() {
  const { api } = useAuth();
  const { data, error, loading } = useAsyncData(() => api.getProjects(), [api]);

  return (
    <section className="page">
      <PageHeader
        title="Projects"
        description="Read-only project list from GET /api/v1/admin/projects, used by other admin workflows like units and progress uploads."
      />

      {error ? <StatusMessage tone="error" message={error} /> : null}
      {loading ? <div className="card">Loading projects...</div> : null}

      {data ? (
        <div className="card">
          <DataTable
            rows={data.items}
            emptyMessage="No projects returned."
            columns={[
              { key: 'name', label: 'Name', render: (row) => row.name },
              { key: 'code', label: 'Code', render: (row) => row.code },
              { key: 'location', label: 'Location', render: (row) => row.location },
              { key: 'id', label: 'Project ID', render: (row) => row.id },
            ]}
          />
        </div>
      ) : null}
    </section>
  );
}
