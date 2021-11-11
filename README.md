# Merge Queue
A queue management app for organizing the order in which MRs are merged.

While working with a Clinc Inc., I developed an application to streamline development and project management processes in the context of the MR merge cycle.

### Features:
- Manage a queue of MRs to be merged
- Easily update status and stages with autocomplete fields
- Get notified when a merge task has changed or may require action

_This was a weekend project that was presented to the team and adopted as an in internal tool._

![](./screenshots/task_list.png)

## Demo

https://merge-queue.shemarlindie.com

[Screenshots](./screenshots)

## Deploy Checklist
#### Prod
- Create firebase project (pay-as-you-go)
- Enable authentication (google provider), cloud firestore, cloud functions, hosting (visit each tab)
- Create web app in firebase project
- Set up `.firebaserc` with firebase project id based on `.firebaserc.example`
- Set up `.env.local` with firebase web app config based on `.env.example`
- Set up sendgrid account with sender authentication
- Create sendgrid api key
- Configure sendgrid api key `firebase functions:config:set sendgrid.key=<key>`
- Configure "from" email `firebase functions:config:set sendgrid.from=<from email address>`
- Enable notifications `firebase functions:config:set app.notifications=true`
- Deploy to firebase: `firebase deploy`

#### Dev
- Setup function emulation config file (`.runtimeconfig.json`) in `./functions` using `.runtimeconfig.example.json`
- Start emulators: `firebase emulators:start`
- Start frontend: `npm start`


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
