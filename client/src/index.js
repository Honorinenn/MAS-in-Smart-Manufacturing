import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Choose your dashboard version:
// Option 1: Green/Grey Theme (New!)
import App from './components/GreenGreyDashboard';

// Option 2: Blue Theme with Advanced Chat (Recommended)
// import App from './components/FullyIntegratedDashboard';

// Option 3: Blue Theme with Basic Chat
// import App from './components/SmartFactoryDashboardWithChat';

// Option 4: Blue Theme without Chat
// import App from './components/SmartFactoryDashboard';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals