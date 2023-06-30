/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-underscore-dangle */
import strapi from '@/utils/strapi';

export async function getTimekeepings(params) {
  return strapi.getEntries('timekeepings', params);
}
export const getDataTimekeepings = async ({ date = '' } = {}) => {
  const res = await getTimekeepings({ date });
  return {
    list: res,
  };
};
