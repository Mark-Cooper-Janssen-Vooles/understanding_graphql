// fetching a list of songs and rendering them on the screen
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

var SongList = (props) => {
  console.log(props.data);
  const { loading, songs } = props.data;

  const renderSongs = () => {
    if (!loading) {
      return songs.map(song => {
        return (
          <li key={song.id} className="collection-item">
            {song.title}
          </li>
        )
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <ul className="collection">
      {renderSongs()}
    </ul>
  )
}

const query = gql`
  {
    songs {
      title
      id
    }
  }
`;

export default graphql(query)(SongList);