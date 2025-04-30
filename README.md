# Home Appliance Repair Service Provider Portal

A React-based web application for service providers to manage repair requests from customers.

## Features

- Authentication system for service providers (login/signup)
- Dashboard to view pending and accepted service requests
- Request acceptance workflow
- Profile management for service providers
- Dark and light mode theming
- Integration with Firebase Firestore

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Firestore database setup

## Getting Started

1. Clone the repository

```bash
git clone <repository-url>
cd appliance-repair-service-provider
```

2. Install dependencies

```bash
npm install
```

3. Create a Firebase project

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Set up Firestore database
- Enable Authentication with Email/Password method

4. Configure environment variables

- Copy the `.env.example` file to `.env`
- Fill in your Firebase configuration details

```bash
cp .env.example .env
```

5. Start the development server

```bash
npm run dev
```

## Project Structure

```
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts (auth, theme)
│   ├── firebase/         # Firebase configuration
│   ├── pages/            # Application pages
│   ├── App.tsx           # Main app component
│   ├── App.css           # Global styles
│   ├── index.css         # Tailwind imports
│   └── main.tsx          # Entry point
├── package.json
└── README.md
```

## Integrating with Customer Website

See the `customer_integration_guide.md` file for detailed instructions on how to integrate this service provider portal with your existing customer website.

## Backend Setup

The backend is built with Flask and connects to Firebase Firestore:

1. Navigate to the `flask_backend` directory
2. Install requirements: `pip install -r requirements.txt`
3. Add your Firebase service account JSON to the directory
4. Start the server: `python app.py`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT