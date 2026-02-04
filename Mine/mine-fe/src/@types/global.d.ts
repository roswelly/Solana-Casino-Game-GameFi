declare module '.jpg';
declare module '.svg';
declare module '.png';
declare module 'url:*' {
  export default string;
}
declare module '*.svg' {
  const content: any;
  export default content;
}
declare interface StoreObject {
  auth?: {
    userid: string;
    username: string;
    avatar: string;
    balance: number;
  };
  loading: boolean;
}
/* table header type */
declare interface THTypeInterface {
  key: string;
  value: string;
  type?: string;
  minWidth?: string;
  width?: string;
  align?: string;
  style?: string;
}
/* table style type */
declare interface TStyleInterface {
  tableMaxHeight: string;
}
/* table pagination display count type */
declare interface TPaginationInterface {
  name: string;
  key: number;
}
/* dropdown data types */
declare interface DropDownInterface {
  name: string;
  key: string;
}
