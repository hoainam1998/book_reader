import { CSSProperties, ReactNode } from 'react';
import Select from 'components/select/select';
import Slot from 'components/slot/slot';
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
  const options = [
    {
      value: 'volvo',
      label: 'Volvo'
    },
    {
      value: 'mercedes',
      label: 'Mercedes'
    }
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
        {children}
        </tbody>
      </table>
      <Select options={options}>
        <Slot name="default" render={(prop) =>
        <option value={prop.value} style={{color: 'red'}}>{prop.label}</option>} />
      </Select>
    </section>
  );
}

export default Table;
