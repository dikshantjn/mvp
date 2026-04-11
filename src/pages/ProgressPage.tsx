import { useState } from 'react';
import { InputField, TextareaField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useSubmitState } from '../hooks/useSubmitState';
import { useAuth } from '../state/AuthContext';

export function ProgressPage() {
  const { api } = useAuth();
  const submit = useSubmitState();
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await submit.run(
      () =>
        api.uploadProgress({
          projectId,
          title,
          description,
          publishedAt,
          file,
        }),
      'Progress update uploaded.',
    );
  }

  return (
    <section className="page">
      <PageHeader
        title="Upload progress"
        description="Create project construction updates with the backend’s multipart form contract, including optional image uploads."
      />

      <form className="card form-grid" onSubmit={handleSubmit}>
        <InputField
          label="Project ID"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          required
        />
        <InputField
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <TextareaField
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          required
        />
        <InputField
          label="Published at"
          type="datetime-local"
          value={publishedAt}
          onChange={(event) => setPublishedAt(event.target.value)}
          required
        />
        <label className="field">
          <span>Image</span>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <small>Optional image, maximum size: 10 MB</small>
        </label>

        {submit.error ? <StatusMessage tone="error" message={submit.error} /> : null}
        {submit.success ? <StatusMessage tone="success" message={submit.success} /> : null}

        <button className="button" type="submit" disabled={submit.submitting}>
          {submit.submitting ? 'Uploading...' : 'Create progress update'}
        </button>
      </form>
    </section>
  );
}
