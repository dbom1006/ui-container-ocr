import { getDataContainers } from '@/services/container';

const Model = {
  namespace: 'containers',
  state: {
    data: {
      list: [],
      pagination: {},
      filter: {},
      sort: { field: 'updatedAt', order: 'desc' },
      search: '',
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getDataContainers, payload);
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
