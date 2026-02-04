import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import moment from 'moment';
import IconMenu from '../../components/Icons';
import Card from '../../components/Card';
import MineBox from '../../components/MineBox';
import AmountBox from '../../components/AmountBox';
import BetButton from '../../components/BetButton';
import ToggleBox from '../../components/ToggleBox';
import ProfitBox from '../../components/ProfitBox';
import SettingBtn from '../../components/SettingBtn';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import GridIcon from '../../assets/images/grid_icon.svg';
import CricketIcon from '../../assets/images/cricket_icon.svg';
import useStore from '../../useStore';
import { config } from '../../config/global.const';
import './gamemanager.scss';

let loop = 0;

const heading: THTypeInterface[] = [
  {
    key: 'userid',
    value: 'User',
    type: 'text',
    minWidth: '100px',
    width: '10%',
    align: 'start'
  },
  {
    key: 'time',
    value: 'Time',
    type: 'text',
    minWidth: '160px',
    width: '25%',
    align: 'start'
  },
  {
    key: 'bet_amount',
    value: 'BetAmount',
    type: 'text',
    minWidth: '120px',
    width: '15%',
    align: 'start'
  },
  {
    key: 'multiplier',
    value: 'Multiplier',
    type: 'text',
    minWidth: '120px',
    width: '15%',
    align: 'start'
  },
  {
    key: 'payout',
    value: 'Payout',
    type: 'text',
    minWidth: '120px',
    width: '15%',
    align: 'start'
  },
  {
    key: 'status',
    value: 'Status',
    type: 'button',
    minWidth: '100px',
    width: '10%',
    align: 'center'
  }
];
const tableStyle: TStyleInterface = {
  tableMaxHeight: 'max-h-[800px]'
};

const socket = io(config.wwsHost as string);
const GameManager = () => {
  /* common variable and function */
  const { auth, update } = useStore();
  const token = new URLSearchParams(useLocation().search).get('cert');
  const [isLoading, setIsLoading] = useState(false);
  /* variables for game setting */
  const [totalValue, setTotalValue] = useState<number>(Number(auth?.balance));
  const [gridCount, setGridCount] = useState<number>(5);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [turboModeStart, setTurboModeStart] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [mineCount, setMineCount] = useState<number>(3);
  const [gridDataList, setGridDataList] = useState([]);
  const [gridSettingList, setGridSettingList] = useState([
    { label: '3X3', grid: 3, active: false },
    { label: '5X5', grid: 5, active: true },
    { label: '7X7', grid: 7, active: false },
    { label: '9X9', grid: 9, active: false }
  ]);
  /* variables for profit calculate list */
  const [profitCalcList, setProfitCalcList] = useState([]);
  const [profitCalcTextList, setProfitCalcTextList] = useState([]);
  const [currentProfitCalcTextList, setCurrentProfitCalcTextList] = useState([]);
  const [currentProfit, setCurrentProfit] = useState<number>(0);
  const [currentProfitInd, setCurrentProfitInd] = useState<number>(0);
  const [profitCalcPage, setProfitCalcPage] = useState<number>(0);
  const [maxCount, setMaxCount] = useState(8);

  /* variable for save the selected card index in turbo mode */
  const [turboList, setTurboList] = useState([]);
  /* variables for control the modal */
  const [resultModalOpen, setResultModalOpen] = useState<boolean>(false);
  const [settingModalOpen, setSettingModalOpen] = useState<boolean>(false);
  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);
  /* assistant variables for control the game */
  const [loading, setLoading] = useState<boolean>(false);
  const [playStatus, setPlayStatus] = useState<boolean>(false);
  const [cardLoading, setCardLoading] = useState<boolean>(false);
  const [currentTarget, setCurrentTarget] = useState<number>(-1);
  const [btnActionStatus, setBtnActionStatus] = useState<string>('start');
  /* variables for control the table */
  const [historyData, setHistoryData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [historyWay, setHistoryWay] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(10);

  /* function for create or join on room */
  useEffect(() => {
    setIsLoading(true);
    socket.emit('join', { token });

    socket.on(`join-${token}`, (e: any) => {
      update({
        auth: {
          userid: e.userid,
          username: e.username,
          avatar: e.avatar,
          balance: e.balance
        }
      } as StoreObject);
      initializeGridSystem(gridCount);
      setTotalValue(Number(e.balance));
      socket.emit('setProfitCalcList', { userid: e.userid, mineCount, gridCount });
      setIsLoading(false);
    });

    return () => {
      socket.off('join');
      socket.off(`join-${token}`);
    };
    // eslint-disable-next-line
  }, []);
  /* function for set profit calculate list according to mine count, turboMode and grid count */
  useEffect(() => {
    if (loop > 0) {
      setTurboList([]);
      setProfitCalcPage(0);
      setCurrentProfitInd(0);
      initializeGridSystem(gridCount);
      socket.emit('setProfitCalcList', { userid: auth?.userid, mineCount, gridCount });
    }
    return () => {
      socket.off('setProfitCalcList');
    };
    // eslint-disable-next-line
  }, [mineCount, turboMode, gridCount]);
  /* function for initialize cards */
  const initializeGridSystem = (count: number) => {
    let data: any = [];
    for (let e = 0; e < count * count; e++) {
      data.push({ card: '', active: false, turbo: false, mine: false });
    }
    setGridDataList(data);
  };
  /* function for set grid system */
  const setGridSystem = (count: number, ind: number) => {
    if (playStatus) return;
    if (auth) {
      let data = gridSettingList.map((item: any, index: number) => {
        if (index === ind) return { ...item, active: true, mine: null };
        else return { ...item, active: false, mine: null };
      });
      setGridSettingList(data);
      setGridCount(count);
    } else {
      toast.error('Undefined user');
    }
  };
  /* function for submit card */
  const checkMine = (order: number) => {
    console.log(order);
    if (auth) {
      if (turboMode) {
        let grids: any = [...gridDataList];
        let turbos: any = [...turboList];

        if (turbos.indexOf(order) >= 0) {
          grids[order].turbo = false;
          turbos.splice(turbos.indexOf(order), 1);
          if (profitCalcPage > 0) {
            if (currentProfitInd > 1) {
              setCurrentProfitInd((prevState) => prevState - 1);
            } else {
              setCurrentProfitInd(maxCount);
              setProfitCalcPage((prevState) => prevState - 1);
            }
          } else {
            setCurrentProfitInd((prevState) => prevState - 1);
          }
        } else {
          if (turboList.length >= gridCount * gridCount - mineCount) return;
          grids[order].turbo = true;
          turbos.push(order);
          if (currentProfitInd < maxCount) {
            setCurrentProfitInd((prevState) => prevState + 1);
          } else {
            setCurrentProfitInd(1);
            setProfitCalcPage((prevState) => prevState + 1);
          }
        }

        setTurboList(turbos);
        setGridDataList(grids);
        setCurrentTarget(order);
      } else {
        if (!playStatus || cardLoading) return;
        setCardLoading(true);
        setCurrentTarget(order);
        socket.emit('checkMine', { userid: auth?.userid, order, betAmount: betAmount * 100 });
      }
    } else {
      toast.error('Undefined user');
    }
  };
  /* function for initialize when play bet */
  const initializeStartCase = (turboMode: boolean) => {
    if (turboMode && turboList.length === 0) {
      toast.warning('Please select the card');
      
      return false;
    }
    if (turboModeStart) return false;

    if (!turboMode) setCurrentProfitInd(0);
    else setTurboModeStart(true);
    setLoading(true);
    setResultModalOpen(false);
    initializeGridSystem(gridCount);
    setCardLoading(true);
    setCurrentTarget(-1);
    return true;
  };
  /* function for reroud balance */
  const refund = () => {
    if (!isLoading) {
      setIsLoading(true);
      socket.emit('refund', { userid: auth?.userid });
    } else {
      toast.error('Refund is loading...');
    }
  };
  /* function for submit play bet, cancel and cashout */
  const handleBetButton = () => {
    if (loading || cardLoading) return;
    if (auth) {
      switch (btnActionStatus) {
        case 'start':
          if (totalValue - betAmount <= 0) {
            toast.error('Insufficient your balance');
            setCardLoading(false);
            setLoading(false);
            return;
          }
          const status = initializeStartCase(turboMode);
          if (status) {
            setTimeout(() => {
              socket.emit('playBet', {
                userid: auth?.userid,
                betAmount: betAmount * 100,
                gridCount,
                mineCount,
                turboMode,
                turboList,
                profitValue: currentProfit
              });
            }, 500);
          }
          break;
        case 'cancel':
          setLoading(true);
          setTimeout(() => {
            socket.emit('cancelBet', { userid: auth?.userid, betAmount: betAmount * 100 });
          }, 500);
          break;
        case 'cashOut':
          setLoading(true);
          setTimeout(() => {
            socket.emit('cashOut', {
              userid: auth?.userid,
              betAmount: betAmount * 100,
              profitValue:
                profitCalcList[
                  maxCount * profitCalcPage + profitCalcPage > 0
                    ? currentProfitInd > 0
                      ? maxCount * profitCalcPage + currentProfitInd - 1
                      : maxCount * profitCalcPage - 1
                    : currentProfitInd - 1
                ]
            });
          }, 500);
          break;
      }
    } else {
      toast.error('Undefined user');
    }
  };
  /* function for set mint count according to grid count */
  useEffect(() => {
    switch (gridCount) {
      case 3:
        setMineCount(2);
        break;
      case 5:
        setMineCount(3);
        break;
      case 7:
        setMineCount(5);
        break;
      case 9:
        setMineCount(10);
        break;
    }
  }, [gridCount]);
  /* function for get profitCalcTextList according to profit page */
  useEffect(() => {
    setCurrentProfitCalcTextList(profitCalcTextList.slice(maxCount * profitCalcPage, maxCount * (profitCalcPage + 1)));
    // eslint-disable-next-line
  }, [profitCalcPage, maxCount]);
  /* function for get currentProfit according to currentProfitInd */
  useEffect(() => {
    setCurrentProfit(
      profitCalcList[
        maxCount * profitCalcPage + profitCalcPage > 0
          ? currentProfitInd > 0
            ? maxCount * profitCalcPage + currentProfitInd - 1
            : maxCount * profitCalcPage - 1
          : currentProfitInd - 1
      ]
    );
    // eslint-disable-next-line
  }, [currentProfitInd]);
  /* receive from backend side */
  useEffect(() => {
    socket.on(`playBet-${auth?.userid}`, async (e) => {
      if (e.turboMode) {
        let data: any = [...gridDataList];
        // eslint-disable-next-line
        turboList.map((item: number, ind: number) => {
          if (profitCalcList[ind] >= 10) {
            data[item].card = '_win3';
          } else if (profitCalcList[ind] >= 2) {
            data[item].card = '_win2';
          } else {
            data[item].card = '_win1';
          }
          data[item].active = true;
        });
        if (e.mine) {
          // eslint-disable-next-line
          e.gridSystem.map((item: number, ind: number) => {
            if (item) {
              data[ind].card = '_lose';
              data[ind].mine = true;
              data[ind].active = true;
            }
          });
        }
        setGridDataList(data);
        !e.mine && setResultModalOpen(true);
        setLoading(false);
        setCardLoading(false);
        !e.mine ? await sleep(2000) : await sleep(1500);
        setTurboModeStart(false);
        initializeGridSystem(gridCount);
        setResultModalOpen(false);
        setPlayStatus(false);
        setBtnActionStatus('start');
        getHistory();
      } else {
        setLoading(false);
        setCardLoading(false);
        setPlayStatus(true);
        setBtnActionStatus('cancel');
      }
      update({ auth: { ...auth, balance: e.balance } } as StoreObject);
      setTotalValue(Number(e.balance));
    });
    socket.on(`cancelBet-${auth?.userid}`, async (e) => {
      update({ auth: { ...auth, balance: e.balance } } as StoreObject);
      setTotalValue(Number(e.balance));
      setLoading(false);
      setPlayStatus(false);
      setBtnActionStatus('start');
    });
    socket.on(`cashOut-${auth?.userid}`, async (e) => {
      update({ auth: { ...auth, balance: e.balance } } as StoreObject);
      setTotalValue(Number(e.balance));
      setResultModalOpen(true);
      setLoading(false);
      setPlayStatus(false);
      setCardLoading(false);
      setBtnActionStatus('start');
      setTimeout(() => {
        initializeGridSystem(gridCount);
        setCurrentProfitInd(0);
        setProfitCalcPage(0);
        setResultModalOpen(false);
        getHistory();
      }, 2000);
    });
    socket.on(`checkMine-${auth?.userid}`, async (e) => {
      let data: any = [...gridDataList];
      if (e.mine) {
        // eslint-disable-next-line
        e.minePlace.map((item: number) => {
          data[item].card = '_lose';
          data[item].mine = true;
          data[item].active = true;
        });
        setTimeout(() => {
          setCardLoading(false);
          setGridDataList(data);
          setPlayStatus(false);
          setBtnActionStatus('start');
        }, 500);
        setTimeout(() => {
          initializeGridSystem(gridCount);
          setProfitCalcPage(0);
          setCurrentProfitInd(0);
          getHistory();
        }, 2000);
      } else {
        data[e.index].mine = e.mine;
        data[e.index].active = true;
        if (profitCalcList[maxCount * profitCalcPage + currentProfitInd] >= 10) {
          data[e.index].card = '_win3';
        } else if (profitCalcList[maxCount * profitCalcPage + currentProfitInd] >= 2) {
          data[e.index].card = '_win2';
        } else {
          data[e.index].card = '_win1';
        }
        setTimeout(() => {
          setGridDataList(data);
          setCardLoading(false);
          setBtnActionStatus('cashOut');
          if (currentProfitInd < maxCount - 1) {
            setCurrentProfitInd((prevState) => prevState + 1);
          } else {
            setCurrentProfitInd(0);
            setProfitCalcPage((prevState) => prevState + 1);
          }
        }, 500);
      }
    });
    socket.on(`setProfitCalcList-${auth?.userid}`, async (e) => {
      setProfitCalcList(e.profitCalcList);
      let data = e.profitCalcList.map((item: number) => {
        let value: any = item;
        if (value >= 1000 && value < 1000000) {
          value = `${(item / 1000).toFixed(2)}K`;
        } else if (value >= 1000000 && value < 1000000000) {
          value = `${(item / 1000000).toFixed(2)}M`;
        } else if (value >= 1000000000) {
          value = `${(item / 1000000000).toFixed(2)}G`;
        } else {
          value = item;
        }
        return { value: value, active: false };
      });
      setProfitCalcTextList(data);
      setCurrentProfitCalcTextList(data.slice(maxCount * profitCalcPage, maxCount * (profitCalcPage + 1)));
      loop = loop + 1;
    });
    socket.on(`refund-${auth?.userid}`, async (e: any) => {
      update({
        auth: {
          ...auth,
          balance: 0
        }
      } as StoreObject);
      setTotalValue(0);
      toast.success('Balance Refunded');
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = `${process.env.REACT_APP_RECHARGE_URL}`;
      }, 1500);
    });
    socket.on(`insufficient-${auth?.userid}`, async () => {
      update({
        auth: {
          ...auth,
          balance: 0
        }
      } as StoreObject);
      setTotalValue(0);
      setDepositModalOpen(true);
    });
    socket.on(`getHistory-${auth?.userid}`, async (e: any) => {
      let data = e.data.map((item: any) => {
        return {
          userid: item.userid,
          time: moment(new Date(item.date * 1000)).format('MM/DD/YYYY - h:mm:ss a'),
          bet_amount: (item.betAmount / 100).toFixed(2),
          multiplier: item.profit.toFixed(2),
          payout: (item.profitAmount / 100).toFixed(2),
          status: item.profit
        };
      });
      setTotalCount(e.total);
      setHistoryData(data);
    });
    socket.on(`error-${auth?.userid}`, async (e) => {
      toast.error(e);
      initializeStartCase(turboMode);
      setLoading(false);
      setCardLoading(false);
    });
    return () => {
      socket.off(`playBet-${auth?.userid}`);
      socket.off(`cancelBet-${auth?.userid}`);
      socket.off(`cashOut-${auth?.userid}`);
      socket.off(`checkMine-${auth?.userid}`);
      socket.off(`setProfitCalcList-${auth?.userid}`);
      socket.off(`refund-${auth?.userid}`);
      socket.off(`insufficient-${auth?.userid}`);
      socket.off(`getHistory-${auth?.userid}`);
      socket.off(`error-${auth?.userid}`);
    };
    // eslint-disable-next-line
  }, [auth, gridDataList]);

  /* function for get game history */
  const getHistory = () => {
    socket.emit('getHistory', {
      userid: auth?.userid,
      historyWay: historyWay ? 'all' : 'mine',
      currentPage,
      displayCount
    });
  };
  useEffect(() => {
    getHistory();
    // eslint-disable-next-line
  }, [auth, historyWay, currentPage, displayCount]);

  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const getWidth = () => {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  };

  useEffect(() => {
    const setResponsiveness = () => {
      if (getWidth() > 1024) {
        setMaxCount(8);
      } else if (getWidth() < 1024 && getWidth() > 768) {
        setMaxCount(7);
      } else if (getWidth() < 768 && getWidth() > 640) {
        setMaxCount(6);
      } else if (getWidth() < 640) {
        setMaxCount(5);
      }
    };
    setResponsiveness();
    window.addEventListener('resize', setResponsiveness);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="game-management-layout">
        <button className="refund-btn" onClick={refund}>
          <IconMenu icon="Back" size={30} />
          <span>Reback</span>
        </button>
        <div className="game-landscape-top">
          <div className="logo-container" />
          <div className="profit-list-container">
            <div className="history">
              <div
                className="history-inner"
                style={{
                  gridTemplateColumns: `repeat(${currentProfitCalcTextList.length}, minmax(0, 1fr))`
                }}
              >
                {currentProfitCalcTextList.map((item: any, ind: number) => {
                  return (
                    <ProfitBox
                      key={ind}
                      self={ind}
                      value={item.value}
                      turboMode={turboMode}
                      playStatus={playStatus}
                      currentProfit={
                        turboMode
                          ? profitCalcList[
                              maxCount * profitCalcPage + profitCalcPage > 0
                                ? ind > 0
                                  ? maxCount * profitCalcPage + ind
                                  : maxCount * profitCalcPage - 1
                                : ind
                            ]
                          : profitCalcList[maxCount * profitCalcPage + ind]
                      }
                      currentProfitInd={currentProfitInd}
                      profitCalcPage={profitCalcPage}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className="balance-container">
            <label>Balance</label>
            <div className="balance">
              <span>₹{(totalValue / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="game-landscape-content">
          <div className="game-landscape-setting-info flex slg:hidden">
            <div className="game-landscape-setting-info-inner">
              <div className="setting-item">
                <div className="setting-icon">
                  <img src={GridIcon} alt="grid" />
                </div>
                <div className="setting-value">{`${gridCount}X${gridCount}`}</div>
              </div>
              <div className="setting-item">
                <div className="setting-icon">
                  <img src={CricketIcon} alt="cricket" />
                </div>
                <div className="setting-value">{mineCount}</div>
              </div>
            </div>
          </div>
          <div
            className="game-landscape-card-group"
            style={{ gridTemplateColumns: `repeat(${gridCount}, minmax(0, 1fr))` }}
          >
            {gridDataList.map((item: any, ind: number) => {
              return (
                <div key={ind} onClick={() => checkMine(ind)}>
                  <Card
                    card={item.card}
                    turboMode={turboMode}
                    turbo={item.turbo}
                    turboList={turboList}
                    loading={cardLoading}
                    playStatus={playStatus}
                    active={item.active}
                    mine={item.mine}
                    self={ind}
                    currentProfitAmount={betAmount * profitCalcList[maxCount * profitCalcPage + currentProfitInd]}
                    currentTarget={currentTarget}
                  />
                </div>
              );
            })}
          </div>
          <div className="game-landscape-size">
            <div className="game-landscape-size-list">
              {gridSettingList.map((item: any, ind: number) => {
                return (
                  <div
                    key={ind}
                    className={`game-landscape-size-item ${item.active ? '_active !cursor-default' : '_hover'} ${
                      playStatus && !item.active && '_disabled'
                    }`}
                    onClick={() => setGridSystem(item.grid, ind)}
                  >
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="game-landscape-size-title">Grid</div>
          </div>
          <div className="mobile-game-controller">
            <div className="profit-list-container">
              <div className="history">
                <div
                  className="history-inner"
                  style={{
                    gridTemplateColumns: `repeat(${currentProfitCalcTextList.length}, minmax(0, 1fr))`
                  }}
                >
                  {currentProfitCalcTextList.map((item: any, ind: number) => {
                    return (
                      <ProfitBox
                        key={ind}
                        self={ind}
                        value={item.value}
                        turboMode={turboMode}
                        playStatus={playStatus}
                        currentProfit={
                          turboMode
                            ? profitCalcList[
                                maxCount * profitCalcPage + profitCalcPage > 0
                                  ? ind > 0
                                    ? maxCount * profitCalcPage + ind
                                    : maxCount * profitCalcPage - 1
                                  : ind
                              ]
                            : profitCalcList[maxCount * profitCalcPage + ind]
                        }
                        currentProfitInd={currentProfitInd}
                        profitCalcPage={profitCalcPage}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="amount-controller">
              <AmountBox
                isMobile="mobile"
                minLimit={10}
                maxLimit={1000}
                profitAmount={currentProfit}
                value={betAmount}
                setValue={(e: number) => !playStatus && Number(totalValue) - e >= 0 && setBetAmount(e)}
                playStatus={playStatus}
              />
            </div>
            <div className="btn-controller">
              <div>
                <ToggleBox
                  isMobile={true}
                  value={turboMode}
                  setValue={(e: boolean) => !playStatus && setTurboMode(e)}
                  playStatus={playStatus}
                />
              </div>
              <div className="grow" onClick={handleBetButton}>
                <BetButton
                  isMobile={true}
                  profitAmount={profitCalcList.length > 0 && (betAmount * currentProfit).toFixed(2)}
                  turboMode={turboMode}
                  cardLoading={cardLoading}
                  loading={loading}
                  type={btnActionStatus}
                />
              </div>
              <div onClick={() => setSettingModalOpen(true)}>
                <SettingBtn playStatus={playStatus} />
              </div>
            </div>
          </div>
        </div>
        <div className="game-landscape-left">
          <div className="wickets-control-group">
            <label>Wickets</label>
            <div className="mine-control-action">
              <MineBox
                isMobile={false}
                min={1}
                max={gridCount * gridCount - 1}
                value={mineCount}
                setValue={(e: number) => !playStatus && setMineCount(e)}
                playStatus={playStatus}
              />
            </div>
          </div>
          <div className="amount-control-group">
            <label>Bet Amount</label>
            <div className="amount-control-action">
              <AmountBox
                isMobile="desktop"
                minLimit={config.minBetAmount}
                maxLimit={config.maxBetAmout}
                profitAmount={currentProfit}
                value={betAmount}
                setValue={(e: number) => !playStatus && Number(totalValue) - e >= 0 && setBetAmount(e)}
                playStatus={playStatus}
              />
            </div>
          </div>
        </div>
        <div className="game-landscape-right">
          <div className="turbo-control-group">
            <label>Turbo</label>
            <div className="turbo-control-action">
              <ToggleBox
                isMobile={false}
                value={turboMode}
                setValue={(e: boolean) => !playStatus && setTurboMode(e)}
                playStatus={playStatus}
              />
            </div>
          </div>
          <div className="btn-control-action" onClick={handleBetButton}>
            <BetButton
              isMobile={false}
              profitAmount={profitCalcList.length > 0 && (betAmount * currentProfit).toFixed(2)}
              turboMode={turboMode}
              cardLoading={cardLoading}
              loading={loading}
              type={btnActionStatus}
            />
          </div>
        </div>
      </div>
      <div className="game-history-layout">
        <div className="game-play-way-tab">
          <div>
            <button className={!historyWay ? '_active' : ''} onClick={() => setHistoryWay(false)}>
              My Bets
            </button>
            <button className={historyWay ? '_active' : ''} onClick={() => setHistoryWay(true)}>
              All Bets
            </button>
          </div>
        </div>
        <div className="w-[85%] lg:w-[70%]">
          <Table
            data={{
              thead: heading,
              tbody: historyData,
              style: tableStyle
            }}
            totalCount={totalCount}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            displayCount={displayCount}
            setDisplayCount={setDisplayCount}
          />
        </div>
      </div>
      <Modal open={resultModalOpen} setOpen={setResultModalOpen}>
        <div className="game-result-modal">
          <div className={`win_img ${currentProfit >= 10 ? '_win3' : currentProfit >= 2 ? '_win2' : '_win1'}`} />
          <div className="win-info-detail">
            <div className="win-amount">
              <p>₹{(betAmount * currentProfit).toFixed(2)}</p>
              <span>₹{(betAmount * currentProfit).toFixed(2)}</span>
            </div>
            <div className="win-amount-double">
              <p>X{currentProfit}</p>
              <span>X{currentProfit}</span>
            </div>
            <p className="win-text">Multiplier</p>
          </div>
        </div>
      </Modal>
      <Modal open={settingModalOpen} setOpen={setSettingModalOpen}>
        <div className="game-setting-modal">
          <div className="modal-close" onClick={() => setSettingModalOpen(false)}>
            &times;
          </div>
          <div className="game-setting-grid">
            <label>Grid</label>
            <div className="game-setting-grid-options">
              {gridSettingList.map((item: any, ind: number) => {
                return (
                  <div
                    key={ind}
                    className={`setting-grid-btn ${item.active && '_active'}`}
                    onClick={() => setGridSystem(item.grid, ind)}
                  >
                    <div className="setting-grid-btn-inner">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="game-setting-wickets">
            <label>Wickets</label>
            <MineBox
              isMobile={true}
              min={1}
              max={gridCount * gridCount - 1}
              value={mineCount}
              setValue={(e: number) => !playStatus && setMineCount(e)}
              playStatus={playStatus}
            />
          </div>
          <div className="game-setting-amount">
            <label>Bet Amount</label>
            <AmountBox
              isMobile="modal"
              minLimit={10}
              maxLimit={1000}
              profitAmount={currentProfit}
              value={betAmount}
              setValue={(e: number) => !playStatus && Number(totalValue) - e >= 0 && setBetAmount(e)}
              playStatus={playStatus}
            />
          </div>
        </div>
      </Modal>
      <Modal open={depositModalOpen} setOpen={setDepositModalOpen}>
        <div className="game-deposit-modal">
          <div className="modal-close" onClick={() => setDepositModalOpen(false)}>
            &times;
          </div>
          <div>
            <p>Insufficient account balance</p>
            <a href={process.env.REACT_APP_RECHARGE_URL}>{process.env.REACT_APP_RECHARGE_URL}</a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GameManager;
