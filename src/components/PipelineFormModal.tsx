import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { Pipeline } from '../types/orin';

interface PipelineFormModalProps {
  isOpen: boolean;
  mode: 'new' | 'edit';
  pipeline: Pipeline | null;
  availableActions: string[];
  onClose: () => void;
  onSaved: () => void;
}

export const PipelineFormModal: React.FC<PipelineFormModalProps> = ({
  isOpen,
  mode,
  pipeline,
  availableActions,
  onClose,
  onSaved,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [repository, setRepository] = useState('');
  const [triggers, setTriggers] = useState<string[]>(['manual']);
  const [manualToken, setManualToken] = useState('');
  const [actions, setActions] = useState<string[]>([]);
  const [newActionInput, setNewActionInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setError(null);
      setSubmitting(false);
      setNewActionInput('');

      if (mode === 'edit' && pipeline) {
        setName(pipeline.name);
        setEnabled(pipeline.enabled);
        setRepository(pipeline.repository || '');
        setTriggers([...pipeline.triggers]);
        setManualToken(pipeline.manualToken || '');
        setActions([...pipeline.actions]);
      } else {
        setName('');
        setEnabled(true);
        setRepository('');
        setTriggers(['manual']);
        setManualToken('');
        setActions([]);
      }

      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, mode, pipeline]);

  const handleToggleTrigger = (trigger: string) => {
    if (triggers.includes(trigger)) {
      setTriggers(triggers.filter((t) => t !== trigger));
    } else {
      setTriggers([...triggers, trigger]);
    }
  };

  const handleAddAction = () => {
    const trimmed = newActionInput.trim();
    if (trimmed && !actions.includes(trimmed)) {
      setActions([...actions, trimmed]);
      setNewActionInput('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('流水线名称不能为空');
      return;
    }

    if (triggers.length === 0) {
      setError('至少需要勾选一个触发源 (Triggers)');
      return;
    }

    setSubmitting(true);
    const payload: Partial<Pipeline> = {
      name: name.trim(),
      enabled,
      repository: repository.trim() || null,
      triggers,
      manualToken: manualToken.trim() || null,
      actions,
    };

    try {
      if (mode === 'new') {
        await api.createPipeline(payload);
      } else {
        await api.updatePipeline(name, payload);
      }
      onSaved();
      dialogRef.current?.close();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="pipeline-form-title"
      style={{
        border: '1px solid var(--split)',
        backgroundColor: 'var(--card-surface)',
        color: 'var(--text-main)',
        padding: '24px',
        width: '560px',
        maxWidth: '92vw',
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
          id="pipeline-form-title"
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--title-color)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {mode === 'new' ? '新建流水线 (NEW PIPELINE)' : `编辑流水线: ${pipeline?.name}`}
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
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          [ESC]
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label
            htmlFor="pipeline-name-input"
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            PIPELINE NAME (流水线唯一标识) *
          </label>
          <input
            id="pipeline-name-input"
            type="text"
            required
            disabled={mode === 'edit'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: build-and-deploy"
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: mode === 'edit' ? 'var(--background-secondary)' : 'var(--background)',
              color: 'var(--text-main)',
              border: '1px solid var(--split)',
              fontFamily: 'var(--font-mono)',
              cursor: mode === 'edit' ? 'not-allowed' : 'text',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            id="pipeline-enabled-input"
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <label
            htmlFor="pipeline-enabled-input"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            启用此流水线 (ENABLED)
          </label>
        </div>

        <div>
          <label
            htmlFor="pipeline-repo-input"
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            REPOSITORY (绑定代码仓库名称，留空则匹配全部)
          </label>
          <input
            id="pipeline-repo-input"
            type="text"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            placeholder="例如: QuantumOriginal"
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

        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            TRIGGERS (允许的触发源) *
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['manual', 'github.push', 'cluster'].map((tr) => (
              <label
                key={tr}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={triggers.includes(tr)}
                  onChange={() => handleToggleTrigger(tr)}
                />
                <span>{tr}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="pipeline-token-input"
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            MANUAL TOKEN (手动触发密钥)
          </label>
          <input
            id="pipeline-token-input"
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="输入触发时的鉴权密钥"
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

        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            ACTION STEPS (执行动作步骤)
          </span>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              type="text"
              list="available-actions-list"
              value={newActionInput}
              onChange={(e) => setNewActionInput(e.target.value)}
              placeholder="选择或输入 action 动作名..."
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
            <datalist id="available-actions-list">
              {availableActions.map((act) => (
                <option key={act} value={act} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={handleAddAction}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-main)',
                border: '1px solid var(--split)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              + ADD STEP
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '32px' }}>
            {actions.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                (暂未添加任何 Action 步骤)
              </span>
            ) : (
              actions.map((act, index) => (
                <div
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    backgroundColor: 'var(--background-secondary)',
                    border: '1px solid var(--split)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>#{index + 1}</span>
                  <span>{act}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(index)}
                    aria-label={`移除动作 ${act}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--error)',
                      fontWeight: 700,
                      padding: '0 2px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
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
            marginTop: '8px',
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
            {submitting ? 'SAVING...' : mode === 'new' ? 'CREATE PIPELINE' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </dialog>
  );
};
