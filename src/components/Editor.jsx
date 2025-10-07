import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { ACTION } from "../../Actions";

const Editor = ({ socketRef, roomID, oncodeChange }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const isRemoteChange = useRef(false);

 useEffect(() => {
  if (!editorRef.current) return;

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged && !isRemoteChange.current) {
      const code = update.state.doc.toString();
      oncodeChange(code);
      socketRef.current?.emit(ACTION.CODE_CHANGE, { roomID, code });
    }
  });

  const state = EditorState.create({
    doc: "// Start coding here...",
    extensions: [basicSetup, javascript(), oneDark, updateListener],
  });

  const view = new EditorView({ state, parent: editorRef.current });
  viewRef.current = view;

  // ✅ Single listener for all remote changes (including SYNC_CODE)
  socketRef.current?.on(ACTION.CODE_CHANGE, ({ code }) => {
    if (!code) return;
    const currentCode = view.state.doc.toString();
    if (code !== currentCode) {
      isRemoteChange.current = true;
      view.dispatch({
        changes: { from: 0, to: currentCode.length, insert: code },
      });
      isRemoteChange.current = false;
    }
  });

  return () => {
    socketRef.current?.off(ACTION.CODE_CHANGE);
    view.destroy();
  };
}, [socketRef, roomID]);


  return (
    <div
      ref={editorRef}
      style={{
        minHeight: "100%",
        fontSize: "20px",
        lineHeight: "1.6",
        paddingTop: "20px",
      }}
    />
  );
};

export default Editor;
