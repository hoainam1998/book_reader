import { JSX } from 'react';
import Grid, { GridItem } from 'components/grid/grid';
import './style.scss';

function BookDetail(): JSX.Element {
  return (
    <Grid lg={2} sm={4} md={3}>
      <GridItem sm={4} md={6} lg={11}>col.1</GridItem>
      <GridItem lg={12} md={6} sm={4}>col.2</GridItem>
      <GridItem>col.3</GridItem>
      <GridItem>col.4</GridItem>
    </Grid>
  );
}

export default BookDetail;
