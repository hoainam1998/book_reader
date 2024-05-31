import Table from 'components/table/table';
import Slot from 'components/slot/slot';
import './style.scss';

function CategoryList(): JSX.Element {
  const fields = [
    {
      key: 'avatar',
    },
    {
      key: 'name'
    }
  ];

  const data = [
    {
      avatar: 'avatar',
      name: 'name1'
    },
    {
      name: 'name2'
    }
  ];

  return (
    <>
      <Table fields={fields} data={data}>
        <Slot name="avatar" render={(slotProp) => <span style={{ color: 'red' }}>{slotProp.avatar}</span>} />
      </Table>
    </>
  );
}

export default CategoryList;
