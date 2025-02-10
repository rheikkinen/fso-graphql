import { useApolloClient } from '@apollo/client';
import { useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import LoginForm from './components/LoginForm';
import NewBook from './components/NewBook';
import Recommendations from './components/Recommendations';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);

  const client = useApolloClient();

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        {!token ? (
          <button onClick={() => setPage('login')}>Log in</button>
        ) : (
          <>
            <button onClick={() => setPage('add')}>Add book</button>
            <button onClick={() => setPage('recommend')}>Recommend</button>
            <button onClick={logout}>Log out</button>
          </>
        )}
      </div>

      <Authors show={page === 'authors'} allowEdit={!!token} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} />
      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
      />
      <Recommendations show={page === 'recommend'} />
    </div>
  );
};

export default App;
