import { useMatches } from 'react-router-dom';
import './style.scss';

function CategoryList(): JSX.Element {
  const matches = useMatches();
  console.log(matches);
  return (
    <>CategoryList</>
  );
}

export default CategoryList;
