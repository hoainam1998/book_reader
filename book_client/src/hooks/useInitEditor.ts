import Quill, { QuillOptions } from 'quill';
import { useCallback, useState } from 'react';
import useComponentDidMount, { HaveLoadedFnType } from './useComponentDidMount';

const options: QuillOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['link', 'image', 'video'],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }]
    ]
  },
  placeholder: 'Please enter book introduce information ...',
  theme: 'snow'
};

function useInitEditor(editSelector: string) {
  const [quill, setQuill] = useState<Quill | null>(null);
  const [haveContent, setHaveContent] = useState<boolean>(false);

  const quillCreator = useCallback((): void => {
    const quillInstance = new Quill(`#${editSelector}`, options);
    quillInstance.on('editor-change', (): void => {
      if (quillInstance?.getLength() === 1) {
        setHaveContent(false);
      } else {
        setHaveContent(true);
      }
    });
    setQuill(quillInstance);
  }, []);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        quillCreator();
      }
    };
  });

  return {
    quill,
    haveContent
  };
}

export default useInitEditor;
