// import React, { useState, useEffect } from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import ExpenseTracker from './pages/ExpenseTracker';
// import AuthPage from './pages/AuthPage';

// const theme = createTheme({
//   // Your theme options here
// });

// const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setIsAuthenticated(true);
//     }
//   }, []);

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <BrowserRouter>
//         <div className="App">
//           <Routes>
//             <Route path="/auth" element={<AuthPage />} />
//             <Route 
//               path="/" 
//               element={isAuthenticated ? <ExpenseTracker /> : <Navigate to="/auth" />} 
//             />
//           </Routes>
//         </div>
//       </BrowserRouter>
//     </ThemeProvider>
//   );
// };

// export default App;

// import React, { useState, useEffect } from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import ExpenseTracker from './pages/ExpenseTracker';
// import AuthPage from './pages/AuthPage';

// const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setIsAuthenticated(true);
//     }
//     setIsLoading(false);
//   }, []);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <BrowserRouter>
//       <div className="App">
//         <Routes>
//           <Route path="/auth" element={<AuthPage />} />
//           <Route 
//             path="/" 
//             element={isAuthenticated ? <ExpenseTracker /> : <Navigate to="/auth" />} 
//           />
//         </Routes>
//       </div>
//     </BrowserRouter>
//   );
// };

// export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ExpenseTracker from './pages/ExpenseTracker';
import AuthPage from './pages/AuthPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/" 
          element={isAuthenticated ? <ExpenseTracker /> : <Navigate to="/auth" />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;