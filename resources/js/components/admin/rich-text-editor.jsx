import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo2, Redo2 } from "lucide-react";

export function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value || "",
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    immediatelyRender: false,
  });

  if (!editor) return <div className="h-56 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />;

  const button = (label, action, active = false, icon) => <button type="button" title={label} onClick={action} className={`grid size-8 place-items-center rounded-lg ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{icon}</button>;

  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">{button("Bold", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), <Bold className="size-4" />)}{button("Italic", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), <Italic className="size-4" />)}{button("Bullet list", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), <List className="size-4" />)}{button("Numbered list", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"), <ListOrdered className="size-4" />)}{button("Add link", () => { const url = window.prompt("URL"); if (url) editor.chain().focus().setLink({ href: url }).run(); }, false, <LinkIcon className="size-4" />)}{button("Undo", () => editor.chain().focus().undo().run(), false, <Undo2 className="size-4" />)}{button("Redo", () => editor.chain().focus().redo().run(), false, <Redo2 className="size-4" />)}</div><EditorContent editor={editor} className="prose prose-sm max-w-none min-h-56 p-4 focus-within:outline-none [&_.ProseMirror]:min-h-48 [&_.ProseMirror]:outline-none" /></div>;
}
