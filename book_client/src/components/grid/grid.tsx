import './style.scss';

type GridProps = {
  sm?: number;
  md?: number;
  lg?: number;
  children: React.ReactElement;
};

function Grid({ sm, md, lg, children }: GridProps): JSX.Element {
  return (
    <section className="grid col-row-2 col-row-md-3">
      <div></div>
      <div></div>
      <div className="col-11"></div>
      <div></div>
    </section>
  );
}

export default Grid;
