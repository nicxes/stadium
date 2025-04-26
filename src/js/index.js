import React from 'react';
import ReactDOM from 'react-dom/client';
import Blazy from 'blazy';
import App from './App';

import '../scss/app.scss';

window.blazy = new Blazy();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
