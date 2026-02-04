import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

export const now = () => Math.round(+new Date().getTime() / 1e3);

const appKey = process.env.REACT_APP_APP_TOKEN_KEY || '';

const getStore = (initialState: StoreObject) => {
  const _state = initialState as { [key: string]: any };
  try {
    let buf = window.localStorage.getItem(appKey);
    if (buf) {
      const json = JSON.parse(buf);
      for (let k in json) {
        if (_state[k] !== undefined) {
          _state[k] = json[k] as any;
        }
      }
    }
    buf = window.sessionStorage.getItem(appKey);
    if (buf) {
      const json = JSON.parse(buf);
      for (let k in json) {
        if (_state[k] !== undefined) {
          _state[k] = json[k] as any;
        }
      }
    }
    _state.loading = false;
  } catch (err) {
    console.log(err);
  }
  return _state;
};

const setStore = (state: any) => {
  let json = {} as any;
  try {
    let buf = window.localStorage.getItem(appKey);
    if (buf) json = JSON.parse(buf);
  } catch (error) {}
  window.localStorage.setItem(appKey, JSON.stringify({ ...json, ...state }));
};

const setSessionStore = (state: any) => {
  let json = {} as any;
  try {
    let buf = window.sessionStorage.getItem(appKey);
    if (buf) json = JSON.parse(buf);
  } catch (error) {}
  window.sessionStorage.setItem(appKey, JSON.stringify({ ...json, ...state }));
};

const initialState: StoreObject = {
  auth: {
    userid: '',
    username: '',
    avatar: '',
    balance: 0
  },
  loading: false
};

export const slice = createSlice({
  name: 'store',
  initialState: getStore(initialState),
  reducers: {
    update: (state: any, action: any) => {
      for (const k in action.payload) {
        if (state[k] === undefined) new Error(`undefined store key ${k}`);
        state[k] = action.payload[k];
      }
      setStore(action.payload);
    },
    updateSession: (state: any, action: any) => {
      for (const k in action.payload) {
        if (state[k] === undefined) new Error(`undefined store key ${k}`);
        state[k] = action.payload[k];
      }
      setSessionStore(action.payload);
    },
    destroy: () => {
      window.localStorage.removeItem(appKey);
      window.sessionStorage.removeItem(appKey);
    }
  }
});

const useStore = () => {
  const G = useSelector((state: StoreObject) => state);
  const dispatch = useDispatch();
  const update = (payload: Partial<StoreObject>) => dispatch(slice.actions.update(payload as any));
  const updateSession = (payload: Partial<StoreObject>) => dispatch(slice.actions.updateSession(payload as any));
  const destroy = (payload: Partial<StoreObject>) => dispatch(slice.actions.destroy(payload as any));

  return {
    ...G,
    update,
    updateSession,
    destroy
  };
};

export default useStore;
