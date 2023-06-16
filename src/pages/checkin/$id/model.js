import { getContainerDetail } from '@/services/container';

const Model = {
  namespace: 'containerDetail',
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
      const response = yield call(getContainerDetail, payload);
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

    updateStaffingState(state, action) {
      const { staffings } = state;
      const { list } = staffings;
      const { id, ...params } = action.payload;
      return {
        ...state,
        staffings: {
          ...staffings,
          list: [
            ...list.map((x) => {
              if (x.id == id) {
 return {
                  ...x,
                  ...params,
                };
}
              return x;
            }),
          ],
        },
      };
    },
    saveStaffings(state, action) {
      return { ...state, staffings: action.payload || {} };
    },
  },
};
export default Model;
