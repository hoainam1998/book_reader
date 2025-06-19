import { Fragment, JSX } from 'react';
import Book from 'components/re-use/book/book';
import { stringRandom as id } from 'utils';

const items: JSX.Element[] = [
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />,
  <Book />
];

function AllBooks(): JSX.Element {
  return (
    <>
    {
      items.map((item: JSX.Element) => {
        return (
          <Fragment key={id()}>
            {item}
          </Fragment>
        );
      })
    }
    </>
  );
}

export default AllBooks;
