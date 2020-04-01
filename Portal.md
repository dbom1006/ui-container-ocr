# Hiretend Portal Documents

## 1. Required Environment

Please make sure your computer/server meets the following requirements:

- [Node.js](https://nodejs.org/) >= 10.x: Node.js is a server platform which runs JavaScript. Installation guide [here](https://nodejs.org/en/download/).

- [NPM](https://www.npmjs.com/) >= 6.x: NPM is the package manager for Javascript. Installation guide [here](https://nodejs.org/en/download/). _(Make sure the database that you are using meets the requirement.)_

- Git (Optional)

## 2. Source code

There are two ways to upload source code to **your server**:

- Download source code (zip) and use FileZilla to **upload** into **_your server_**.
- Use Git to **clone** source code in **_your server_**:

```bash
git clone git@github.com:hiretend/client_portal_phase_2.git
```

## 3. Configure

- Config Backend URL & Google API Key **Path —** `<project>/src/ultis/consants.js`.

```js
{
  export const API_URL =
    process.env.NODE_ENV !== 'production'
      ? 'http://localhost:1337'
      : 'https://api-hiretend.herokuapp.com/';
  export const GOOGLE_API_KEY = 'AIzaSyAiUwQhd0Sj2QyWksF_3orIERSjtq_fjFU';
}
```

## 4. Installing

- Locate to project in your server:

```bash
cd path_to_project
```

- Install `node_modules`:

```bash
npm install
```

or

```bash
yarn
```

## 5. Start project to dev

```bash
npm run dev
```

## 6. Build project

```bash
npm run build
```

## 7. Check code style

```bash
npm run lint
```

You can also use script to auto fix some lint error:

```bash
npm run lint:fix
```

## 8. Test code

```bash
npm test
```

## 9. More

This project is initialized with [Ant Design Pro](https://pro.ant.design). Follow is the quick guide for how to use.
