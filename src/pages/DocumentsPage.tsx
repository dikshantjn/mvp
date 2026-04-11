import { useState } from 'react';
import { InputField, SelectField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useSubmitState } from '../hooks/useSubmitState';
import { useAuth } from '../state/AuthContext';

const documentTypes = ['agreement', 'receipt', 'statement', 'invoice', 'other'] as const;

export function DocumentsPage() {
  const { api } = useAuth();
  const submit = useSubmitState();
  const [buyerId, setBuyerId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<(typeof documentTypes)[number]>('agreement');
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      submit.setError('Select a document file to upload.');
      return;
    }

    await submit.run(
      () => api.uploadDocument({ buyerId, title, type, file }),
      'Document upload completed.',
    );
    setTitle('');
    setFile(null);
  }

  return (
    <section className="page">
      <PageHeader
        title="Upload documents"
        description="Send buyer document files to POST /api/v1/admin/documents using the exact multipart fields from the spec."
      />

      <form className="card form-grid" onSubmit={handleSubmit}>
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
        <SelectField
          label="Document type"
          value={type}
          onChange={(event) => setType(event.target.value as typeof type)}
        >
          {documentTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </SelectField>
        <label className="field">
          <span>File</span>
          <input
            className="input"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
          <small>Maximum size: 15 MB</small>
        </label>

        {submit.error ? <StatusMessage tone="error" message={submit.error} /> : null}
        {submit.success ? <StatusMessage tone="success" message={submit.success} /> : null}

        <button className="button" type="submit" disabled={submit.submitting}>
          {submit.submitting ? 'Uploading...' : 'Upload document'}
        </button>
      </form>
    </section>
  );
}
