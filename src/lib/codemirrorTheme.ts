import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { EditorView } from '@codemirror/view'

/** 编辑器内语法色：比 UI 更饱和，保证暗色底上可读。 */
const darkSyntaxStyle = HighlightStyle.define([
  { tag: [t.propertyName, t.definition(t.propertyName)], color: '#f0c674' },
  { tag: [t.string, t.special(t.string)], color: '#ff8e8e' },
  { tag: [t.number, t.integer, t.float], color: '#8bda7a' },
  { tag: [t.bool, t.keyword], color: '#6cb6ff' },
  { tag: t.null, color: '#b0b0b8' },
  { tag: [t.className, t.typeName, t.tagName], color: '#d2a8ff' },
  { tag: [t.name, t.attributeName], color: '#e6e1cf' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#8b949e', fontStyle: 'italic' },
  { tag: [t.heading, t.heading1, t.heading2, t.heading3, t.heading4], color: '#fafafa', fontWeight: '600' },
  { tag: t.link, color: '#6cb6ff', textDecoration: 'underline' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strong, fontWeight: '700', color: '#fafafa' },
  { tag: [t.meta, t.processingInstruction], color: '#8b949e' },
  { tag: [t.punctuation, t.bracket, t.separator, t.squareBracket, t.paren], color: '#9ca3af' },
  { tag: t.invalid, color: '#ff7b72', textDecoration: 'underline wavy' },
])

export const codeEditorSyntax = syntaxHighlighting(darkSyntaxStyle)

export const codeEditorViewTheme = EditorView.theme(
  {
  '&': {
    height: '100%',
    fontSize: '13px',
    color: 'var(--text)',
    backgroundColor: 'var(--editor-bg)',
  },
  '.cm-scroller': {
    fontFamily: 'var(--mono)',
    lineHeight: '1.6',
  },
  '.cm-content': {
    padding: '12px 0',
    caretColor: 'var(--text-heading)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--editor-gutter)',
    borderRight: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(108, 182, 255, 0.22) !important',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--text-heading)',
  },
  '.cm-panels': {
    backgroundColor: 'var(--panel-bg)',
    color: 'var(--text)',
  },
  '.cm-panels-bottom': {
    borderTop: '1px solid var(--border)',
  },
  '.cm-panel': {
    backgroundColor: 'var(--panel-bg)',
    color: 'var(--text)',
  },
  '.cm-search': {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px',
    fontFamily: 'var(--sans)',
    fontSize: '13px',
    lineHeight: '1.4',
    backgroundColor: 'var(--panel-bg)',
    borderTop: '1px solid var(--border)',
  },
  '.cm-search .cm-textfield': {
    fontSize: '13px',
    lineHeight: '1.4',
    minHeight: '32px',
    padding: '6px 10px',
    minWidth: '200px',
    flex: '1 1 200px',
    fontFamily: 'var(--mono)',
    backgroundColor: 'var(--editor-bg)',
    color: 'var(--text-heading)',
    border: '1px solid var(--border-strong)',
    borderRadius: '6px',
    verticalAlign: 'middle',
  },
  '.cm-search .cm-textfield:focus': {
    outline: 'none',
    borderColor: 'var(--text-muted)',
    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.08)',
  },
  '.cm-search .cm-button, .cm-search button': {
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '1.2',
    minHeight: '32px',
    padding: '6px 12px',
    fontFamily: 'var(--sans)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backgroundImage: 'none',
    color: 'var(--text-heading)',
    border: '1px solid var(--border-strong)',
    borderRadius: '6px',
    cursor: 'pointer',
    verticalAlign: 'middle',
  },
  '.cm-search .cm-button:hover, .cm-search button:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    backgroundImage: 'none',
  },
  '.cm-search .cm-button:active, .cm-search button:active': {
    backgroundImage: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  '.cm-search button[name="next"]': {
    backgroundColor: 'var(--accent)',
    color: 'var(--on-accent)',
    borderColor: 'var(--accent)',
    fontWeight: '600',
  },
  '.cm-search button[name="next"]:hover': {
    backgroundColor: 'var(--accent-hover)',
    borderColor: 'var(--accent-hover)',
    color: 'var(--on-accent)',
  },
  '.cm-search button[name="close"]': {
    marginLeft: 'auto',
    minWidth: '32px',
    padding: '6px 8px',
    fontSize: '16px',
    lineHeight: '1',
  },
  '.cm-search label': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  '.cm-search input[type="checkbox"]': {
    width: '14px',
    height: '14px',
    margin: 0,
    accentColor: 'var(--text-heading)',
    cursor: 'pointer',
  },
  '.cm-textfield': {
    fontSize: '13px',
    lineHeight: '1.4',
    verticalAlign: 'middle',
    backgroundColor: 'var(--editor-bg)',
    color: 'var(--text-heading)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '6px 10px',
  },
  '.cm-textfield:focus': {
    outline: 'none',
    borderColor: 'var(--border-strong)',
  },
  '.cm-button': {
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '1.2',
    verticalAlign: 'middle',
    backgroundImage: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-heading)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '6px 12px',
  },
  '.cm-button:hover': {
    backgroundImage: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  '.cm-button:active': {
    backgroundImage: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(240, 198, 116, 0.28)',
    outline: '1px solid rgba(240, 198, 116, 0.5)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(108, 182, 255, 0.35)',
    outline: '1px solid rgba(108, 182, 255, 0.55)',
  },
},
{ dark: true },
)
