/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-underscore-dangle */
import strapi from '@/utils/strapi';
import { GET_PARAMS } from '@/utils/constants';
import { convertFilter } from '@/utils/utils';

export async function getContainers(params) {
  return strapi.getEntries('containers', params);
}

export async function getContainersCount(params) {
  return strapi.getEntryCount('containers', params);
}

export async function createContainer(params) {
  return strapi.createEntry('containers', params);
}

export async function updateContainer(id, params) {
  return strapi.updateEntry('containers', id, params);
}

export async function removeContainer(id) {
  return strapi.deleteEntry('containers', id);
}

export const getContainerDetail = id => strapi.getEntry('containers', id);

export const getDataContainers = async ({
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
  const [list, total] = await Promise.all([getContainers(params), getContainersCount(params)]);
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
