/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-underscore-dangle */
import strapi from '@/utils/strapi';
import { GET_PARAMS, API_URL, OCR_URL } from '@/utils/constants';
import { convertFilter } from '@/utils/utils';
import { func } from 'prop-types';

export async function getSources(params) {
  return strapi.getEntries('sources', params);
}

export async function getSourcesCount(params) {
  return strapi.getEntryCount('sources', params);
}

export async function createSource({ files, ...params }) {
  const form = new FormData();
  form.append('data', JSON.stringify(params));
  if (files && files[0]) form.append('files.file', files[0].originFileObj, files[0].name);
  return strapi.request('post', `/sources`, {
    data: form,
  });
}
export const runWorker = async id => strapi.request('post', `${API_URL}/sources/${id}/run`);
export const stopWorker = async ({ id }) => {
  try {
    await fetch(`${OCR_URL}/stop/${id}`, { mode: 'no-cors' });
  } catch (e) {}
  return strapi.request('post', `${API_URL}/sources/${id}/stop`);
};

export async function updateSource(id, params) {
  return strapi.updateEntry('sources', id, params);
}

export async function removeSource(id) {
  return strapi.deleteEntry('sources', id);
}

export const getSourceDetail = id => strapi.getEntry('sources', id);

export const getDataSources = async ({
  pagination = {},
  filter = {},
  sort = {},
  search = '',
} = {}) => {
  const { pageSize = GET_PARAMS._limit, current = 1 } = pagination;
  const { field = 'createdAt', order = 'desc' } = sort;
  const params = {
    _limit: pageSize,
    _start: (current - 1) * pageSize,
    _sort: `${field}:${order == 'ascend' ? 'asc' : 'desc'}`,
    ...convertFilter(filter),
  };
  if (search) params._q = search;
  const res = await getSources(params);
  return {
    list: res.data,
    pagination: {
      total: res.meta.pagination.total,
      pageSize: params._limit,
      current: params._start / params._limit + 1,
    },
    filter,
    sort,
    search,
  };
};
