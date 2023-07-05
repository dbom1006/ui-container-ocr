import { getSystemConfig, updateSystemConfig } from '@/services/system';

const Model = {
  namespace: 'system',
  state: {
    checkinTime: ''
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getSystemConfig, payload);
      yield put({
        type: 'save',
        payload: response.data.attributes,
      });
    },
    *update({ payload, callback }, { call }) {
      const response = yield call(updateSystemConfig, payload);
      if (response) {
        callback && callback();
      }
    }
  },
  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
export default Model;
