import React from 'react';
import Pagination from '../Pagination';
import './table.scss';

interface TableInterface {
  thead: THTypeInterface[];
  tbody: any;
  style: TStyleInterface;
}

interface IProps {
  data: TableInterface;
  action?: any;
  totalCount: number;
  setCurrentPage: Function;
  currentPage: number;
  setDisplayCount: Function;
  displayCount: number;
}

const Table = (props: IProps) => {
  return (
    <>
      <div className="table-container">
        <div className="table">
          <div className="thead">
            <div className="tr-group">
              {props.data.thead.map((row: THTypeInterface, ind: number) => {
                return (
                  <div
                    key={ind}
                    className="th-item"
                    style={{
                      width: `${row?.width}`,
                      minWidth: `${row?.minWidth}`,
                      justifyContent: `${row?.align}`
                    }}
                  >
                    {row?.value}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={`tbody ${props?.data?.style?.tableMaxHeight || 'max-h-[800px]'}`}>
            {props.data.tbody.map((item: any, ind: number) => {
              return (
                <div key={ind} className="tr-group">
                  {props.data.thead.map((row: THTypeInterface, index: number) => (
                    <div
                      key={[ind, index].join('-')}
                      className="td-item"
                      style={{
                        width: `${row?.width}`,
                        minWidth: `${row?.minWidth}`,
                        justifyContent: `${row?.align}`
                      }}
                    >
                      {row.type === 'button' ? (
                        <button
                          className={
                            item[row?.key] > 1 && item[row?.key] < 2
                              ? 'bg-blue'
                              : item[row?.key] > 2 && item[row?.key] < 10
                              ? 'bg-green'
                              : item[row?.key] > 10
                              ? 'bg-yellow'
                              : 'bg-gray'
                          }
                        >
                          {item[row?.key] > 1 ? 'Win' : 'Loss'}
                        </button>
                      ) : (
                        item[row?.key]
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mobile-table-container">
        <div className="mobile-table">
          {props.data.tbody?.map((item: any, ind: number) => {
            return (
              <div key={ind} className="mobile-tr-group">
                {props.data.thead.map((row: THTypeInterface, index: number) => {
                  return (
                    <div key={index} className="mobile-td-item">
                      {row.type === 'text' && <label>{row?.value} : </label>}
                      {row.type === 'button' ? (
                        <button
                          className={
                            item[row?.key] > 1 && item[row?.key] < 2
                              ? 'bg-blue'
                              : item[row?.key] > 2 && item[row?.key] < 10
                              ? 'bg-green'
                              : item[row?.key] > 10
                              ? 'bg-yellow'
                              : 'bg-gray'
                          }
                        >
                          {item[row?.key] > 1 ? 'Win' : 'Loss'}
                        </button>
                      ) : (
                        item[row?.key]
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="pagination">
        <div className="borderline"></div>
        <Pagination
          totalCount={props.totalCount}
          currentPage={props.currentPage}
          setCurrentPage={props.setCurrentPage}
          displayCount={props?.displayCount}
          setDisplayCount={props?.setDisplayCount}
        />
      </div>
    </>
  );
};

export default Table;
