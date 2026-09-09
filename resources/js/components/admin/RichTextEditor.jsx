import { useRef } from "react";
import { usePage } from "@inertiajs/react";
import { Editor } from "@tinymce/tinymce-react";

/**
 * RichTextEditor — TinyMCE wrapper for admin forms.
 *
 * Props:
 *  value       {string}   – HTML content controlled externally
 *  onChange    {function} – called with the new HTML string on every change
 *  placeholder {string}   – shown when editor is empty (via content_style trick)
 *  height      {number}   – editor height in px (default 280)
 */
export function RichTextEditor({ value = "", onChange, placeholder = "Start typing…", height = 280 }) {
  const editorRef = useRef(null);
  const { app_settings } = usePage().props;
  const apiKey = app_settings?.general?.tinymceApiKey || "no-api-key";

  return (
    <Editor
      apiKey={apiKey}
      onInit={(_, editor) => (editorRef.current = editor)}
      value={value}
      onEditorChange={(content) => onChange?.(content)}
      init={{
        height,
        menubar: false,
        branding: false,
        promotion: false,
        resize: false,
        statusbar: false,
        skin: "oxide",
        content_css: "default",
        placeholder,
        plugins: [
          "advlist", "autolink", "lists", "link", "charmap",
          "searchreplace", "visualblocks", "insertdatetime",
          "table", "wordcount",
        ],
        toolbar:
          "blocks | bold italic underline strikethrough | " +
          "bullist numlist | link | blockquote | " +
          "alignleft aligncenter alignright | removeformat",
        block_formats: "Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4",
        content_style: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            color: #1e293b;
            line-height: 1.6;
            padding: 12px 16px;
            margin: 0;
          }
          body:empty:before {
            content: attr(data-placeholder);
            color: #94a3b8;
          }
          p { margin: 0 0 0.75em; }
          a { color: #0f172a; }
        `,
        // Clean up pasted content
        paste_as_text: false,
        paste_block_drop: false,
        smart_paste: true,
      }}
    />
  );
}
