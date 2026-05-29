import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Italic,
  Underline,
  Essentials,
  Paragraph,
  List,
  Undo,
  Heading,
  Subscript,
  Superscript,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function RichTextEditorClient({ value, onChange, placeholder }: Props) {
  return (
    <div className="ck-editor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          licenseKey: "GPL",
          plugins: [Essentials, Bold, Italic, Underline, Paragraph, List, Undo, Heading, Subscript, Superscript],
          toolbar: {
            items: [
              "heading", "|",
              "bold", "italic", "underline", "subscript", "superscript", "|",
              "numberedList", "bulletedList", "|",
              "undo", "redo",
            ],
          },
          placeholder: placeholder ?? "Sual mətni (HTML dəstəklənir)...",
        }}
        onChange={(_, editor) => onChange(editor.getData())}
      />
    </div>
  );
}
