import React from 'react';
import ReactDOM from 'react-dom/client';

function PlaceholderApp(): JSX.Element {
  return <p>TaskOrbit Phase 0 skeleton. UI lands in Phase 1.</p>;
}

const rootElement = document.getElementById('root');

if (rootElement !== null) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PlaceholderApp />
    </React.StrictMode>,
  );
}
