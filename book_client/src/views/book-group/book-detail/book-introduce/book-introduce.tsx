import { JSX, useEffect, useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import Quill, { QuillOptions } from 'quill';
import { Op } from 'quill/core';
import Button from 'components/button/button';
import store, { CurrentStoreType } from '../storage';
import { saveIntroduceFile, getBookIntroduceFile } from '../fetcher';
import useModalNavigation from '../useModalNavigation';
import useComponentDidMount, { HaveLoadedFnType } from 'hooks/useComponentDidMount';
import './style.scss';
const { subscribe, getSnapshot, updateStep, updateDisableStep, updateData, updateConditionNavigate } = store;

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

/**
 * Convert file path string list to promise of options. Those options will be content of quill.
 *
 * @param {string} filePath - file path to json file contain options
 * @returns {Promise<Op[]>} - promise options.
 */
const getContent = (filePath: string): Promise<Op[]> => {
  return fetch(`${process.env.BASE_URL}/${filePath}`)
    .then(res => res.json())
    .then(json => json);
};

function BookIntroduce(): JSX.Element {
  const [quill, setQuill] = useState<Quill | null>(null);
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
        updateDisableStep(false);
      });
    });
  }, [quill]);

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

  useEffect(() => {
    updateConditionNavigate(haveContent);
  }, [haveContent]);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        quillCreator();
      }
    }
  });

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (data && data.introduce && !haveFetched()) {
        getContent(data.introduce.json)
          .then(json => quill?.setContents(json));
      }
    };
  }, [quill, data]);

  return (
    <section className="book-introduce">
      <p className="file-name">
        <span className="field-name">File name</span>
        {name}
      </p>
      <p className="horizontal-line" />
      <div id={editSelector} className="book-introduce-editor" />
      {quill &&
        <Button
          onClick={onSave}
          disabled={!haveContent}
          className="introduce-save-btn"
          variant="submit">
            Save
        </Button>
      }
    </section>
  );
}

export default BookIntroduce;
