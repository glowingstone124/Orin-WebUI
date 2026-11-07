import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { ActionDetail, ActionSavePayload } from '../types/orin';

interface ScriptEditorModalProps {
  isOpen: boolean;
  mode: 'new' | 'edit';
  scriptName?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_KTS_TEMPLATE = `// Orin Kotlin Script Action (.kts)
val pipeline = context.pipeline?.name ?: "unknown"
val action = context.action?.name ?: "unknown"
orin.log("Starting action $action in pipeline $pipeline")

// Access trigger parameters and inputs
val trigger = context.trigger
val branch = context.inputs["branch"] ?: "main"
orin.log("Trigger source: $trigger, branch: $branch")

// Execute shell commands directly
// val exitCode = orin.exec("cargo test")
// if (exitCode != 0) {
//     orin.error("Tests failed with code $exitCode")
// }
`;

const DEFAULT_SH_TEMPLATE = `#!/bin/bash
set -e

echo "[Orin Shell Action] Running action=$ORIN_ACTION in pipeline=$ORIN_PIPELINE"
echo "Trigger: $ORIN_TRIGGER | Repository: $ORIN_REPOSITORY"
echo "Commit sender: $ORIN_SENDER | Commit count: $ORIN_COMMIT_COUNT"

# Add custom commands below:
# cargo build --release
`;

export const ScriptEditorModal: React.FC<ScriptEditorModalProps> = ({
  isOpen,
  mode,
  scriptName,
  onClose,
  onSaved,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState('');
  const [entryType, setEntryType] = useState<'kts' | 'sh'>('kts');
  const [entry, setEntry] = useState('main.kts');
  const [scriptContent, setScriptContent] = useState('');
  const [manifestContent, setManifestContent] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'manifest'>('code');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setError(null);
      setActiveTab('code');

      if (mode === 'edit' && scriptName) {
        setLoading(true);
        api
          .getActionDetail(scriptName)
          .then((detail: ActionDetail) => {
            setName(detail.name);
            setEntry(detail.entry);
            setEntryType(detail.entryType === 'sh' ? 'sh' : 'kts');
            setScriptContent(detail.content);
            setManifestContent(detail.manifestContent);
          })
          .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : String(err));
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setName('');
        setEntryType('kts');
        setEntry('main.kts');
        setScriptContent(DEFAULT_KTS_TEMPLATE);
        setManifestContent('entry = "main.kts"\n\n[kts]\nexpose = ["pipeline", "action", "trigger", "inputs", "github", "paths"]\n');
      }

      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, mode, scriptName]);

  const handleEntryTypeChange = (type: 'kts' | 'sh') => {
    setEntryType(type);
    const newEntry = type === 'kts' ? 'main.kts' : 'main.sh';
    setEntry(newEntry);
    if (mode === 'new') {
      if (type === 'kts') {
        setScriptContent(DEFAULT_KTS_TEMPLATE);
        setManifestContent('entry = "main.kts"\n\n[kts]\nexpose = ["pipeline", "action", "trigger", "inputs", "github", "paths"]\n');
      } else {
        setScriptContent(DEFAULT_SH_TEMPLATE);
        setManifestContent('entry = "main.sh"\n');
      }
    }
  };

  const handleApplyTemplate = (type: 'kts' | 'sh') => {
    if (type === 'kts') {
      handleEntryTypeChange('kts');
      setScriptContent(DEFAULT_KTS_TEMPLATE);
    } else {
      handleEntryTypeChange('sh');
      setScriptContent(DEFAULT_SH_TEMPLATE);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const updated = scriptContent.substring(0, start) + '  ' + scriptContent.substring(end);
      setScriptContent(updated);

      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const safeName = name.trim();
    if (!safeName) {
      setError('脚本动作名称不能为空');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(safeName)) {
      setError('名称格式无效，仅支持英文字母、数字、下划线及横杠');
      return;
    }

    setSubmitting(true);
    const payload: ActionSavePayload = {
      name: safeName,
      entry: entry.trim() || (entryType === 'kts' ? 'main.kts' : 'main.sh'),
      scriptContent,
      manifestContent: manifestContent.trim() || undefined,
    };

    try {
      if (mode === 'new') {
        await api.saveAction(payload);
      } else {
        await api.updateAction(safeName, payload);
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

  const lineCount = (scriptContent.match(/\n/g) || []).length + 1;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="script-editor-title"
      style={{
        border: '1px solid var(--split)',
        borderRadius: 0,
        backgroundColor: 'var(--card-surface)',
        color: 'var(--text-main)',
        padding: '0',
        width: '90vw',
        maxWidth: '920px',
        maxHeight: '90vh',
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '90vh' }}>
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--split)',
            backgroundColor: 'var(--background-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                padding: '2px 8px',
                fontWeight: 600,
              }}
            >
              ACTION SCRIPT
            </span>
            <h2
              id="script-editor-title"
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: 'var(--title-color)',
              }}
            >
              {mode === 'new' ? '新建动作脚本 (NEW SCRIPT)' : `编辑脚本: ${scriptName}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭对话框"
            style={{
              background: 'transparent',
              border: '1px solid var(--split)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
            }}
          >
            ESC / CLOSE
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'color-mix(in srgb, var(--error) 12%, transparent)',
                border: '1px solid var(--error)',
                color: 'var(--error)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
              }}
            >
              [ERROR] {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              加载脚本内容中 (LOADING SCRIPT)...
            </div>
          ) : (
            <>
              {/* Form Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label
                    htmlFor="script-name-input"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    动作名称 (ACTION NAME) *
                  </label>
                  <input
                    id="script-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={mode === 'edit'}
                    placeholder="e.g. cargo-build, docker-push"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: mode === 'edit' ? 'var(--background-secondary)' : 'var(--background)',
                      border: '1px solid var(--split)',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="script-type-select"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    脚本类型 (TYPE)
                  </label>
                  <select
                    id="script-type-select"
                    value={entryType}
                    onChange={(e) => handleEntryTypeChange(e.target.value as 'kts' | 'sh')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--split)',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="kts">Kotlin Script (.kts)</option>
                    <option value="sh">Shell Script (.sh)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="script-entry-input"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    入口文件 (ENTRY FILE)
                  </label>
                  <input
                    id="script-entry-input"
                    type="text"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="main.kts or main.sh"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--split)',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              {/* Editor Tabs & Quick Templates */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--split)',
                  paddingTop: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('code')}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: activeTab === 'code' ? 'var(--card-surface)' : 'var(--background-secondary)',
                      border: '1px solid var(--split)',
                      borderBottom: activeTab === 'code' ? '1px solid var(--card-surface)' : '1px solid var(--split)',
                      marginBottom: '-1px',
                      color: activeTab === 'code' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: activeTab === 'code' ? 600 : 400,
                    }}
                  >
                    SCRIPT CODE ({entry})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('manifest')}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: activeTab === 'manifest' ? 'var(--card-surface)' : 'var(--background-secondary)',
                      border: '1px solid var(--split)',
                      borderBottom: activeTab === 'manifest' ? '1px solid var(--card-surface)' : '1px solid var(--split)',
                      marginBottom: '-1px',
                      color: activeTab === 'manifest' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: activeTab === 'manifest' ? 600 : 400,
                    }}
                  >
                    MANIFEST (entry.toml)
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    TEMPLATES:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('kts')}
                    style={{
                      padding: '2px 8px',
                      backgroundColor: 'var(--background-secondary)',
                      border: '1px solid var(--split)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    KTS TEMPLATE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('sh')}
                    style={{
                      padding: '2px 8px',
                      backgroundColor: 'var(--background-secondary)',
                      border: '1px solid var(--split)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    SHELL TEMPLATE
                  </button>
                </div>
              </div>

              {/* Code Area */}
              {activeTab === 'code' ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '320px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'var(--code-bg)',
                      color: 'var(--code-text)',
                      padding: '4px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      border: '1px solid var(--split)',
                      borderBottom: 'none',
                    }}
                  >
                    <span>{entry}</span>
                    <span>{lineCount} LINES</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={scriptContent}
                    onChange={(e) => setScriptContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="// Write script code here..."
                    spellCheck={false}
                    style={{
                      flex: 1,
                      minHeight: '300px',
                      padding: '12px',
                      backgroundColor: 'var(--code-bg)',
                      color: 'var(--code-text)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      border: '1px solid var(--split)',
                      resize: 'vertical',
                      tabSize: 2,
                      whiteSpace: 'pre',
                      overflowX: 'auto',
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '260px' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--background-secondary)',
                      color: 'var(--text-secondary)',
                      padding: '4px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      border: '1px solid var(--split)',
                      borderBottom: 'none',
                    }}
                  >
                    entry.toml (Action Manifest)
                  </div>
                  <textarea
                    value={manifestContent}
                    onChange={(e) => setManifestContent(e.target.value)}
                    placeholder='entry = "main.kts"'
                    spellCheck={false}
                    style={{
                      flex: 1,
                      minHeight: '240px',
                      padding: '12px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      border: '1px solid var(--split)',
                      resize: 'vertical',
                      tabSize: 2,
                      whiteSpace: 'pre',
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--split)',
            backgroundColor: 'var(--background-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '8px 18px',
              backgroundColor: 'transparent',
              border: '1px solid var(--split)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={submitting || loading}
            style={{
              padding: '8px 22px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: '1px solid var(--primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: submitting || loading ? 'not-allowed' : 'pointer',
              opacity: submitting || loading ? 0.7 : 1,
            }}
          >
            {submitting ? 'SAVING...' : mode === 'new' ? 'CREATE SCRIPT' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </dialog>
  );
};
