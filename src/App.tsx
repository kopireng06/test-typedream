import "./App.css";

import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from "slate-react";

import {
  BaseEditor,
  createEditor,
  Descendant,
  Editor,
  Element,
  Transforms,
} from "slate";
import { useMemo, useState } from "react";

const typeElements = ["paragraph", "h1", "h2", "h3", "h4"] as const;
const typeMarks = ["bold", "italic", "underline", "code"] as const;
type TypeElement = typeof typeElements[number];
type TypeMark = typeof typeMarks[number];

type CustomElement = {
  src?: string;
  type?: TypeElement;
  children: CustomText[];
};
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

type MarkButtonProps = {
  name: TypeMark;
};

type BlockButtonProps = {
  name: TypeElement;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

function renderElement(props: RenderElementProps) {
  const { element, children, attributes } = props;

  switch (element.type) {
    case "paragraph":
      return (
        <p style={{ fontWeight: 400 }} {...attributes}>
          {children}
        </p>
      );
    case "h1":
      return (
        <h1 style={{ fontWeight: 400 }} {...attributes}>
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2 style={{ fontWeight: 400 }} {...attributes}>
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 style={{ fontWeight: 400 }} {...attributes}>
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4 style={{ fontWeight: 400 }} {...attributes}>
          {children}
        </h4>
      );
    default:
      return <span style={{ fontWeight: 400 }} {...props} />;
  }
}

function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
  let el = <>{children}</>;

  if (leaf.bold) {
    el = <strong style={{ fontWeight: 600 }}>{el}</strong>;
  }

  if (leaf.code) {
    el = <code style={{ background: "#dce7e8" }}>{el}</code>;
  }

  if (leaf.italic) {
    el = <em>{el}</em>;
  }

  if (leaf.underline) {
    el = <u>{el}</u>;
  }

  return <span {...attributes}>{el}</span>;
}

function MarkButton({ name }: MarkButtonProps) {
  const editor = useSlate();

  return (
    <button
      style={{
        cursor: "pointer",
        background: "#1dd3e0",
        border: 0,
        color: isMarkActive(editor, name) ? "black" : "white",
        minWidth: "30px",
        minHeight: "30px",
        borderRadius: "5px",
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, name);
      }}
    >
      {name}
    </button>
  );
}

function isBlockActive(editor: BaseEditor & ReactEditor, format: TypeElement) {
  const { selection } = editor;

  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: selection,
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n["type"] === format,
    })
  );

  return !!match;
}

function toggleBlock(editor: BaseEditor & ReactEditor, format: TypeElement) {
  if (isBlockActive(editor, format)) {
    Transforms.setNodes(editor, { type: "paragraph" });
  } else {
    Transforms.setNodes(editor, { type: format });
  }
}

function BlockButton({ name }: BlockButtonProps) {
  const editor = useSlate();

  return (
    <button
      style={{
        cursor: "pointer",
        background: "#1dd3e0",
        border: 0,
        color: isBlockActive(editor, name) ? "black" : "white",
        minWidth: "30px",
        minHeight: "30px",
        borderRadius: "5px",
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, name);
      }}
    >
      {name}
    </button>
  );
}

function Toolbar() {
  return (
    <div
      style={{
        display: "flex",
        padding: "10px",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      {typeElements.map((typeElement) => (
        <BlockButton name={typeElement} key={typeElement} />
      ))}
      {typeMarks.map((typeMark) => (
        <MarkButton key={typeMark} name={typeMark} />
      ))}
    </div>
  );
}

function isMarkActive(editor: BaseEditor & ReactEditor, format: TypeMark) {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}

function toggleMark(editor: BaseEditor & ReactEditor, format: TypeMark) {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

function App() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [slateValue, setSlateValue] = useState<Descendant[]>([
    {
      type: "h1",
      children: [{ text: "Halo My Name is Naufal", italic: true }],
    },
  ]);

  return (
    <Slate editor={editor} value={slateValue} onChange={setSlateValue}>
      <Toolbar />
      <div
        style={{
          maxWidth: "90%",
          margin: "20px auto",
          padding: "20px",
          boxShadow: "rgb(49 53 59 / 12%) 0px 1px 6px 0px",
          borderRadius: "10px",
          minHeight: "calc(100vh - 150px)",
        }}
      >
        <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
      </div>
    </Slate>
  );
}

export default App;
