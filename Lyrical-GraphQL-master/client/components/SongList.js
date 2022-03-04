// fetching a list of songs and rendering them on the screen
import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import fetchSongs from '../queries/fetchSongs';

class SongList extends Component {
  constructor(props) {
    super(props);
  }

  renderSongs() {
    const { loading, songs } = this.props.data;
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

  render() {
    if (this.props.data.loading)
      return ( <div>Loading...</div> )

    return (
      <ul className="collection">
        {this.renderSongs()}
      </ul>
    )
  }
}

export default graphql(fetchSongs)(SongList);