import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { Pipeline } from '../types/orin';

interface TriggerModalProps {
  pipeline: Pipeline | null;
  onClose: () => void;
  onSuccess: (jobId?: string) => void;
}

export const TriggerModal: React.FC<TriggerModalProps> = ({
  pipeline,
  onClose,
  onSuccess,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [token, setToken] = useState('');
  const [inputs, setInputs] = useState<{ key: string; value: string }[]>([
    { key: 'branch', value: 'main' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (pipeline) {
      setError(null);
      setSubmitting(false);
      // Pre-fill default token if present in localStorage
      const defaultToken = localStorage.getItem('orin_manual_token') || '';
      setToken(defaultToken);

      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [pipeline]);

  if (!pipeline) return null;

  const handleAddInput = () => {
    setInputs([...inputs, { key: '', value: '' }]);
  };

  const handleRemoveInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const handleInputChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...inputs];
    updated[index][field] = val;
    setInputs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipeline) return;

    setSubmitting(true);
    setError(null);

    const inputsMap: Record<string, string> = {};
    for (const item of inputs) {
      if (item.key.trim()) {
        inputsMap[item.key.trim()] = item.value;
      }
    }

    try {
      const resp = await api.triggerPipeline(pipeline.name, {
        token: token.trim() || undefined,
        inputs: inputsMap,
      });

      // Save token if user filled it
      if (token.trim()) {
        localStorage.setItem('orin_manual_token', token.trim());
      }

      onSuccess(resp.jobId);
      dialogRef.current?.close();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="trigger-dialog-title"
      style={{
        border: '1px solid var(--split)',
        backgroundColor: 'var(--card-surface)',
        color: 'var(--text-main)',
        padding: '24px',
        width: '520px',
        maxWidth: '90vw',
        margin: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid var(--split)',
          paddingBottom: '12px',
        }}
      >
        <h2
          id="trigger-dialog-title"
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--title-color)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          手动触发流水线: {pipeline.name}
        </h2>
        <button
          type="button"
          onClick={() => {
            dialogRef.current?.close();
            onClose();
          }}
          aria-label="关闭对话框"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            padding: '4px 8px',
          }}
        >
          [ESC]
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="trigger-token"
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            MANUAL TOKEN (鉴权密钥)
          </label>
          <input
            id="trigger-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="输入 manualToken"
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'var(--background)',
              color: 'var(--text-main)',
              border: '1px solid var(--split)',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
              }}
            >
              PIPELINE INPUTS (输入变量参数)
            </span>
            <button
              type="button"
              onClick={handleAddInput}
              style={{
                padding: '2px 8px',
                fontSize: '0.75rem',
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-main)',
                border: '1px solid var(--split)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              + ADD INPUT
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inputs.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Key (e.g. branch)"
                  value={item.key}
                  onChange={(e) => handleInputChange(idx, 'key', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--split)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                  }}
                />
                <input
                  type="text"
                  placeholder="Value (e.g. main)"
                  value={item.value}
                  onChange={(e) => handleInputChange(idx, 'value', e.target.value)}
                  style={{
                    flex: 1.5,
                    padding: '6px 10px',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--split)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveInput(idx)}
                  aria-label="删除此参数"
                  style={{
                    padding: '0 10px',
                    backgroundColor: 'var(--card-background)',
                    color: 'var(--error)',
                    border: '1px solid var(--split)',
                    fontSize: '0.875rem',
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '10px 12px',
              backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              fontSize: '0.8125rem',
              marginBottom: '16px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--split)',
            paddingTop: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              onClose();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--split)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '8px 20px',
              backgroundColor: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)',
              border: 'none',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'TRIGGERING...' : 'TRIGGER NOW'}
          </button>
        </div>
      </form>
    </dialog>
  );
};
