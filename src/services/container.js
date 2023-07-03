/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-underscore-dangle */
import strapi from '@/utils/strapi';
import { GET_PARAMS } from '@/utils/constants';
import { convertFilter } from '@/utils/utils';

export async function getContainers(params) {
  return strapi.getEntries('checkins', {...params,
  populate:{
    source: true,
    image: true,
    employee:{
      populate:['avatar']
    }
  }});
}

export async function getContainersCount(params) {
  return strapi.getEntryCount('checkins', params);
}

export async function createContainer(params) {
  return strapi.createEntry('checkins', params);
}

export async function updateContainer(id, params) {
  return strapi.updateEntry('checkins', id, params);
}

export async function removeContainer(id) {
  return strapi.deleteEntry('checkins', id);
}

export const getContainerDetail = id => strapi.getEntry('checkins', id);

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
  const res = await getContainers(params);
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
