import request from '@/utils/request';
import strapi from '@/utils/strapi';
import { GET_PARAMS } from '@/utils/constants';

export async function addToRoster(data) {
  return strapi.request('POST', '/hiredtenders/roster', { data });
}

export async function fetchTender({ pagination = {}, filter = {}, sort = {}, search = '' } = {}) {
  const { pageSize = GET_PARAMS._limit, current = 1 } = pagination;
  const { field = 'createdAt', order = 'desc' } = sort;
  const params = {
    _limit: pageSize,
    _start: (current - 1) * pageSize,
    _sort: `${field}:${order == 'ascend' ? 'asc' : 'desc'}`,
    ...filter,
  };
  if (search) params._q = search;
  const list = await strapi.request('GET', '/users/browse', { params });
  const total = 10;
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
}

export async function getPastTenders({
  pagination = {},
  filter = {},
  sort = {},
  search = '',
} = {}) {
  const { pageSize = GET_PARAMS._limit, current = 1 } = pagination;
  const { field = 'createdAt', order = 'desc' } = sort;
  const params = {
    _limit: pageSize,
    _start: (current - 1) * pageSize,
    _sort: `${field}:${order == 'ascend' ? 'asc' : 'desc'}`,
    ...filter,
  };
  if (search) params._q = search;
  const list = await strapi.getEntries('hiredtenders', { ...params });
  const total = 10;
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
}

export async function updatePastTender(data) {
  return strapi.request('PUT', '/hiredtenders/update', { data });
}
