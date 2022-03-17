import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import LyricCreate from './LyricCreate';
import LyricList from './LyricList';
import findSong from '../queries/findSong';

class SongDetail extends Component {
  render() {
    const { song } = this.props.data;
    if (!song) { return <div>Loading...</div>}

    return (
      <div>
        <h3>{song.title}</h3>
        <LyricList lyrics={song.lyrics} />
        <LyricCreate song={song} />
      </div>
    )
  }
}

export default graphql(findSong, {
  options: (props) => { return { variables: { id: props.id }}}
})(SongDetail);
