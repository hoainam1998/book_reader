import Table from 'components/table/table';
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
      </Table>
    </>
  );
}

export default CategoryList;
