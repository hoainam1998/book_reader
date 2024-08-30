import { JSX, useEffect, useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import Quill, { QuillOptions } from 'quill';
import Button from 'components/button/button';
import store, { CurrentStoreType } from '../storage';
import { saveIntroduceFile, getBookIntroduceFile } from '../fetcher';
import useModalNavigation from '../useModalNavigation';
import './style.scss';
const { subscribe, getSnapshot, updateStep, updateData, updateConditionNavigate } = store;

let quill: Quill | null = null;
const editSelector: string = 'book-introduce-editor';

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

function BookIntroduce(): JSX.Element {
  const [haveContent, setHaveContent] = useState<boolean>(false);
  const { data }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);
  useModalNavigation();

  const name: string = useMemo((): string => {
    if (data && Object.hasOwn(data, 'name')) {
      return data.name.replace(/\s/, '-');
    }
    return '';
  }, [data]);

  const onSave = useCallback((): void => {
    const html: string = quill!.getSemanticHTML();
    const json: string = JSON.stringify(quill!.getContents());

    saveIntroduceFile(html, json, name, data.bookId).then(() => {
      getBookIntroduceFile(data.bookId).then((res) => {
        updateData({ ...data, introduce: res.data.book.detail.introduce });
        updateStep(3);
      });
    });
  }, [name]);

  const quillCreator = useCallback((): void => {
    quill = new Quill(`#${editSelector}`, options);
    quill.on('editor-change', (): void => {
      if (quill?.getLength() === 1) {
        setHaveContent(false);
      } else {
        setHaveContent(true);
      }
    });
  }, []);

  useEffect(() => {
    updateConditionNavigate(haveContent);
  }, [haveContent]);

  // useEffect called twice time by strict mode,
  // therefore create a flag to detect quill was set up or was not.
  let isSetupQuill: boolean = false;
  useEffect(() => {
    if (!isSetupQuill) {
      quillCreator();
      isSetupQuill = true;
    }
    return () => {
      quill = null;
    };
  }, []);

  return (
    <section className="book-introduce">
      <p className="file-name">
        <span className="field-name">File name</span>
        {name}
      </p>
      <p className="horizontal-line" />
      <div id={editSelector} className="book-introduce-editor" />
      <Button
        onClick={onSave}
        disabled={!haveContent}
        className="introduce-save-btn"
        variant="submit">
          Save
      </Button>
    </section>
  );
}

export default BookIntroduce;
