import { createEmployee, getDataEmployees } from '@/services/employee';

const EmployeesModel = {
  namespace: 'employees',
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
      const response = yield call(getDataEmployees, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(createEmployee, payload);
      if (response) {
        yield put({
          type: 'save',
          payload: response,
        });
        callback && callback();
      }
    }
  },
  reducers: {
    save(state, action) {
      return { ...state, data: action.payload };
    },
  },
};
export default EmployeesModel;
