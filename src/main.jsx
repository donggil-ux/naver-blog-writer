import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import BriefPlanner from './components/BriefPlanner.tsx'
import './index.css'

const params = new URLSearchParams(window.location.search)
const screen = params.get('screen')

const Root = screen === 'brief-planner' ? BriefPlanner : App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
