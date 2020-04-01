import firebase from 'firebase/app';
import 'firebase/database';

const HOME_PATH = process.env.NODE_ENV === 'production' ? 'production' : 'development';

firebase.initializeApp({
  apiKey: 'AIzaSyCEGeSREAh1wL1lBFFO-ARgKFDg6oEi1Eg',
  authDomain: 'hiretend.firebaseapp.com',
  databaseURL: 'https://hiretend.firebaseio.com',
  storageBucket: 'hiretend.appspot.com',
});

console.log('INIT FIREBASE');

export const database = firebase.database();

export const removeListenerValue = (path, listener) => {
  if (listener) {
    Object.keys(listener).forEach(x => database.ref(`${HOME_PATH}/${path}`).off(x, listener[x]));
  } else database.ref(`${HOME_PATH}/${path}`).off();
};

export const onListenerOneValue = async (path, eventType, callback) => database
    .ref(`${HOME_PATH}/${path}`)
    .limitToLast(1)
    .on(eventType, callback);

export const onListenerValue = (path, eventType, callback) => database.ref(`${HOME_PATH}/${path}`).on(eventType, value => callback(value.val()));

export const getValue = async path => {
  const eventType = 'value';
  const ref = await database.ref(`${HOME_PATH}/${path}`).once(eventType);
  return ref.val();
};

export const getObjectValues = async (path, limit, from, last = true) => {
  const eventType = 'value';
  const limitFrom = last ? 'limitToLast' : 'limitToFirst';
  const fromAt = last ? 'endAt' : 'startAt';
  let query = database
    .ref(`${HOME_PATH}/${path}`)
    .orderByKey()
    [limitFrom](limit);
  if (from) query = query[fromAt](from);
  const ref = await query.once(eventType);
  return ref.val() || {};
};

export default firebase;
