import { getDataSources, createSource, runWorker } from '@/services/source';

const SourcesModel = {
  namespace: 'sources',
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
      const response = yield call(getDataSources, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(createSource, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: response,
        });
        callback && callback();
      }
    },
    *runWorker({ payload, callback }, { call, put }) {
      const response = yield call(runWorker, payload);
      if (response) {
        callback && callback();
      }
    },
  },
  reducers: {
    save(state, action) {
      return { ...state, data: action.payload };
    },
  },
};
export default SourcesModel;
