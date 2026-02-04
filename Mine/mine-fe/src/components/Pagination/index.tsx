import React, { useEffect } from 'react';
import Select from '../Select';
import IconMenu from '../../components/Icons';
import './pagination.scss';

const rowCountType: TPaginationInterface[] = [
  { name: '10 Row', key: 10 },
  { name: '25 Row', key: 25 },
  { name: '50 Row', key: 50 },
  { name: '100 Row', key: 100 }
];

interface IProps {
  totalCount: number;
  currentPage: number;
  setCurrentPage: Function;
  displayCount: number;
  setDisplayCount: Function;
}

const Pagination = (props: IProps) => {
  const previous = () => {
    props.setCurrentPage(props.currentPage - 1);
  };

  const next = () => {
    props.setCurrentPage(props.currentPage + 1);
  };

  useEffect(() => {
    props.setCurrentPage(1);
    // eslint-disable-next-line
  }, [props.displayCount]);

  return (
    <div className="pagination-container">
      <div className="display-count">
        <p>Rows per page:</p>
        <div className="h-[40px] w-[140px] relative z-20">
          <Select
            selectedKey={10}
            values={rowCountType?.filter((item: TPaginationInterface) => {
              return { name: item.name, key: item.key };
            })}
            classname="item px-[20px] py-[10px]"
            onChange={(value: any) => props.setDisplayCount(value.key)}
          />
        </div>
      </div>
      <div className="display-direction">
        <p className="tracking-[0.3em]">{`Page ${props.currentPage} of ${Math.ceil(
          props.totalCount / props.displayCount
        )}`}</p>
        <div>
          <button
            className={props.currentPage > 1 ? 'enable' : 'disable'}
            onClick={previous}
            disabled={props.currentPage > 1 ? false : true}
          >
            <IconMenu icon="LeftArr" size={8} />
          </button>
          <button
            className={props.currentPage >= Math.ceil(props.totalCount / props.displayCount) ? 'disable' : 'enable'}
            onClick={next}
            disabled={props.currentPage >= Math.ceil(props.totalCount / props.displayCount) ? true : false}
          >
            <IconMenu icon="RightArr" size={8} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
