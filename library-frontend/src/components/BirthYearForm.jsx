import { useMutation } from '@apollo/client';
import { useState } from 'react';

import { ALL_AUTHORS, EDIT_BIRTH_YEAR } from '../queries';

const BirthYearForm = (props) => {
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const [changeBirthYear, result] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    changeBirthYear({ variables: { name, born } });

    setName('');
    setBorn('');
  };

  // useEffect(() => {
  //   if (result.data && result.data.editNumber === null) {
  //     setError('person not found');
  //   }
  // }, [result.data, setError]);

  return (
    <div>
      <h2>Change birth year of an author</h2>

      <form onSubmit={submit}>
        <div>
          Name{' '}
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          Born{' '}
          <input
            value={born}
            type='number'
            onChange={({ target }) => setBorn(parseInt(target.value))}
          />
        </div>
        <button type='submit'>Save</button>
      </form>
    </div>
  );
};

export default BirthYearForm;
