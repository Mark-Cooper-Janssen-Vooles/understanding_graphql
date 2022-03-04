// fetching a list of songs and rendering them on the screen
import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import fetchSongs from '../queries/fetchSongs';

class SongList extends Component {
  constructor(props) {
    super(props);
  }

  onSongDelete(id) {
    this.props.mutate({ variables: { id } })
    .then(() => this.props.data.refetch());
  }

  renderSongs() {
    const { loading, songs } = this.props.data;
    if (!loading) {
      return songs.map(({id, title}) => {
        return (
          <li key={id} className="collection-item">
            {title}
            <i className="material-icons" onClick={() => this.onSongDelete(id)}>delete</i>
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

const mutation = gql`
  mutation DeleteSong($id: ID) {
    deleteSong(id: $id) {
      id
    }
  }
`;

export default graphql(mutation)(
  graphql(fetchSongs)(SongList)
);