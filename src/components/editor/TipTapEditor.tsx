'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/Button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { useState } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border border-gray-300 rounded-md dark:border-gray-700',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setIsLinkModalOpen(false);
    }
  };

  const addImage = () => {
    const url = window.prompt('URL de l\'image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-md dark:border-gray-700">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-800' : ''}
        >
          <Bold size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-100 dark:bg-gray-800' : ''}
        >
          <Italic size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-800' : ''}
        >
          <List size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-100 dark:bg-gray-800' : ''}
        >
          <ListOrdered size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-100 dark:bg-gray-800' : ''}
        >
          <Quote size={16} />
        </Button>
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLinkModalOpen(true)}
          className={editor.isActive('link') ? 'bg-gray-100 dark:bg-gray-800' : ''}
        >
          <LinkIcon size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon size={16} />
        </Button>
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo size={16} />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} placeholder={placeholder} />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Ajouter un lien</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsLinkModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={addLink}>
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
