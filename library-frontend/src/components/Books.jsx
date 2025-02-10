import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ALL_BOOKS, BOOKS_BY_GENRE } from '../queries';
import BookList from './BookList';

const Books = (props) => {
  const [activeGenre, setActiveGenre] = useState(null);
  const [genres, setGenres] = useState(new Set());

  const { data: bookData, loading: booksLoading } = useQuery(ALL_BOOKS);
  const { data: filteredBookData, loading: filteredBooksLoading } = useQuery(
    BOOKS_BY_GENRE,
    {
      variables: { genre: activeGenre },
      skip: !activeGenre,
    }
  );

  useEffect(() => {
    if (bookData) {
      const newGenreSet = new Set();
      bookData.allBooks.forEach((book) =>
        book.genres.forEach((genre) => newGenreSet.add(genre))
      );
      setGenres(newGenreSet);
    }
  }, [bookData]);

  if (!props.show) {
    return null;
  }

  if (booksLoading || (activeGenre && filteredBooksLoading)) {
    return <>Loading books...</>;
  }

  const books = activeGenre ? filteredBookData.allBooks : bookData.allBooks;

  const handleGenreClick = (e) => {
    const genre = e.target.value;
    setActiveGenre(genre);

    console.log(genre);
  };

  return (
    <div>
      <h2>Books</h2>
      <div
        style={{
          border: '1px solid black',
          padding: '0 1rem 1rem 1rem',
          width: 'fit-content',
        }}
      >
        <h4>
          Filter by genre{' '}
          <button onClick={() => setActiveGenre(null)}>Clear filter</button>
        </h4>
        {genres.size === 0 && <>No genres found</>}
        {Array.from(genres).map((genre) => {
          return (
            <button
              style={{
                backgroundColor: genre === activeGenre ? 'lightgreen' : null,
              }}
              value={genre}
              onClick={handleGenreClick}
              key={genre}
            >
              {genre}
            </button>
          );
        })}
      </div>
      <p>
        Showing {activeGenre ? `books in genre ${activeGenre}` : 'all books'}
      </p>
      <BookList books={books} />
    </div>
  );
};

export default Books;
