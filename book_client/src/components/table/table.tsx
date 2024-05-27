import { CSSProperties, ReactNode } from 'react';
import './style.scss';

type Field = {
  key: string;
  style?: CSSProperties;
};

type TableProps = {
  fields: Field[];
  children: ReactNode;
};

function Table({ fields, children }: TableProps): JSX.Element {
  return (
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
      {children}
      </tbody>
    </table>
  );
}

export default Table;
