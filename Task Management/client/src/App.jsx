import React from 'react'
import Navbar from './Components/Navbar'
import AllRoutes from './Routes/AllRoutes'
import { ToastContainer } from 'react-toastify'

const App = () => {
  return (
    <div>
      <Navbar/>
      <AllRoutes/>
      <ToastContainer/>
    </div>
  )
}

export default App
