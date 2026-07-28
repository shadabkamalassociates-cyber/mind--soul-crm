import { useRef, useEffect, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Link2Off,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Trash2
} from 'lucide-react'

export default function RichTextEditor({ value, onChange, placeholder = 'Write your content here...' }) {
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  })

  // Synchronize value with editor innerHTML
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  // Track cursor formats
  const checkSelection = () => {
    if (document.activeElement === editorRef.current) {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      })
    }
  }

  useEffect(() => {
    document.addEventListener('selectionchange', checkSelection)
    return () => document.removeEventListener('selectionchange', checkSelection)
  }, [])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCmd = (command, val = null) => {
    document.execCommand(command, false, val)
    handleInput()
    checkSelection()
  }

  const handleToolbarAction = (e, command, val = null) => {
    e.preventDefault() // CRITICAL: Prevent stealing focus from contentEditable
    editorRef.current?.focus()
    execCmd(command, val)
  }

  const addLink = (e) => {
    e.preventDefault()
    editorRef.current?.focus()
    const url = prompt('Enter the link URL (e.g. https://example.com):')
    if (url) {
      execCmd('createLink', url)
    }
  }

  return (
    <div className="rounded-xl border border-dusk-100 bg-canvas overflow-hidden focus-within:border-dusk-500 focus-within:bg-white transition-all shadow-sm">
      {/* Localized Styles to override any CSS reset defaults */}
      <style>{`
        .rich-editor-content h1 {
          font-size: 1.8em !important;
          font-weight: 700 !important;
          margin-top: 0.6em !important;
          margin-bottom: 0.4em !important;
          display: block !important;
          line-height: 1.25 !important;
        }
        .rich-editor-content h2 {
          font-size: 1.4em !important;
          font-weight: 600 !important;
          margin-top: 0.6em !important;
          margin-bottom: 0.4em !important;
          display: block !important;
          line-height: 1.3 !important;
        }
        .rich-editor-content p {
          margin-bottom: 0.6em !important;
          line-height: 1.5 !important;
        }
        .rich-editor-content ul {
          list-style-type: disc !important;
          padding-left: 2rem !important;
          margin-top: 0.5em !important;
          margin-bottom: 0.5em !important;
          display: block !important;
        }
        .rich-editor-content ol {
          list-style-type: decimal !important;
          padding-left: 2rem !important;
          margin-top: 0.5em !important;
          margin-bottom: 0.5em !important;
          display: block !important;
        }
        .rich-editor-content li {
          display: list-item !important;
          margin-bottom: 0.25em !important;
        }
        .rich-editor-content a {
          color: #2563eb !important;
          text-decoration: underline !important;
        }
        .rich-editor-content:empty::before {
          content: attr(placeholder);
          color: rgba(30, 41, 59, 0.4);
          pointer-events: none;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-dusk-50 bg-canvas-alt px-2 py-1.5 select-none">
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'bold')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeFormats.bold
              ? 'bg-dusk-700 text-white'
              : 'text-ink-soft hover:bg-dusk-100 hover:text-ink'
          }`}
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'italic')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeFormats.italic
              ? 'bg-dusk-700 text-white'
              : 'text-ink-soft hover:bg-dusk-100 hover:text-ink'
          }`}
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'underline')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeFormats.underline
              ? 'bg-dusk-700 text-white'
              : 'text-ink-soft hover:bg-dusk-100 hover:text-ink'
          }`}
          title="Underline"
        >
          <Underline size={15} />
        </button>

        <div className="h-4 w-[1px] bg-dusk-200 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'H1')}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Heading 1"
        >
          <Heading1 size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'H2')}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'formatBlock', 'P')}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Normal Paragraph"
        >
          <Type size={15} />
        </button>

        <div className="h-4 w-[1px] bg-dusk-200 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'justifyLeft')}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Align Left"
        >
          <AlignLeft size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'justifyCenter')}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Align Center"
        >
          <AlignCenter size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'justifyRight')}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Align Right"
        >
          <AlignRight size={15} />
        </button>

        <div className="h-4 w-[1px] bg-dusk-200 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'insertUnorderedList')}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Bullet List"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'insertOrderedList')}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </button>

        <div className="h-4 w-[1px] bg-dusk-200 mx-1" />

        <button
          type="button"
          onMouseDown={addLink}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Add Link"
        >
          <LinkIcon size={15} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'unlink')}
          className="p-1.5 rounded-lg text-ink-soft hover:bg-dusk-100 hover:text-ink transition-colors cursor-pointer"
          title="Remove Link"
        >
          <Link2Off size={15} />
        </button>
        
        <button
          type="button"
          onMouseDown={(e) => handleToolbarAction(e, 'removeFormat')}
          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer ml-auto"
          title="Clear Formatting"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={checkSelection}
        className="rich-editor-content min-h-[220px] max-h-[400px] overflow-y-auto px-4 py-3 text-sm text-ink focus:outline-none bg-white leading-relaxed"
        placeholder={placeholder}
        style={{ outline: 'none' }}
      />
    </div>
  )
}
