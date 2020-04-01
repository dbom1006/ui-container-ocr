export const API_URL =
  process.env.NODE_ENV !== 'production' ? 'http://localhost:1337' : "https://api-container.herokuapp.com";
export const GOOGLE_API_KEY = 'AIzaSyAiUwQhd0Sj2QyWksF_3orIERSjtq_fjFU';
export const ICON_FONT_URL = '//at.alicdn.com/t/font_1409694_ygg2lkaipkn.js';
export const HOME_URL = window.location.origin;
export const GET_PARAMS = {
  _limit: 10,
  _start: 0,
  _sort: 'createdAt:desc',
};
