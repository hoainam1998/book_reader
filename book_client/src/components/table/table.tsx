/* eslint-disable no-unused-vars */
import {
  CSSProperties,
  Children,
  Fragment,
  ReactElement,
  ReactNode,
  JSX,
  useMemo,
  useCallback,
} from 'react';
import Select from 'components/form/form-control/select/select';
import Pagination from 'components/pagination/pagination';
import Error from 'components/error/error';
import List from 'components/list/list';
import { isSlot } from 'components/slot/slot';
import { clsx } from 'utils';
import './style.scss';

export type Field = {
  key: string;
  label?: string;
  width?: number;
  style?: CSSProperties;
};

type TableProps<T> = {
  fields: Field[];
  children?: ReactNode;
  total: number;
  data: T[];
  emptyMessage: string;
  responsive?: boolean;
  classes?: string;
  onLoad: (pageSize: number, pageNumber: number) => void;
};

type TableCellProps<T> = {
  cells: ReactElement[];
  fields: Field[];
  item: T;
};

function TableCell<T>({ fields, cells, item }: TableCellProps<T>): JSX.Element {
  const childrenList: JSX.Element[] = fields.map(field => {
    const slot: ReactElement | undefined = cells.find(cell => isSlot(field.key, cell));
    const label: string = field.label || field.key;
    return slot
    ? <td data-label={label}>{slot.props.render(item)}</td>
    :<td data-label={label}>{item[field.key as keyof T] as ReactNode}</td>;
  });
  return <>{childrenList.map((children, index) => <Fragment key={index}>{children}</Fragment>)}</>;
}

let pageSize = 10;
let pageNumber = 1;
const options = [
  {
    value: 10,
    label: '10'
  },
  {
    value: 30,
    label: '30'
  },
  {
    value: 50,
    label: '50'
  },
];

function Table<T>({
  fields,
  children,
  data,
  total,
  classes,
  responsive,
  emptyMessage,
  onLoad
}: TableProps<T>): JSX.Element {

  const totalPageNumber = useMemo<number>(() => {
    const pages: number = total / pageSize;
    return Number.isInteger(pages) ? pages : Math.floor(pages) + 1;
  }, [total, pageSize]);

  const pageSizeChange = useCallback((currentPageSize: number): void => {
    pageSize = currentPageSize;
    pageNumber = 1;
    onLoad(pageSize, pageNumber);
  }, []);

  const pageNumberChange = useCallback((currentPageNumber: number): void => {
    pageNumber = currentPageNumber;
    onLoad(pageSize, pageNumber);
  }, []);

  if (total === 0) {
    return (
      <Error image="empty" message={emptyMessage} />
    );
  }

  return (
    <section>
      <div className="table-wrapper">
        <table className={clsx('table', responsive && 'responsive-table', classes)}>
          <colgroup>
            <List<Field> items={fields} render={(field) => (<col width={field.width}/>)} />
          </colgroup>
          <thead>
            <tr>
              <List<Field> items={fields} render={(field) =>
                (<th style={field.style}>{field.label || field.key}</th>)} />
            </tr>
          </thead>
          <tbody>
            <List<T> items={data} render={(item, index) =>
              <tr data-testid={`row-${index}`}>
                <TableCell<T>
                item={item}
                fields={fields}
                cells={Children.toArray(children) as ReactElement[]}
                />
              </tr>
            } />
          </tbody>
        </table>
      </div>
      { totalPageNumber > 0 &&
        <div className="table-footer">
          <Select<number>
            value={pageSize}
            onChange={pageSizeChange}
            options={options}
            name="page-size"
            className="un-grid"
            selectClass="page-size" />
          <Pagination onChange={pageNumberChange} pageNumber={totalPageNumber} />
        </div>
      }
    </section>
  );
}

export default Table;
