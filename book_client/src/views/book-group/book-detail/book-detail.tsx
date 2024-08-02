import { JSX } from 'react';
import Grid, { GridItem } from 'components/grid/grid';
import Calendar from 'components/calendar/calendar';
import './style.scss';

function BookDetail(): JSX.Element {
  return (
    <Grid lg={4} sm={4} md={3}>
      <GridItem>
        <Calendar value={new Date(new Date().setDate(3))} label="Publish day" name="publish-day" />
      </GridItem>
      <GridItem>col.2</GridItem>
      <GridItem>col.3</GridItem>
      <GridItem>col.4</GridItem>
    </Grid>
  );
}

export default BookDetail;
