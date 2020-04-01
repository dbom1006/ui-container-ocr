/* eslint-disable no-underscore-dangle */
import strapi from '@/utils/strapi';
import { GET_PARAMS } from '@/utils/constants';

export async function getTenders(params) {
  return strapi.getEntries('users', { ...params, type: 'tender' });
}

export async function getTendersCount(params) {
  return strapi.getEntryCount('users', { ...params, type: 'tender' });
}

export async function removeTender(id) {
  return strapi.deleteEntry('users', id);
}
export async function updateTender(id, params) {
  return strapi.updateEntry('users', id, params);
}

export const getTenderDetail = id => strapi.getEntry('users', id);

export const getDataTenders = async ({
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
    ...filter,
  };
  if (search) params._q = search;
  const [list, total] = await Promise.all([getTenders(params), getTendersCount(params)]);
  return {
    list,
    pagination: {
      total,
      pageSize: params._limit,
      current: params._start / params._limit + 1,
    },
    filter,
    sort,
    search,
  };
};
