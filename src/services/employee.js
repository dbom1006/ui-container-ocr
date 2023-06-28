/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-underscore-dangle */
import strapi from '@/utils/strapi';
import { GET_PARAMS, API_URL, OCR_URL } from '@/utils/constants';
import { convertFilter } from '@/utils/utils';

export async function getEmployees(params) {
  return strapi.getEntries('employees', params);
}

export async function createEmployee(params) {
  const form = new FormData();
  form.append('data', JSON.stringify(params));
  return strapi.request('post', `/employees`, {
    data: form,
  });
}

export async function updateEmployee(employeeId, params) {
  const form = new FormData();
  form.append('data', JSON.stringify(params));
  return strapi.request('put', `/employees/${employeeId}`, {
    data: form,
  });
}

export const getDataEmployees = async ({
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
    sort: `${field}:${order == 'ascend' ? 'asc' : 'desc'}`,
    ...convertFilter(filter),
  };
  if (search) params._q = search;
  const res = await getEmployees(params);
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
