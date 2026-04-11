import { useState } from 'react';
import { InputField, SelectField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { useSubmitState } from '../hooks/useSubmitState';
import { useAuth } from '../state/AuthContext';

const unitStatuses = ['available', 'booked', 'blocked'] as const;

export function UnitsPage() {
  const { api } = useAuth();
  const createSubmit = useSubmitState();
  const updateSubmit = useSubmitState();

  const [projectId, setProjectId] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [tower, setTower] = useState('');
  const [floor, setFloor] = useState('');
  const [type, setType] = useState('');
  const [areaSqFt, setAreaSqFt] = useState('');
  const [createStatus, setCreateStatus] = useState<(typeof unitStatuses)[number]>('available');

  const [unitId, setUnitId] = useState('');
  const [updateStatus, setUpdateStatus] = useState<(typeof unitStatuses)[number]>('booked');

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createSubmit.run(
      () =>
        api.createUnit({
          projectId,
          unitNumber,
          tower,
          floor: Number(floor),
          type,
          areaSqFt: Number(areaSqFt),
          status: createStatus,
        }),
      'Unit created successfully.',
    );
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateSubmit.run(
      () => api.updateUnit(unitId, { status: updateStatus }),
      'Unit status updated.',
    );
  }

  return (
    <section className="page">
      <PageHeader
        title="Units"
        description="Create units and update unit status using the backend’s POST and PUT unit APIs."
      />

      <div className="two-column">
        <form className="card form-grid" onSubmit={handleCreate}>
          <h3>Create unit</h3>
          <InputField
            label="Project ID"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            required
          />
          <InputField
            label="Unit number"
            value={unitNumber}
            onChange={(event) => setUnitNumber(event.target.value)}
            required
          />
          <InputField
            label="Tower"
            value={tower}
            onChange={(event) => setTower(event.target.value)}
          />
          <InputField
            label="Floor"
            type="number"
            value={floor}
            onChange={(event) => setFloor(event.target.value)}
            required
          />
          <InputField
            label="Type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            required
          />
          <InputField
            label="Area (sq ft)"
            type="number"
            value={areaSqFt}
            onChange={(event) => setAreaSqFt(event.target.value)}
            required
          />
          <SelectField
            label="Status"
            value={createStatus}
            onChange={(event) => setCreateStatus(event.target.value as typeof createStatus)}
          >
            {unitStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>

          {createSubmit.error ? <StatusMessage tone="error" message={createSubmit.error} /> : null}
          {createSubmit.success ? (
            <StatusMessage tone="success" message={createSubmit.success} />
          ) : null}

          <button className="button" type="submit" disabled={createSubmit.submitting}>
            {createSubmit.submitting ? 'Creating...' : 'Create unit'}
          </button>
        </form>

        <form className="card form-grid" onSubmit={handleUpdate}>
          <h3>Update unit status</h3>
          <InputField
            label="Unit ID"
            value={unitId}
            onChange={(event) => setUnitId(event.target.value)}
            required
          />
          <SelectField
            label="Status"
            value={updateStatus}
            onChange={(event) => setUpdateStatus(event.target.value as typeof updateStatus)}
          >
            {unitStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>

          {updateSubmit.error ? <StatusMessage tone="error" message={updateSubmit.error} /> : null}
          {updateSubmit.success ? (
            <StatusMessage tone="success" message={updateSubmit.success} />
          ) : null}

          <button className="button" type="submit" disabled={updateSubmit.submitting}>
            {updateSubmit.submitting ? 'Saving...' : 'Update unit'}
          </button>
        </form>
      </div>
    </section>
  );
}
