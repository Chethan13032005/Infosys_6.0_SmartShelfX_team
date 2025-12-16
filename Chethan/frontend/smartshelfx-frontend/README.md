# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
### `npm test`
## Project Setup

This project is designed to provide an AI-based inventory forecast and auto restock solution.

### Setup
1. Clone the repository.
2. Navigate to the frontend directory.
3. Run `npm install` to install dependencies.

### Running the Backend and Frontend
1. Start the backend server.
2. In a new terminal, navigate to the frontend directory and run `npm start`.

### New Pages (Inventory CRUD)

- Home (/home) — displays current inventory stock and a brief overview.
- Get Inventory (/inventory/get) — lists inventory items (GET /inventory).
- Create Item (/inventory/create) — form to POST a new item to /inventory.
- Update Item (/inventory/update) — form to PUT updates to /inventory/{id}.
- Delete Item (/inventory/delete) — form to DELETE /inventory/{id}.

Each page uses the backend base URL configured in `src/config.js` (default: http://localhost:8082/api).

### Tailwind + Axios setup

This project uses Tailwind CSS for styling and Axios for HTTP calls. To install the required packages, run:

```powershell
cd 'D:\Internship\Infosys_SmartShelfX AI Based Inventory Forecast and Auto Restock\frontend\smartshelfx-frontend'
npm install axios tailwindcss postcss autoprefixer -D
npx tailwindcss init -p
```

Then start the dev server as usual:

```powershell
npm start
```

### Database Credentials
Ensure you have the correct database credentials set in your environment variables.

### Endpoints
Refer to the API documentation for available endpoints.
 
### User Roles
For a description of system roles and responsibilities (Admin, Warehouse Manager, Vendor, AI Service, Notification Service) see the project-level documentation:

- `../../docs/USER_ROLES.md`

### Troubleshooting
If you encounter issues, check the console for errors and ensure all dependencies are installed.


Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


cmnds------
cd 'D:\Internship\Infosys_SmartShelfX AI Based Inventory Forecast and Auto Restock\backend\smartshelfx-backend'
mvn clean spring-boot:run


cd 'D:\Internship\Infosys_SmartShelfX AI Based Inventory Forecast and Auto Restock\frontend\smartshelfx-frontend'; npm start
