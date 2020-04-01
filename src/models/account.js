import { parse, stringify } from 'qs';
import { routerRedux } from 'dva/router';
import { setAuthority, removeAuthority } from '@/utils/authority';
import {
  accountLogin,
  changePassword,
  registerCustomer,
  forgotPassword,
  resetPassword,
  updateProfile,
} from '@/services/account';
import { getCompanyDetail } from '@/services/company';
import strapi from '@/utils/strapi';

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}
const Model = {
  namespace: 'account',
  state: {
    status: undefined,
    changePassword: undefined,
    company: {},
  },
  effects: {
    *logout(_, { put }) {
      removeAuthority();
      strapi.clearToken();
      const { redirect } = getPageQuery(); // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          }),
        );
      }
    },
    *login({ payload, callback }, { call, put }) {
      const response = yield call(accountLogin, payload);
      if (response.jwt && response.user) {
        setAuthority('admin');
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);

            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        window.location.href = '/';
      } else callback && callback(response.user && response.user.type);
    },
    *register({ payload, callback }, { call, put }) {
      const user = yield call(registerCustomer, payload);
      if (user && user.type == 'customer') {
        setAuthority('admin');
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);

            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        window.location.href = '/';
      } else callback && callback();
    },
    *changePassword({ payload, callback }, { call, put }) {
      const response = yield call(changePassword, payload);
      if (response && callback) {
        callback();
      }
    },
    *updateProfile({ payload, callback }, { call, put }) {
      const { id, idCompany, ...params } = payload;
      const response = yield call(updateProfile, id, idCompany, params);
      yield put({
        type: 'user/fetchCurrent',
      });
      if (response && callback) {
        callback();
      }
    },
    *forgotPassword({ payload, callback }, { call, put }) {
      const response = yield call(forgotPassword, payload);
      if (response) {
        callback && callback('success');
      }
    },
    *resetPassword({ payload, callback }, { call, put }) {
      const response = yield call(resetPassword, payload);
      if (response) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
          }),
        );
      }
    },
    *fetchCompany({ payload }, { call, put }) {
      const response = yield call(getCompanyDetail, payload);
      if (response) {
        yield put({
          type: 'saveCompany',
          payload: response,
        });
      }
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      return { ...state, status: payload.status, type: payload.type };
    },
    changePasswordStatus(state, { payload }) {
      return { ...state, changePassword: payload };
    },
    saveCompany(state, action) {
      return { ...state, company: action.payload || {} };
    },
  },
};
export default Model;
