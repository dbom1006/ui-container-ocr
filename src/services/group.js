import request from '@/utils/request';
import strapi from '@/utils/strapi';
import { GET_PARAMS } from '@/utils/constants';
import { async } from 'q';

export async function addMembers(data) {
  return strapi.request('POST', '/tendergroups/multi', { data });
}

export async function addGroup(params) {
  return strapi.createEntry('groups', params);
}

export async function getGroups(params) {
  return strapi.getEntries('groups', { ...params });
}

export async function getGroupsCount(params) {
  return strapi.getEntryCount('groups', { ...params });
}

export async function removeGroup(id) {
  return strapi.deleteEntry('groups', id);
}

export async function removeMember(id) {
  return strapi.deleteEntry('tendergroups', id);
}

export async function updateGroup(id, params) {
  return strapi.updateEntry('groups', id, params);
}

export async function getTenders(params) {
  return strapi.getEntries('tendergroups', { ...params });
}

export async function getTenderGroupsCount(params) {
  return strapi.getEntryCount('tendergroups', { ...params });
}

export const getGroup = id => strapi.getEntry('groups', id);

export const getGroupDetail = async ({
  pagination = {},
  filter = {},
  sort = {},
  search = '',
  group,
} = {}) => {
  const { pageSize = GET_PARAMS._limit, current = 1 } = pagination;
  const { field = 'createdAt', order = 'desc' } = sort;
  const params = {
    _limit: pageSize,
    _start: (current - 1) * pageSize,
    _sort: `${field}:${order == 'ascend' ? 'asc' : 'desc'}`,
    group,
    ...filter,
  };
  if (search) params._q = search;
  const [tenderGroup, data, total] = await Promise.all([
    getGroup(group),
    getTenders(params),
    getTenderGroupsCount(params),
  ]);
  const list = data.map(x => ({ ...x.tender, tenderGroup: x.id }));
  return {
    tenderGroup,
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

export const getDataGroups = async ({
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
  const [list, total] = await Promise.all([getGroups(params), getGroupsCount(params)]);
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
