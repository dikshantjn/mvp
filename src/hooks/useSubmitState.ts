import { useState } from 'react';

export function useSubmitState() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function run<T>(action: () => Promise<T>, successMessage?: string) {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await action();
      if (successMessage) {
        setSuccess(successMessage);
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submitting,
    error,
    success,
    setError,
    setSuccess,
    run,
  };
}
