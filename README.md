# Terramo Vite React Project

This project is a React application set up with Vite, TypeScript, and several other libraries and tools to facilitate development and build processes.

## Project Structure

The project has the following structure:

```
/home/wuushuu/_projects/terramo-vite-react
├── src
│   ├── App.tsx
│   ├── main.tsx
│   ├── theme.tsx
│   ├── assets
│   ├── components
│   ├── hooks
│   ├── mock-data
│   │   └── db-mock-data.json
│   ├── pages
│   ├── services
│   │   └── api-service.ts
│   ├── types
│   │   └── customer.ts
├── Dockerfile
├── Dockerfile.backend
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
└── README.md
```

### Folders and Files

- **src**: Contains the source code of the application.
  - **App.tsx**: The main application component.
  - **main.tsx**: The entry point of the application.
  - **theme.tsx**: Contains theme-related configurations.
  - **assets**: Contains static assets like images and fonts.
  - **components**: Contains reusable React components.
  - **hooks**: Contains custom React hooks.
  - **mock-data**: Contains mock data for development purposes.
    - **db-mock-data.json**: Mock data file used by json-server.
  - **pages**: Contains page components for different routes.
  - **services**: Contains service files for API calls.
    - **api-service.ts**: Service file for making API calls.
  - **types**: Contains TypeScript type definitions.
    - **customer.ts**: Type definitions for customer-related data.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- Docker (for containerized development and deployment)

### Installation

1. Clone the repository or unzip the project.
  clone via http
   ```sh
   git clone https://gitlab.ost.ch/ifs/coaching-terramo/terramo-vite-react.git
   ```
  clone via ssh
  ```sh
  git clone ssh://git@gitlab.ost.ch:45022/ifs/coaching-terramo/terramo-vite-react.git
  ```

2. Install dependencies in root folder of project:
   ```sh
   cd terramo-vite-react
   npm install
   ```

### Running the Application

#### Development

To start the development server with Vite:

```sh
npm run dev
```

#### Mock Backend

To start the mock backend server using json-server:

```sh
npm run start:json-server
```

The mock backend server uses the `db-mock-data.json` file located in the `src/mock-data` directory. This file can be edited using the application to simulate changes in the backend data.

#### Docker

To build and run the application using Docker:

1. Build the Docker images:
   ```sh
   docker-compose build
   ```

2. Start the containers:
   ```sh
   docker-compose up
   ```

The application will be available at `http://localhost:80` and the mock backend at `http://localhost:3001`.

## Building for Production

To build the application for production:

```sh
npm run build
```

The build output will be in the `dist` directory.

## Linting

To lint the code:

```sh
npm run lint
```

## License

This project is licensed under the MIT License.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
