/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-underscore-dangle */
import strapi from '@/utils/strapi';

export async function getDataBoxes(params) {
  return strapi.getEntries('dashboard/boxes', params);
}
