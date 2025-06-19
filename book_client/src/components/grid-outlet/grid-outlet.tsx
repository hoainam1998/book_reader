import { Outlet } from 'react-router-dom';
import GridLayout from 'components/re-use/grid-layout/grid-layout';

function GridOutlet() {
  return (
    <GridLayout>
      <Outlet />
    </GridLayout>
  );
}

export default GridOutlet;
