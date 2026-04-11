import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useSubmitState } from '../hooks/useSubmitState';
import { useAuth } from '../state/AuthContext';
import type { BuyerImportResult } from '../types/api';

export function UploadBuyersPage() {
  const { api } = useAuth();
  const submit = useSubmitState();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BuyerImportResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      submit.setError('Select a CSV file to upload.');
      return;
    }

    const response = await submit.run(
      () => api.uploadBuyersCsv(file),
      'Buyer CSV uploaded successfully.',
    );
    setResult(response);
  }

  return (
    <section className="page">
      <PageHeader
        title="Upload buyers CSV"
        description="Posts CSV files to the buyer import endpoint and shows the exact import summary returned by the backend."
      />

      <form className="card form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>CSV file</span>
          <input
            className="input"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
          <small>
            Required columns: full_name, email, mobile_number, project_name, unit_number,
            tower, floor, unit_type, area_sq_ft, agreement_value, booking_date
          </small>
        </label>

        {submit.error ? <StatusMessage tone="error" message={submit.error} /> : null}
        {submit.success ? <StatusMessage tone="success" message={submit.success} /> : null}

        <button className="button" type="submit" disabled={submit.submitting}>
          {submit.submitting ? 'Uploading...' : 'Upload CSV'}
        </button>
      </form>

      {result ? (
        <div className="card">
          <h3>Import summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Total rows</span>
              <strong>{result.totalRows}</strong>
            </div>
            <div className="stat-card">
              <span>Success rows</span>
              <strong>{result.successRows}</strong>
            </div>
            <div className="stat-card">
              <span>Failed rows</span>
              <strong>{result.failedRows}</strong>
            </div>
          </div>

          {result.errors.length ? (
            <div className="stack">
              <h4>Errors</h4>
              {result.errors.map((error) => (
                <div key={`${error.rowNumber}-${error.message}`} className="list-item">
                  Row {error.rowNumber}: {error.message}
                </div>
              ))}
            </div>
          ) : (
            <p>No row-level validation errors were returned.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
