## Project Overview

This project is a Next.js application that demonstrates the usage of the `aladin-lite-react` component. It displays an interactive sky map using the Aladin Lite library and provides a simple interface to control the view.

The application is built with Next.js, React, and TypeScript, and uses Tailwind CSS for styling.

## Building and Running

### Prerequisites

- Node.js and npm (or a compatible package manager)

### Installation

1.  Install the dependencies for the `aladin-lite-react` library from the parent directory.
2.  Install the dependencies for this example application:

    ```bash
    npm install
    ```

### Running the Development Server

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start a development server on `http://localhost:3000`.

### Building for Production

To build the application for production, use the following command:

```bash
npm run build
```

This will create an optimized build of the application in the `.next` directory.

### Starting the Production Server

To start the production server, use the following command:

```bash
npm run start
```

## Development Conventions

### Code Style

The project uses the standard TypeScript and React coding conventions. It also uses ESLint to enforce code quality. To run the linter, use the following command:

```bash
npm run lint
```

### Component Structure

The main component is `AladinViewer`, which is a wrapper around the `aladin-lite-react` component. This component is used in the main page of the application to display the sky map.
