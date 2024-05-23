import Editor from '@monaco-editor/react'

export function MonacoJsonEditor({givenJson, givenOnChange, givenRef}: {givenJson: string, givenOnChange: (newJson: string | undefined) => void, givenRef: any}) {

  function handleEditorDidMount(editor : any, monaco : any) {
    givenRef.current = editor;
  }

  function handleEditorChange(value: string | undefined, event: any) {
    givenOnChange(value);
  }

  return (
    <Editor
      theme='vs-dark'
      options={{
        wordWrap : "wordWrapColumn",
        wordWrapColumn: 100,
        tabSize: 2,
      }}
      defaultLanguage="json"
      defaultValue={givenJson}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
    />
  )
}