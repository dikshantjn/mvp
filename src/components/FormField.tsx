import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  hint?: string;
}

export function InputField(props: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const { label, hint, ...inputProps } = props;
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" {...inputProps} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function SelectField(
  props: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  const { label, hint, children, ...selectProps } = props;
  return (
    <label className="field">
      <span>{label}</span>
      <select className="input" {...selectProps}>
        {children}
      </select>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function TextareaField(props: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { label, hint, ...textareaProps } = props;
  return (
    <label className="field">
      <span>{label}</span>
      <textarea className="input input--textarea" {...textareaProps} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
