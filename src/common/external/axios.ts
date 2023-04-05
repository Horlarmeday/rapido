import axios from 'axios';
import { BadRequestException, Logger } from '@nestjs/common';
import { SUCCESS } from '../../core/constants';

type AxiosConfig = {
  headers?: { Authorization?: string; 'content-type'?: string } & {
    [x: string]: string | string[] | number | null;
  };
  auth?: { username: string; password: string };
};

export const post = async (
  url: string,
  data = {},
  { headers, auth }: AxiosConfig,
) => {
  const logger = new Logger();
  try {
    const response = await axios.post(url, data, { headers, auth });
    return {
      status: SUCCESS,
      data: response.data,
      statusCode: response.status,
    };
  } catch (e) {
    logger.error(`An error occurred ${e?.response?.data?.message}`);
    logger.error(`An error occurred ${e?.message}`);
    throw new BadRequestException(e.message);
  }
};

export const get = async (url: string, headers, params = {}) => {
  const logger = new Logger();
  try {
    const response = await axios.get(url, { headers, params });
    return {
      status: SUCCESS,
      data: response.data,
      statusCode: response.status,
    };
  } catch (e) {
    logger.error(`error`, e);
    logger.error(`An error occurred ${e?.message}`);
    throw new BadRequestException(e.message);
  }
};

export const put = async (
  url: string,
  data = {},
  { headers, auth }: AxiosConfig,
) => {
  const logger = new Logger();
  try {
    const response = await axios.put(url, data, { headers, auth });
    return {
      status: SUCCESS,
      data: response.data,
      statusCode: response.status,
    };
  } catch (e) {
    logger.error(`An error occurred ${e?.response?.data?.message}`);
    logger.error(`An error occurred ${e?.message}`);
    throw new BadRequestException(e.message);
  }
};
