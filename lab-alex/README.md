## Directory Structure
* **README.md**
* **.gitignore**
* **.eslintrc**
* **.eslintignore**
* **package.json**
  * a `test` script has been configured for running jest
  * a `start` script has been configured for running the server
* **lib/** - contains helper modules
  * **error-middleware.js**
  * **server-toggle.js**
  * **basic-auth-middleware.js**
* **model/** - contains resource model
  * **user.js**
* **route/** - contains routes
  * **auth-route.js**
* **__test__** - contains route tests
  * **auth-route.test.js**
* **server.js** - runs the application

## Installation
1. To install this application, download the files from this repository
2. `cd` to the repository directory and run `npm i`
3. Use `npm run start` or `node server.js` to start the server connection
4. Alternatively, run `npm run test` to run tests

## Server Endpoints
Users can make the following requests:

GET: With a valid List id, user can use the following route: 
```
localhost:3000/api/signin
```

POST: Lists can be created using the following route with name and content inputs: 
```
localhost:3000/api/signup
```
