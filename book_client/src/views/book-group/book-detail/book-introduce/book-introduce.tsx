import { ChangeEvent, JSX, useEffect, useState, useCallback } from 'react';
import Quill, { QuillOptions } from 'quill';
import Button from 'components/button/button';
import Input from 'components/form/form-control/input/input';
import { BookService, RequestBody } from 'services';
import './style.scss';

let quill: Quill | null = null;
const editSelector: string = 'book-introduce-editor';

const options: QuillOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['link', 'image', 'video'],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
    ]
  },
  placeholder: 'Please enter book introduce information ...',
  theme: 'snow'
};

function BookIntroduce(): JSX.Element {
  const [haveEdit, setHaveEdit] = useState<boolean>(false);
  const [haveContent, setHaveContent] = useState<boolean>(false);

  useEffect(() => {
    if (!quill && haveEdit) {
      quill = new Quill(`#${editSelector}`, options);

      quill.on('editor-change', () => {
        if (quill?.getLength() === 1) {
          setHaveContent(false);
        } else {
          setHaveContent(true);
        }
      });
    }
  }, [haveEdit]);

  const onSave = useCallback((): void => {
    const body: RequestBody = {
      query: 'mutation BookMutation($introduce: BookIntroduceInput) { book { saveIntroduce(introduce: $introduce) { message }}}',
      html: quill?.getSemanticHTML(),
      fileName: 'book 1',
    };
    BookService.graphql('/save-introduce', body);
  }, []);

  const fileChanged = useCallback(<T,>(event: ChangeEvent<T | HTMLInputElement>): void => {
    const files: FileList | null = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('introduce', files[0]);
      setHaveContent(true);
    } else {
      setHaveContent(false);
    }
  }, [haveContent]);

  return (
    <section className="book-introduce">
      <p className="note">*Note: I must select a exist file or create new file to switch the next step.</p>
      <Input
        type="file"
        accept=".html"
        name="introduce"
        label="Introduce file"
        className="introduce-wrapper"
        labelClass="introduce-label"
        onChange={fileChanged} />
      <p className="horizontal-line" />
      <Button onClick={() => setHaveEdit(true)} className="edit-btn" variant="primary">Edit</Button>
      <div id={editSelector} className="book-introduce-editor" />
      <Button onClick={onSave} disabled={!haveContent} className="introduce-save-btn" variant="submit">Save</Button>
    </section>
  );
}

export default BookIntroduce;
