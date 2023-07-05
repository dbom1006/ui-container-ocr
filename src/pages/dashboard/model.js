import { getDataBoxes } from '@/services/dashboard';

const Model = {
  namespace: 'dashboard',
  state: {
    boxes: {},
  },
  effects: {
    *fetchBoxes({ payload }, { call, put }) {
      const response = yield call(getDataBoxes, payload);
      yield put({
        type: 'saveBoxes',
        payload: response,
      });
    },
  },
  reducers: {
    saveBoxes(state, action) {
      return { ...state, boxes: action.payload };
    },
  },
};
export default Model;
