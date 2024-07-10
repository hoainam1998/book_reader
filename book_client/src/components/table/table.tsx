import { CSSProperties, Children, Fragment, ReactElement, ReactNode, JSX } from 'react';
import Select from 'components/form/form-control/select/select';
import Pagination from 'components/pagination/pagination';
import { isSlot } from 'components/slot/slot';
import './style.scss';

type Field = {
  key: string;
  style?: CSSProperties;
};

type TableProps = {
  fields: Field[];
  children?: ReactNode;
  data: { [key: string]: any }[];
};

type TableCellProps = {
  cells: ReactElement[];
  fields: Field[];
  item: { [key: string]: any };
};

function TableCell({ fields, cells, item }: TableCellProps): JSX.Element {
  const childrenList = fields.map(field => {
    const slot: ReactElement | undefined = cells.find(cell => isSlot(field.key, cell));
    return slot ? <td>{slot.props.render(item)}</td> : <td>{item[field.key]}</td>;
  });
  return <>{childrenList.map((children, index) => <Fragment key={index}>{children}</Fragment>)}</>;
}

function Table({ fields, children, data }: TableProps): JSX.Element {
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

  return (
    <section>
      <table className="table">
        <colgroup>
          { fields.map((field, index) => (<col key={index} style={field.style}/>)) }
        </colgroup>
        <thead>
          <tr>
            { fields.map((field, index) => (<th key={index}>{field.key}</th>)) }
          </tr>
        </thead>
        <tbody>
          {
            data.map((item, index) => (
              <tr key={index}>
                <TableCell item={item} fields={fields} cells={Children.toArray(children) as ReactElement[]} />
              </tr>
            ))
          }
        </tbody>
      </table>
      <div className="table-footer">
        <Select options={options} name="page-size" classes="page-size" />
        <Pagination pageNumber={21}/>
      </div>
    </section>
  );
}

export default Table;
