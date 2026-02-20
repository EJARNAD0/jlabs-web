# JLab Web - Geo-Location Tracker

This is a React-based web application that allows users to track their IP geolocation, search for other IP addresses, visualize locations on a map, and maintain a search history.

## Features

- **User Authentication:** Secure login system to access the dashboard.
- **My Location:** Automatically detects and displays your current IP address and geolocation details.
- **IP Search:** Look up geolocation information for any IPv4 address.
- **Interactive Map:** Visualizes the geolocation on an interactive map powered by Leaflet.
- **Search History:** Automatically saves your search queries for quick access.
- **History Management:** Delete individual or multiple history entries.

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Maps:** Leaflet, React Leaflet
- **Styling:** CSS Modules / Inline Styles

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd jlabs-web
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configuration:**

    Copy the `.env.example` file to `.env` and configure your API URL.

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your backend API URL:

    ```env
    VITE_API_URL=http://localhost:8000/api
    ```

## Running the Application

### Development Server

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check for code quality issues:

```bash
npm run lint
```

## Project Structure

- `src/pages`: Contains the main application pages (`Home.jsx`, `Login.jsx`).
- `src/components`: Reusable UI components (`GeoMap.jsx`).
- `src/lib`: Utility functions and API configuration (`api.js`, `auth.js`).
- `public`: Static assets.

## License

This project is licensed under the MIT License.
