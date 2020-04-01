import request from '@/utils/request';
import strapi from '@/utils/strapi';
import { GET_PARAMS } from '@/utils/constants';

export async function getLocations(params) {
  return strapi.getEntries('locations', params);
}

export async function getLocationsCount(params) {
  return strapi.getEntryCount('locations', params);
}

export async function getMembers(params) {
  return strapi.getEntries('members', params);
}

export async function getMembersCount(params) {
  return strapi.getEntryCount('members', params);
}

export async function getContacts(params) {
  return strapi.getEntries('contacts', params);
}

export async function getContactsCount(params) {
  return strapi.getEntryCount('contacts', params);
}
export async function addContact(params) {
  return strapi.createEntry('contacts', params);
}

export async function addLocation(params) {
  return strapi.createEntry('locations', params);
}
export async function updateLocation(id, params) {
  return strapi.updateEntry('locations', id, params);
}
export async function removeLocation(id) {
  return strapi.deleteEntry('locations', id);
}

export async function addMember(params) {
  return strapi.createEntry('members', params);
}
export async function updateMember(id, params) {
  return strapi.updateEntry('members', id, params);
}
export async function removeMember(id) {
  return strapi.deleteEntry('members', id);
}

export async function updateCompany(id, params) {
  return strapi.updateEntry('companies', id, params);
}
export const getCompanyDetail = id => strapi.getEntry('companies', id);

export const getAccountPayment = id => strapi.getEntry('accountpayments', id);

export const updateAccountPayment = (id, params) => strapi.updateEntry('accountpayments/company', id, params);

export const addAccountPayment = params => strapi.createEntry('accountpayments/company', params);

export const getDataLocations = async ({
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
  const [list, total] = await Promise.all([getLocations(params), getLocationsCount(params)]);
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
export const getDataMembers = async ({
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
  const [list, total] = await Promise.all([getMembers(params), getMembersCount(params)]);
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
