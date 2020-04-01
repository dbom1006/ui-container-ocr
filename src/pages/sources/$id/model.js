import { getSourceDetail } from '@/services/source';

const Model = {
  namespace: 'sourceDetail',
  state: {
    current: {},
    staffings: {
      list: [],
      pagination: {},
      filter: {},
      sort: {},
      search: '',
    },
  },
  effects: {
    *fetchCurrent({ payload }, { call, put }) {
      const response = yield call(getSourceDetail, payload);
      yield put({
        type: 'saveCurrent',
        payload: response,
      });
    },
  },
  reducers: {
    saveCurrent(state, action) {
      return { ...state, current: action.payload || {} };
    },
    saveStaffings(state, action) {
      return { ...state, staffings: action.payload || {} };
    },
  },
};
export default Model;
