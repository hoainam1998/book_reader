import Input from 'components/form-control/input/input';
import useForm from 'hooks/useForm';

const state = {
  categoryName: '',
  avatar: '',
};

const rules = {
  categoryName: { required: () => true },
  avatar: { required: () => true },
};

function CategoryDetail(): JSX.Element {
  const { categoryName, avatar } = useForm(state, rules);

  return (
    <>
      <Input name="category_name" type="text" {...categoryName} />
      <Input name="avatar" type="text" {...avatar} />
    </>
  );
}

export default CategoryDetail;
