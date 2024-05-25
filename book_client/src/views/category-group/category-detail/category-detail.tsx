import { useMatches } from 'react-router-dom';

function CategoryDetail(): JSX.Element {
  const matches = useMatches();
  console.log(matches);
  return (
    <>category detail</>
  );
}

export default CategoryDetail;
