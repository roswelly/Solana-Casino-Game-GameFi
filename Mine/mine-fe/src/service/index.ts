import axios from 'axios';
import { config } from '../config/global.const';

export const getRequest = async (url: string) => {
  try {
    return await axios
      .get(config.serverHost + url, {
        headers: {
          Authorization: `Bearer ${config.tokenString}` || null,
          accept: '*/*'
        }
      })
      .then((response: any) => response.data);
  } catch (err) {
    console.log(err);
  }
};

export const postRequest = async (url: string, data: any) => {
  try {
    return await axios
      .post(config.serverHost + url, JSON.stringify(data), {
        headers: {
          Authorization: `Bearer ${config.tokenString}` || null,
          accept: '*/*',
          'Content-Type': 'application/json'
        }
      })
      .then((response: any) => response.data);
  } catch (err) {
    console.log(err);
  }
};

export const putRequest = async (url: string, id: string, data: any) => {
  try {
    return await axios
      .put(config.serverHost + url + '?id=' + id, JSON.stringify(data), {
        headers: {
          Authorization: `Bearer ${config.tokenString}` || null,
          accept: '*/*',
          'Content-Type': 'application/json'
        }
      })
      .then((response: any) => response.data);
  } catch (err) {
    console.log(err);
  }
};

export const uploadRequest = async (url: string, file: any) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    return await axios
      .post(config.serverHost + url, formData, {
        headers: {
          Authorization: `Bearer ${config.tokenString}` || null,
          accept: '*/*',
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((response: any) => response.data);
  } catch (err) {
    console.log(err);
  }
};

export const deleteRequest = async (url: string, id: string, data: any) => {
  try {
    return await axios
      .delete(config.serverHost + url + '?id=' + id, {
        headers: {
          Authorization: `Bearer ${config.tokenString}` || null,
          accept: '*/*',
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
      })
      .then((response: any) => response.data);
  } catch (err) {
    console.log(err);
  }
};
