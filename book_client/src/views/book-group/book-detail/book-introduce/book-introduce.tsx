import { JSX, useEffect } from 'react';
import Quill, { QuillOptions } from 'quill';
import Button from 'components/button/button';
import { BookService, RequestBody } from 'services';
import './style.scss';

let quill: Quill | null = null;

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
  useEffect(() => {
    if (!quill) {
      quill = new Quill('#book-introduce', options);
    }
  }, []);

  const onSave = (): void => {
    const body: RequestBody = {
      query: 'mutation BookMutation($introduce: BookIntroduceInput) { book { saveIntroduce(introduce: $introduce) { message } }}',
      html: quill?.getSemanticHTML(),
      fileName: 'book 1',
    };
    BookService.graphql('/save-introduce', body);
  };

  return (
    <>
      <section className="book-introduce" id="book-introduce" />
      <Button onClick={onSave}>Save</Button>
    </>
  );
}

export default BookIntroduce;
