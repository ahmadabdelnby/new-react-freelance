import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app'
import { Provider } from 'react-redux'
import store from './Services/store'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { LanguageProvider } from "./context/LanguageContext";

// Disable browser's automatic scroll restoration
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

// Force scroll to top on initial load
window.scrollTo(0, 0)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <Provider store={store}>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Provider>
    </LanguageProvider>
  </StrictMode>
)
