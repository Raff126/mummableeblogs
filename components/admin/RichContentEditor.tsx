'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface RichContentEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

export default function RichContentEditor({
  value,
  onChange,
  label = 'Blog Story & Details',
  placeholder = 'Write your guide, tips, and experiences here...',
  minHeight = '380px',
}: RichContentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const hasLoadedInitial = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);
  const editingAnchorRef = useRef<HTMLAnchorElement | null>(null);

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [isEditingExistingLink, setIsEditingExistingLink] = useState(false);

  // Floating Link Toolbar State
  const [activeAnchor, setActiveAnchor] = useState<HTMLAnchorElement | null>(null);
  const [activeAnchorUrl, setActiveAnchorUrl] = useState('');
  const [floatingPos, setFloatingPos] = useState<{ top: number; left: number } | null>(null);

  // Active formatting state indicators
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    heading2: false,
    heading3: false,
    unorderedList: false,
    orderedList: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
    isLink: false,
  });

  // Set default paragraph separator to <p> when mounted
  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch (_) {}
  }, []);

  // Safe synchronization from props to contentEditable element
  // CRITICAL: Never overwrite innerHTML while the user has focus inside the editor,
  // otherwise the cursor/caret jumps and typing breaks!
  useEffect(() => {
    if (!editorRef.current) return;

    const isFocused =
      typeof document !== 'undefined' &&
      (document.activeElement === editorRef.current ||
        editorRef.current.contains(document.activeElement));

    // If the user is currently typing inside, do NOT clobber their DOM
    if (isFocused && hasLoadedInitial.current) {
      return;
    }

    // Only update if content is meaningfully different
    const currentHtml = editorRef.current.innerHTML;
    if (value !== currentHtml && !isInternalUpdate.current) {
      editorRef.current.innerHTML = value || '';
      hasLoadedInitial.current = true;
    }
  }, [value]);

  // Dispatch change to parent component
  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
    setTimeout(() => {
      isInternalUpdate.current = false;
    }, 50);
  }, [onChange]);

  // Update active button indicators based on current cursor / selection
  const updateFormatState = useCallback(() => {
    if (typeof document === 'undefined' || !editorRef.current) return;

    try {
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const unorderedList = document.queryCommandState('insertUnorderedList');
      const orderedList = document.queryCommandState('insertOrderedList');
      const alignCenter = document.queryCommandState('justifyCenter');
      const alignRight = document.queryCommandState('justifyRight');
      const alignLeft = !alignCenter && !alignRight;

      const sel = window.getSelection();
      let heading2 = false;
      let heading3 = false;
      let isLink = false;
      let anchorEl: HTMLAnchorElement | null = null;

      if (sel && sel.rangeCount > 0) {
        const node = sel.anchorNode;
        if (node) {
          const parent =
            node.nodeType === Node.ELEMENT_NODE
              ? (node as HTMLElement)
              : node.parentElement;
          if (parent) {
            heading2 = !!parent.closest('h2');
            heading3 = !!parent.closest('h3');
            anchorEl = parent.closest('a');
            isLink = !!anchorEl;
          }
        }
      }

      setFormatState({
        bold,
        italic,
        underline,
        heading2,
        heading3,
        unorderedList,
        orderedList,
        alignLeft,
        alignCenter,
        alignRight,
        isLink,
      });

      // Position floating link toolbar if hovering or cursor inside link
      if (anchorEl && editorRef.current.contains(anchorEl)) {
        setActiveAnchor(anchorEl);
        setActiveAnchorUrl(anchorEl.getAttribute('href') || '');
        const rect = anchorEl.getBoundingClientRect();
        const containerRect = editorRef.current.getBoundingClientRect();
        setFloatingPos({
          top: Math.max(0, rect.bottom - containerRect.top + 6),
          left: Math.max(8, Math.min(rect.left - containerRect.left, containerRect.width - 240)),
        });
      } else {
        setActiveAnchor(null);
        setFloatingPos(null);
      }
    } catch (_) {}
  }, []);

  // Generic command runner with selection preservation
  const runCommand = (command: string, valArg: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, valArg);
    emitChange();
    updateFormatState();
  };

  // Heading Block Switcher
  const setHeading = (tag: 'h2' | 'h3' | 'p') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('formatBlock', false, tag);
    emitChange();
    updateFormatState();
  };

  // Save selection before opening modals
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Open Link Modal (for new link or editing existing link)
  const handleOpenLinkModal = (anchorToEdit?: HTMLAnchorElement) => {
    saveSelection();

    const targetAnchor = anchorToEdit || activeAnchor;

    if (targetAnchor && editorRef.current?.contains(targetAnchor)) {
      // Editing existing link
      editingAnchorRef.current = targetAnchor;
      setIsEditingExistingLink(true);
      setLinkText(targetAnchor.textContent || '');
      setLinkUrl(targetAnchor.getAttribute('href') || '');
      setOpenInNewTab(targetAnchor.getAttribute('target') === '_blank');
      setShowLinkModal(true);
      return;
    }

    // Adding new link: read selected text
    const sel = window.getSelection();
    let selectedText = '';
    let existingAnchor: HTMLAnchorElement | null = null;

    if (sel && sel.rangeCount > 0) {
      selectedText = sel.toString().trim();
      const node = sel.anchorNode;
      if (node) {
        const parent =
          node.nodeType === Node.ELEMENT_NODE
            ? (node as HTMLElement)
            : node.parentElement;
        existingAnchor = parent?.closest('a') || null;
      }
    }

    if (existingAnchor && editorRef.current?.contains(existingAnchor)) {
      editingAnchorRef.current = existingAnchor;
      setIsEditingExistingLink(true);
      setLinkText(existingAnchor.textContent || selectedText);
      setLinkUrl(existingAnchor.getAttribute('href') || '');
      setOpenInNewTab(existingAnchor.getAttribute('target') === '_blank');
    } else {
      editingAnchorRef.current = null;
      setIsEditingExistingLink(false);
      setLinkText(selectedText);
      setLinkUrl('');
      setOpenInNewTab(true);
    }

    setShowLinkModal(true);
  };

  // Save Link from Modal
  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    let url = linkUrl.trim();
    if (!url) return;

    // Automatically prepend https:// if missing
    if (
      !url.startsWith('http://') &&
      !url.startsWith('https://') &&
      !url.startsWith('/') &&
      !url.startsWith('#') &&
      !url.startsWith('mailto:') &&
      !url.startsWith('tel:')
    ) {
      url = 'https://' + url;
    }

    const displayText = linkText.trim() || url;

    if (!editorRef.current) return;
    editorRef.current.focus();

    if (isEditingExistingLink && editingAnchorRef.current) {
      // 1. Update existing anchor element
      editingAnchorRef.current.setAttribute('href', url);
      editingAnchorRef.current.textContent = displayText;
      if (openInNewTab) {
        editingAnchorRef.current.setAttribute('target', '_blank');
        editingAnchorRef.current.setAttribute('rel', 'noopener noreferrer');
      } else {
        editingAnchorRef.current.removeAttribute('target');
        editingAnchorRef.current.removeAttribute('rel');
      }
    } else {
      // 2. Insert or wrap into brand link
      const sel = window.getSelection();

      // Restore saved range if available
      if (savedRangeRef.current && sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }

      const hasHighlight =
        savedRangeRef.current && !savedRangeRef.current.collapsed;

      if (hasHighlight && savedRangeRef.current) {
        // Replace precisely the highlighted range with the <a> link
        const a = document.createElement('a');
        a.href = url;
        a.textContent = displayText;
        if (openInNewTab) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }

        savedRangeRef.current.deleteContents();
        savedRangeRef.current.insertNode(a);

        // Move caret right after the new link
        const newRange = document.createRange();
        newRange.setStartAfter(a);
        newRange.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(newRange);
      } else {
        // No text was highlighted: insert new link node at cursor
        const a = document.createElement('a');
        a.href = url;
        a.textContent = displayText;
        if (openInNewTab) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }

        if (savedRangeRef.current) {
          savedRangeRef.current.insertNode(a);
          const space = document.createTextNode('\u00A0');
          a.parentNode?.insertBefore(space, a.nextSibling);

          const newRange = document.createRange();
          newRange.setStartAfter(space);
          newRange.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(newRange);
        } else {
          editorRef.current.appendChild(a);
        }
      }
    }

    emitChange();
    updateFormatState();
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
    editingAnchorRef.current = null;
    savedRangeRef.current = null;
    setActiveAnchor(null);
  };

  // Remove / Unlink command
  const handleRemoveLink = (targetAnchor?: HTMLAnchorElement) => {
    const anchor = targetAnchor || activeAnchor || editingAnchorRef.current;
    if (anchor && editorRef.current?.contains(anchor)) {
      const text = anchor.textContent || '';
      const textNode = document.createTextNode(text);
      anchor.parentNode?.replaceChild(textNode, anchor);
      setActiveAnchor(null);
      setFloatingPos(null);
      emitChange();
      updateFormatState();
    } else {
      document.execCommand('unlink', false);
      emitChange();
      updateFormatState();
    }
  };

  // Intercept clicks on links inside the editor so browser doesn't navigate away!
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && editorRef.current?.contains(anchor)) {
      e.preventDefault(); // Prevent navigating away from admin form
      handleOpenLinkModal(anchor as HTMLAnchorElement);
    } else {
      updateFormatState();
    }
  };

  // Handle hotkeys (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+K)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      handleOpenLinkModal();
    }
  };

  return (
    <div className="space-y-2 font-sans">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[11px] text-[#332D2F]/70">
          Highlight words (e.g. <em>&ldquo;The Dubai Mall&rdquo;</em>) and click <strong>Link 🔗</strong> to attach a link.
        </span>
      </div>

      {/* Main Google Docs / Word Style Editor Container */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-soft transition-all focus-within:ring-2 focus-within:ring-[#B75B70] focus-within:border-transparent">
        {/* Clean Focused Link Toolbar */}
        <div
          className="sticky top-0 z-20 bg-[#FAF6F7] border-b border-gray-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs select-none"
          role="toolbar"
          aria-label="Link Toolbar"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleOpenLinkModal();
              }}
              title="Highlight text and click to add or edit link (Ctrl+K)"
              className="flex items-center gap-2 px-4 py-2 bg-[#683846] hover:bg-[#522c37] text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 text-xs"
            >
              <span className="text-sm">🔗</span>
              <span>{formatState.isLink ? 'Edit Link' : 'Add Link 🔗'}</span>
            </button>

            {formatState.isLink && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRemoveLink();
                }}
                title="Remove link from highlighted word"
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl border border-red-200 transition-all text-xs"
              >
                Remove Link
              </button>
            )}
          </div>

          <span className="text-[11px] text-gray-500 hidden sm:inline">
            💡 Highlight any brand or word and click <strong>Add Link 🔗</strong> (or press Ctrl+K)
          </span>
        </div>

        {/* Visual ContentEditable Area with Real Article Prose Typography */}
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            onInput={emitChange}
            onKeyUp={updateFormatState}
            onMouseUp={updateFormatState}
            onSelect={updateFormatState}
            onFocus={updateFormatState}
            onClick={handleEditorClick}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            style={{ minHeight }}
            className="article-prose p-6 sm:p-8 focus:outline-none bg-white text-[#332D2F] font-sans text-base leading-relaxed selection:bg-[#F8EDEF] selection:text-[#683846]"
          />

          {/* Floating Link Inspector Bar (shown when tapping/clicking an existing link) */}
          {activeAnchor && floatingPos && (
            <div
              style={{
                position: 'absolute',
                top: `${floatingPos.top}px`,
                left: `${floatingPos.left}px`,
              }}
              className="z-30 bg-[#683846] text-white px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in fade-in zoom-in-95 duration-100 border border-[#B75B70]/40"
            >
              <span className="text-white/80">🔗</span>
              <a
                href={activeAnchorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] underline text-[#D7BB91] hover:text-white max-w-[220px] truncate"
              >
                {activeAnchorUrl}
              </a>
              <div className="h-3.5 w-[1px] bg-white/20" />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleOpenLinkModal(activeAnchor);
                }}
                className="hover:underline font-bold text-white text-[11px]"
              >
                Edit
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRemoveLink(activeAnchor);
                }}
                className="text-red-200 hover:text-white font-bold text-[11px]"
              >
                Remove
              </button>
              <a
                href={activeAnchorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[10px] font-bold"
              >
                ↗ Test
              </a>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setActiveAnchor(null);
                  setFloatingPos(null);
                }}
                className="text-white/60 hover:text-white pl-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-[#FAF6F7] border-t border-gray-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>
              💡 <strong>Example:</strong> Highlight <em>&ldquo;The Dubai Mall&rdquo;</em> → Click <strong>Link 🔗</strong> → Enter URL. Only those words will be clickable!
            </span>
          </div>
          <span className="text-gray-400 font-medium">Visual Editor (No HTML codes needed)</span>
        </div>
      </div>

      {/* Clean Word/Google Docs Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-[#332D2F]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔗</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#683846]">
                    {isEditingExistingLink ? 'Edit Link' : 'Add Clickable Link'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Tag a brand, product, restaurant, or guide.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-[#332D2F] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              {/* Highlighted text to display */}
              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1">
                  Text to Display (Only this will be clickable) *
                </label>
                <input
                  type="text"
                  required
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. The Dubai Mall, Nike, or this restaurant"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#332D2F] focus:outline-none focus:ring-2 focus:ring-[#B75B70]"
                  autoFocus
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  💡 Highlight a phrase like &ldquo;The Dubai Mall&rdquo; so only that phrase is clickable.
                </span>
              </div>

              {/* Destination URL */}
              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1">
                  Destination Web Link (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g. thedubaimall.com or https://nike.ae"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:outline-none focus:ring-2 focus:ring-[#B75B70] font-mono"
                />
              </div>

              {/* Open in new tab checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="w-4 h-4 rounded text-[#B75B70] focus:ring-[#B75B70]"
                />
                <span className="text-xs text-[#332D2F] font-medium">
                  Open in a new tab (recommended so visitors stay on your blog)
                </span>
              </label>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                {isEditingExistingLink ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveLink();
                      setShowLinkModal(false);
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1"
                  >
                    <span>🗑️</span>
                    <span>Remove Link</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!linkUrl.trim()}
                    className="btn-primary text-xs px-5 py-2.5 disabled:opacity-50"
                  >
                    {isEditingExistingLink ? 'Update Link ✨' : 'Save Link ✨'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
