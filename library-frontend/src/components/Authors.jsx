import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../queries';
import BirthYearForm from './BirthYearForm';

const Authors = ({ show, allowEdit }) => {
  const result = useQuery(ALL_AUTHORS);

  if (!show) {
    return null;
  }

  if (result.loading) return <>Loading authors...</>;

  const { allAuthors: authors } = result.data;

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Born</th>
            <th>Books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born ?? 'N/A'}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {allowEdit && <BirthYearForm authors={authors} />}
    </div>
  );
};

export default Authors;
