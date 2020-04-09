import { getSourceDetail } from '@/services/source';
import { getDataContainers } from '@/services/container';

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
    dataContainer: {
      list: [],
      pagination: {},
      filter: {},
      sort: { field: 'updatedAt', order: 'desc' },
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
    *fetchDataContainer({ payload }, { call, put }) {
      const response = yield call(getDataContainers, payload);
      yield put({
        type: 'saveDataContainer',
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
    saveDataContainer(state, action) {
      return { ...state, dataContainer: action.payload };
    },
  },
};
export default Model;
