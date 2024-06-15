import Input from 'components/form-control/input/input';
import useForm from 'hooks/useForm';
import { required } from 'utils';

const state = {
  categoryName: '',
  avatar: '',
};

const rules = {
  categoryName: { required },
  avatar: { required },
};

function CategoryDetail(): JSX.Element {
  const { categoryName, avatar, handleSubmit, validate } = useForm(state, rules);
  console.log(validate);

  return (
    <>
      <Input name="category_name" type="text" {...categoryName} />
      <Input name="avatar" type="text" {...avatar} />
      <button onClick={handleSubmit}>submit</button>
    </>
  );
}

export default CategoryDetail;
