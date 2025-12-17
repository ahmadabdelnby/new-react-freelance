import { useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Layout from './Components/layout/Layout'

import './App.css'

function App() {
  useEffect(() => {
    // Force LTR direction
    document.documentElement.dir = 'ltr'
    document.body.dir = 'ltr'
    document.documentElement.style.direction = 'ltr'
    document.body.style.direction = 'ltr'
  }, [])

  return (
    <>
      <Layout />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App
