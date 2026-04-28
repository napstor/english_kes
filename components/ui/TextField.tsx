import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import styles from "./TextField.module.css";

type SharedTextFieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
};

type InputTextFieldProps = SharedTextFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "required"> & {
    multiline?: false;
  };

type TextareaTextFieldProps = SharedTextFieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "required"> & {
    multiline: true;
  };

type TextFieldProps = InputTextFieldProps | TextareaTextFieldProps;

export function TextField(props: TextFieldProps) {
  const generatedId = useId();
  const {
    label,
    required = false,
    hint,
    error,
    className,
    id = generatedId,
    multiline,
    disabled,
    ...controlProps
  } = props;
  const helperId = hint || error ? `${id}-helper` : undefined;
  const invalid = Boolean(error);

  return (
    <label className={cn(styles.field, className)} htmlFor={id}>
      {label ? (
        <span className={styles.label}>
          {label}
          {required ? <span className={styles.required}> *</span> : null}
        </span>
      ) : null}
      {multiline ? (
        <textarea
          id={id}
          className={cn(styles.control, styles.textarea, invalid && styles.invalid)}
          required={required}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helperId}
          {...(controlProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          className={cn(styles.control, invalid && styles.invalid)}
          required={required}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helperId}
          {...(controlProps as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {helperId ? (
        <span className={cn(styles.helper, error && styles.error)} id={helperId}>
          {error || hint}
        </span>
      ) : null}
    </label>
  );
}
