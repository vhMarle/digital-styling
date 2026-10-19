import React, { useState } from 'react';
import MainPage from './components/MainPage';
import UploadItem from './components/UploadItem';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'upload'

  return (
    <div>
      {currentView === 'main' ? (
        <MainPage onOpenUpload={() => setCurrentView('upload')} />
      ) : (
        <UploadItem onBack={() => setCurrentView('main')} />
      )}
    </div>
  );
}