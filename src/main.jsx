import ReactDOM from 'react-dom/client';
import App from './App';
import RuntimeErrorBoundary from './components/RuntimeErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <RuntimeErrorBoundary>
    <App />
  </RuntimeErrorBoundary>
);
