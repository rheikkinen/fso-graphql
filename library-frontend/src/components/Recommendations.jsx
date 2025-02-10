import { useQuery } from '@apollo/client';
import { BOOKS_BY_GENRE, ME } from '../queries';
import BookList from './BookList';

const Recommendations = ({ show }) => {
  const { data: userData, loading: userLoading } = useQuery(ME);
  const { data: bookData, loading: booksLoading } = useQuery(BOOKS_BY_GENRE, {
    variables: { genre: userData?.me?.favoriteGenre },
  });

  if (!show) return null;

  if (userLoading || booksLoading) return <div>Loading...</div>;

  const { me: currentUser } = userData;
  console.log(currentUser);
  const favoriteGenre = currentUser.favoriteGenre ?? null;
  const books = bookData.allBooks ?? [];

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        Books in your favorite genre <b>{favoriteGenre}</b>
      </p>
      {books.length === 0 ? (
        <p>No books found in your favorite genre</p>
      ) : (
        <BookList books={books} />
      )}
    </div>
  );
};
export default Recommendations;
