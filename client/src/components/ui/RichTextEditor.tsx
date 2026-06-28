import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
  Sigma,
} from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

interface ToolbarButtonProps {
  icon: typeof Bold;
  action: () => void;
  isActive?: boolean;
  label: string;
}

function ToolbarButton({ icon: Icon, action, isActive, label }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={action}
      title={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        isActive
          ? 'bg-primary/20 text-primary'
          : 'text-text-muted hover:bg-surface-2 hover:text-white',
      )}
    >
      <Icon size={16} />
    </button>
  );
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Metninizi yazın…',
  className,
  minHeight = 120,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      TextStyle,
      Color,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose-editor',
        style: `min-height: ${minHeight}px`,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertMath = useCallback(() => {
    if (!editor) return;
    const latex = window.prompt('LaTeX formülü girin (örn: \\frac{1}{2})');
    if (!latex) return;
    editor.chain().focus().insertContent(` $${latex}$ `).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={cn('rounded-xl border border-border bg-surface-2 overflow-hidden', className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
        <ToolbarButton
          icon={Bold}
          action={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          label="Kalın"
        />
        <ToolbarButton
          icon={Italic}
          action={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          label="İtalik"
        />
        <ToolbarButton
          icon={UnderlineIcon}
          action={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          label="Altı çizili"
        />
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          icon={LinkIcon}
          action={setLink}
          isActive={editor.isActive('link')}
          label="Link"
        />
        <ToolbarButton icon={Sigma} action={insertMath} label="Matematik formülü" />
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          icon={List}
          action={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          label="Madde listesi"
        />
        <ToolbarButton
          icon={ListOrdered}
          action={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          label="Numaralı liste"
        />
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          icon={Undo}
          action={() => editor.chain().focus().undo().run()}
          label="Geri al"
        />
        <ToolbarButton
          icon={Redo}
          action={() => editor.chain().focus().redo().run()}
          label="Yinele"
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export type { Editor };
