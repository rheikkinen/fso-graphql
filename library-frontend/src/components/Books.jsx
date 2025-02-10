import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries';
import { useEffect, useState } from 'react';

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const [genres, setGenres] = useState(new Set());
  const [activeGenre, setActiveGenre] = useState(null);

  useEffect(() => {
    if (result.data) {
      const newGenreSet = new Set();
      result.data.allBooks.forEach((book) =>
        book.genres.forEach((genre) => newGenreSet.add(genre))
      );
      setGenres(newGenreSet);
    }
  }, [result.data]);

  if (!props.show) {
    return null;
  }

  if (result.loading) return <>Loading books...</>;

  const { allBooks: books } = result.data;

  const filteredBooks = activeGenre
    ? books.filter((book) => book.genres.includes(activeGenre))
    : books;

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
              onClick={(e) => setActiveGenre(e.target.value)}
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
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
