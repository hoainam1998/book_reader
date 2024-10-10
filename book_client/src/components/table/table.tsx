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
import { isSlot } from 'components/slot/slot';
import './style.scss';

export type Field = {
  key: string;
  label?: string;
  width?: number;
  style?: CSSProperties;
};

type TableProps = {
  fields: Field[];
  children?: ReactNode;
  total: number;
  data: { [key: string]: any }[];
  onLoad: (pageSize: number, pageNumber: number) => void;
};

type TableCellProps = {
  cells: ReactElement[];
  fields: Field[];
  item: { [key: string]: any };
};

function TableCell({ fields, cells, item }: TableCellProps): JSX.Element {
  const childrenList: JSX.Element[] = fields.map(field => {
    const slot: ReactElement | undefined = cells.find(cell => isSlot(field.key, cell));
    return slot ? <td>{slot.props.render(item)}</td> : <td>{item[field.key]}</td>;
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

function Table({ fields, children, data, total, onLoad }: TableProps): JSX.Element {

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

  return (
    <section>
      <div className="category-table">
        <table className="table">
          <colgroup>
            { fields.map((field, index) => (<col key={index} width={field.width}/>)) }
          </colgroup>
          <thead>
            <tr>
              { fields.map((field, index) => (<th key={index} style={field.style}>{field.label || field.key}</th>)) }
            </tr>
          </thead>
          <tbody>
            {
              data.map((item, index) => (
                <tr key={index} data-testid={`row-${index}`}>
                  <TableCell item={item} fields={fields} cells={Children.toArray(children) as ReactElement[]} />
                </tr>
              ))
            }
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
            selectClass="page-size" />
          <Pagination onChange={pageNumberChange} pageNumber={totalPageNumber} />
        </div>
      }
    </section>
  );
}

export default Table;
