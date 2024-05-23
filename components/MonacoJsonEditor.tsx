import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes';

export function MonacoJsonEditor({givenJson, givenOnChange, givenRef}: {givenJson: string, givenOnChange: (newJson: string | undefined) => void, givenRef: any}) {

  const { theme } = useTheme();

  function handleEditorDidMount(editor : any, monaco : any) {
    givenRef.current = editor;
  }

  function handleEditorChange(value: string | undefined, event: any) {
    givenOnChange(value);
  }



  return (
    <Editor
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      options={{
        wordWrap : "wordWrapColumn",
        wordWrapColumn: 100,
        tabSize: 2,
      }}
      className='border  rounded-md'
      defaultLanguage="json"
      defaultValue={givenJson}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
    />
  )
}