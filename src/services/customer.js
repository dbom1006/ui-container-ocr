import request from '@/utils/request';
import strapi from '@/utils/strapi';
import { GET_PARAMS } from '@/utils/constants';

export async function getCustomers(params) {
  return strapi.getEntries('users/customers', { ...params, type: 'customer' });
}

export async function getCustomersCount(params) {
  return strapi.getEntryCount('users', { ...params, type: 'customer' });
}

export async function removeCustomer(id) {
  return strapi.deleteEntry('users', id);
}
export async function updateCustomer(id, params) {
  return strapi.updateEntry('users', id, params);
}

export const getCustomerDetail = id => strapi.getEntry('users', id);

export const getDataCustomers = async ({
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
  const [list, total] = await Promise.all([getCustomers(params), getCustomersCount(params)]);
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
