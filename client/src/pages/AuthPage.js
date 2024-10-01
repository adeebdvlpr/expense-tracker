// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Login from '../components/Auth/Login';
// import Register from '../components/Auth/Register';

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const navigate = useNavigate();

//   const handleAuthSuccess = (token) => {
//     localStorage.setItem('token', token);
//     navigate('/');
//   };

//   return (
//     <div>
//       {isLogin ? (
//         <Login onLoginSuccess={handleAuthSuccess} />
//       ) : (
//         <Register onRegisterSuccess={handleAuthSuccess} />
//       )}
//       <button onClick={() => setIsLogin(!isLogin)}>
//         {isLogin ? 'Need to register?' : 'Already have an account?'}
//       </button>
//     </div>
//   );
// };

// export default AuthPage;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { login, register } from '../utils/api.js';

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = isLogin 
//         ? await login({ email, password })
//         : await register({ email, password });
      
//       localStorage.setItem('token', response.data.token);
//       navigate('/');
//     } catch (error) {
//       console.error('Authentication error:', error.response?.data || error.message);
//       // Handle error (e.g., show error message to user)
//     }
//   };

//   return (
//     <div>
//       <h2>{isLogin ? 'Login' : 'Register'}</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Email"
//           required
//         />
//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           required
//         />
//         <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
//       </form>
//       <button onClick={() => setIsLogin(!isLogin)}>
//         {isLogin ? 'Need to register?' : 'Already have an account?'}
//       </button>
//     </div>
//   );
// };

// export default AuthPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../utils/api.js';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = isLogin 
        ? await login({ email, password })
        : await register({ email, password });
      console.log('Auth response:', response);
      // Implement proper token storage and navigation here
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Need to register?' : 'Already have an account?'}
      </button>
    </div>
  );
};

export default AuthPage;