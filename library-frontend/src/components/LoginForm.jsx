import { useEffect, useState } from 'react';
import { LOGIN } from '../queries';
import { useMutation } from '@apollo/client';

const LoginForm = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem('fs-library-user-token', token);
      setPage('authors');
    }
  }, [result.data, setToken, setPage]);

  const handleSubmit = (event) => {
    event.preventDefault();

    login({ variables: { username, password } });
  };

  if (!show) return null;

  return (
    <>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type='text'
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>Log in</button>
      </form>
    </>
  );
};

export default LoginForm;
