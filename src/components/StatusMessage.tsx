interface StatusMessageProps {
  tone: 'error' | 'success' | 'info';
  message: string;
}

export function StatusMessage({ tone, message }: StatusMessageProps) {
  return <div className={`status-message status-message--${tone}`}>{message}</div>;
}
