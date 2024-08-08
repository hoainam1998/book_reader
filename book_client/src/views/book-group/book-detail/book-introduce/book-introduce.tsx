import { JSX, useEffect } from 'react';
import Quill, { QuillOptions } from 'quill';
import Button from 'components/button/button';
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
    console.log(quill?.getSemanticHTML());
  };

  return (
    <>
      <section className="book-introduce" id="book-introduce" />
      <Button onClick={onSave}>Save</Button>
    </>
  );
}

export default BookIntroduce;
