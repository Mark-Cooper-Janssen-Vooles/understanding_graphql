import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import LyricCreate from './LyricCreate';
import LyricList from './LyricList';

class SongDetail extends Component {
  render() {
    const { song, lyrics } = this.props.data;
    if (!song) { return <div>Loading...</div>}

    return (
      <div>
        <h3>{song.title}</h3>
        <LyricList lyrics={lyrics} />
        <LyricCreate song={song} />
      </div>
    )
  }
}

const query = gql`
query findSong($id: ID!) {
  song(id: $id) {
    id
    title
    lyrics {
      id
      content
    }
  }
}
`;

export default graphql(query, {
  options: (props) => { return { variables: { id: props.id }}}
})(SongDetail);
