import { getDataTimekeepings } from '@/services/timekeeping';

const Model = {
  namespace: 'timekeepings',
  state: {
    data: {
      list: [],
      search: '',
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getDataTimekeepings, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
  },
  reducers: {
    save(state, action) {
      return { ...state, data: action.payload };
    },
  },
};
export default Model;
