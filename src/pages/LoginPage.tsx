import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { InputField } from '../components/FormField';
import { StatusMessage } from '../components/StatusMessage';
import { useSubmitState } from '../hooks/useSubmitState';
import { useAuth } from '../state/AuthContext';

export function LoginPage() {
  const { api, isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = useSubmitState();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await submit.run(
      () => api.login({ email, password }),
      'Admin login successful.',
    );
    login(response);
  }

  return (
    <div className="login-screen">
      <form className="card login-card" onSubmit={handleSubmit}>
        <div>
          <h1>Admin login</h1>
          <p>Use the admin email/password flow defined in the backend spec.</p>
        </div>

        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {submit.error ? <StatusMessage tone="error" message={submit.error} /> : null}

        <button className="button" type="submit" disabled={submit.submitting}>
          {submit.submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
