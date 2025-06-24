import { JSX } from 'react';
import Book from 'components/re-use/book/book';
import List from 'components/list/list';
import { BookPropsType } from 'interfaces';

type ListBookPropsType = {
  items: BookPropsType[];
};

function Books({ items }: ListBookPropsType): JSX.Element {
  return (
    <List<BookPropsType> items={items} render={(item) => <Book {...item} />} />
  );
}

export default Books;
