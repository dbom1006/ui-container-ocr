/* eslint-disable no-underscore-dangle */
import strapi from '@/utils/strapi';
import { GET_PARAMS } from '@/utils/constants';
import { convertFilter } from '@/utils/utils';

export async function getEvents(params) {
  return strapi.getEntries('events', params);
}

export async function getEventsCount(params) {
  return strapi.getEntryCount('events', params);
}

export async function createEvent(params) {
  return strapi.createEntry('events', params);
}

export async function updateEvent(id, params) {
  return strapi.updateEntry('events', id, params);
}

export async function createJob(params) {
  return strapi.createEntry('jobs', params);
}

export async function updateJob(id, params) {
  return strapi.updateEntry('jobs', id, params);
}

export async function deleteJob(id) {
  return strapi.deleteEntry('jobs', id);
}

export async function removeEvent(id) {
  return strapi.deleteEntry('events', id);
}

export const getEventDetail = id => strapi.getEntry('events', id);

export const getDataEvents = async ({
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
  const [list, total] = await Promise.all([getEvents(params), getEventsCount(params)]);
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
