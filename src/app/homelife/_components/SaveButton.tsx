'use client';
import { useFormStatus } from 'react-dom';

export function SaveButton({
  children = 'Save',
  pendingLabel = 'Saving…',
  variant = 'primary',
  style,
  disabled,
  form,
}: {
  children?: React.ReactNode;
  pendingLabel?: string;
  variant?: 'primary' | 'ghost';
  style?: React.CSSProperties;
  disabled?: boolean;
  form?: string;
}) {
  const { pending } = useFormStatus();
  const cls = variant === 'primary' ? 'btn btn-primary' : 'btn btn-ghost';
  return (
    <button
      type="submit"
      form={form}
      className={cls}
      disabled={pending || disabled}
      style={{
        ...style,
        opacity: pending || disabled ? 0.6 : 1,
        cursor: pending || disabled ? 'wait' : 'pointer',
        position: 'relative',
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
