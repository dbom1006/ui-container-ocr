import axios_1 from 'axios';
import Cookies from 'js-cookie';
import qs from 'qs';
import { notification } from 'antd';

export default class Strapi {
  /**
   * Default constructor.
   * @param baseURL Your Strapi host.
   * @param axiosConfig Extend Axios configuration.
   */
  constructor(baseURL, storeConfig, requestConfig) {
    this.axios = axios_1.default.create(
      Object.assign({ baseURL, paramsSerializer: qs.stringify }, requestConfig),
    );
    this.storeConfig = Object.assign(
      {
        cookie: {
          key: 'jwt',
          options: {
            path: '/',
          },
        },
        localStorage: {
          key: 'jwt',
        },
      },
      storeConfig,
    );
    if (this.isBrowser()) {
      let existingToken;
      if (this.storeConfig.cookie) {
        existingToken = Cookies.get(this.storeConfig.cookie.key);
      } else if (this.storeConfig.localStorage) {
        existingToken = JSON.parse(window.localStorage.getItem(this.storeConfig.localStorage.key));
      }
      if (existingToken) {
        this.setToken(existingToken, true);
      }
    }
  }

  /**
   * Axios request
   * @param method Request method
   * @param url Server URL
   * @param requestConfig Custom Axios config
   */
  async request(method, url, requestConfig, showError = true) {
    try {
      const response = await this.axios.request(
        Object.assign(
          {
            method,
            url: `/api${url}`,
          },
          requestConfig,
        ),
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        showError &&
          notification.error({
            description: error.response.data.message,
            message: error.response.data.error,
          });
      } else {
        notification.error({
          description: 'Please check your network connection',
          message: 'Network not available',
        });
      }
      return null;
    }
  }

  /**
   * Register a new user.
   * @param username
   * @param email
   * @param password
   * @returns Authentication User token and profile
   */
  async register(username, email, password) {
    this.clearToken();
    const authentication = await this.request('post', '/auth/local/register', {
      data: {
        email,
        password,
        username,
      },
    });
    this.setToken(authentication.jwt);
    return authentication;
  }

  /**
   * Login by getting an authentication token.
   * @param identifier Can either be an email or a username.
   * @param password
   * @returns Authentication User token and profile
   */
  async login(identifier, password, autoLogin = false) {
    this.clearToken();
    const authentication = await this.request(
      'post',
      '/auth/local',
      {
        data: {
          identifier,
          password,
        },
      },
      false,
    );
    if (authentication) {
      this.setToken(authentication.jwt);
      return authentication;
    }
    return {
      jwt: null,
      user: null,
    };
  }

  /**
   * Login by getting an authentication token.
   * @param identifier Can either be an email or a username.
   * @param password
   * @returns Authentication User token and profile
   */
  async adminLogin(identifier, password, autoLogin = false) {
    this.clearToken();
    const authentication = await this.request('post', '/auth/local', {
      data: {
        identifier,
        password,
      },
    });
    if (authentication) {
      this.setToken(authentication.jwt);
      return authentication;
    }
    return {
      jwt: null,
      user: null,
    };
  }

  /**
   * Sends an email to a user with the link of your reset password page.
   * This link contains an URL param code which is required to reset user password.
   * Received link url format https://my-domain.com/rest-password?code=privateCode.
   * @param email
   * @param url Link that user will receive.
   */
  async forgotPassword(email, url) {
    this.clearToken();
    return await this.request('post', '/auth/forgot-password', {
      data: {
        email,
        url,
      },
    });
  }

  /**
   * Reset the user password.
   * @param code Is the url params received from the email link (see forgot password).
   * @param password
   * @param passwordConfirmation
   */
  async resetPassword(code, password, passwordConfirmation) {
    this.clearToken();
    return await this.request('post', '/auth/reset-password', {
      data: {
        code,
        password,
        passwordConfirmation,
      },
    });
  }

  /**
   * Retrieve the connect provider URL
   * @param provider
   */
  getProviderAuthenticationUrl(provider) {
    return `${this.axios.defaults.baseURL}/connect/${provider}`;
  }

  /**
   * Authenticate the user with the token present on the URL (for browser) or in `params` (on Node.js)
   * @param provider
   * @param params
   */
  async authenticateProvider(provider, params) {
    this.clearToken();
    // Handling browser query
    if (this.isBrowser()) {
      params = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    }
    const authentication = await this.request('get', `/auth/${provider}/callback`, {
      params,
    });
    this.setToken(authentication.jwt);
    return authentication;
  }

  /**
   * List entries
   * @param contentTypePluralized
   * @param params Filter and order queries.
   */
  getEntries(contentTypePluralized, params) {
    return this.request('get', `/${contentTypePluralized}`, {
      params,
    });
  }

  /**
   * Get the total count of entries with the provided criteria
   * @param contentType
   * @param params Filter and order queries.
   */
  getEntryCount(contentType, params) {
    return this.request('get', `/${contentType}/count`, {
      params,
    });
  }

  /**
   * Get a specific entry
   * @param contentTypePluralized Type of entry pluralized
   * @param id ID of entry
   */
  async getEntry(contentTypePluralized, id) {
    const res = await this.request('get', `/${contentTypePluralized}/${id}`);
    if(res.data) return {
      id: res.data.id,
      ...res.data.attributes,
    }
    return null
  }

  /**
   * Create data
   * @param contentTypePluralized Type of entry pluralized
   * @param data New entry
   */
  createEntry(contentTypePluralized, data) {
    return this.request('post', `/${contentTypePluralized}`, {
      data,
    });
  }

  /**
   * Update data
   * @param contentTypePluralized Type of entry pluralized
   * @param id ID of entry
   * @param data
   */
  updateEntry(contentTypePluralized, id, data) {
    return this.request('put', `/${contentTypePluralized}/${id}`, {
      data,
    });
  }

  /**
   * Delete an entry
   * @param contentTypePluralized Type of entry pluralized
   * @param id ID of entry
   */
  deleteEntry(contentTypePluralized, id) {
    return this.request('delete', `/${contentTypePluralized}/${id}`);
  }

  /**
   * Search for files
   * @param query Keywords
   */
  searchFiles(query) {
    return this.request('get', `/upload/search/${decodeURIComponent(query)}`);
  }

  /**
   * Get files
   * @param params Filter and order queries
   * @returns Object[] Files data
   */
  getFiles(params) {
    return this.request('get', '/upload/files', {
      params,
    });
  }

  /**
   * Get file
   * @param id ID of entry
   */
  getFile(id) {
    return this.request('get', `/upload/files/${id}`);
  }

  /**
   * Upload files
   *
   * ### Browser example
   * ```js
   * const form = new FormData();
   * form.append('files', fileInputElement.files[0], 'file-name.ext');
   * form.append('files', fileInputElement.files[1], 'file-2-name.ext');
   * const files = await strapi.upload(form);
   * ```
   *
   * ### Node.js example
   * ```js
   * const FormData = require('form-data');
   * const fs = require('fs');
   * const form = new FormData();
   * form.append('files', fs.createReadStream('./file-name.ext'), 'file-name.ext');
   * const files = await strapi.upload(form, {
   *   headers: form.getHeaders()
   * });
   * ```
   *
   * @param data FormData
   * @param requestConfig
   */
  upload(data, requestConfig) {
    return this.request('post', '/upload', Object.assign({ data }, requestConfig));
  }

  /**
   * Set token on Axios configuration
   * @param token Retrieved by register or login
   */
  setToken(token, comesFromStorage) {
    this.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    if (this.isBrowser() && !comesFromStorage) {
      if (this.storeConfig.localStorage) {
        window.localStorage.setItem(this.storeConfig.localStorage.key, JSON.stringify(token));
      }
      if (this.storeConfig.cookie) {
        Cookies.set(this.storeConfig.cookie.key, token, this.storeConfig.cookie.options);
      }
    }
  }

  /**
   * Remove token from Axios configuration
   */
  clearToken() {
    delete this.axios.defaults.headers.common.Authorization;
    if (this.isBrowser()) {
      if (this.storeConfig.localStorage) {
        window.localStorage.removeItem(this.storeConfig.localStorage.key);
      }
      if (this.storeConfig.cookie) {
        Cookies.remove(this.storeConfig.cookie.key, this.storeConfig.cookie.options);
      }
    }
  }

  /**
   * Check if it runs on browser
   */
  isBrowser() {
    return typeof window !== 'undefined';
  }
}
