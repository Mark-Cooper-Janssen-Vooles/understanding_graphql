import React from 'react';
import SongList from './SongList';
import SongCreate from './SongCreate';

export default () => {
  return (
    <div className='container'>
      <SongList />
      <SongCreate />
    </div>
    );
};