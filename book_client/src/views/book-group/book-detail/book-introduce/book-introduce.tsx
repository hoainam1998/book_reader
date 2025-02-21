import { JSX, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { AxiosResponse } from 'axios';
import { Op } from 'quill/core';
import Button from 'components/button/button';
import store, { CurrentStoreType } from 'store/book';
import { saveIntroduceFile, getBookIntroduceFile, updateIntroduceFile } from '../fetcher';
import useModalNavigation from 'hooks/useModalNavigation';
import useComponentDidMount, { HaveLoadedFnType } from 'hooks/useComponentDidMount';
import useInitEditor from 'hooks/useInitEditor';
import { getJsonFileContent } from 'utils';
import './style.scss';

const {
  subscribe,
  getSnapshot,
  updateStep,
  updateDisableStep,
  updateData,
  updateConditionNavigate,
  deleteAllStorage
} = store;

const editSelector: string = 'book-introduce-editor';

function BookIntroduce(): JSX.Element {
  const { data }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);
  useModalNavigation({ onLeaveAction: deleteAllStorage });
  const { quill, haveContent } = useInitEditor(editSelector);

  const name: string = useMemo((): string => {
    if (data && Object.hasOwn(data, 'name')) {
      return data.name.replace(/\s/, '-');
    }
    return '';
  }, [data]);

  const onSave = useCallback((): void => {
    const html: string = quill!.getSemanticHTML();
    const json: string = JSON.stringify(quill!.getContents());
    let promiseResult: Promise<AxiosResponse>;

    if (data.introduce) {
      promiseResult = updateIntroduceFile(html, json, name, data.bookId);
    } else {
      promiseResult = saveIntroduceFile(html, json, name, data.bookId);
    }

    promiseResult.then(() => {
      getBookIntroduceFile(data.bookId).then((res) => {
        updateData({ ...data, introduce: res.data });
        updateStep(3);
        updateDisableStep(false);
      });
    });
  }, [quill]);

  useEffect(() => {
    updateConditionNavigate(haveContent);
  }, [haveContent]);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (data && data.introduce && !haveFetched() && quill) {
        getJsonFileContent<Op[]>(data.introduce.json)
          .then(json => quill.setContents(json));
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
      { quill &&
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
