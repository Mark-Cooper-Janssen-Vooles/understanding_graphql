import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

class SongDetail extends Component {
  render() {
    console.log(this.props.data);
    return (
      <div>
        <h3>Song Detail</h3>
      </div>
    )
  }
}

const query = gql`
  query findSong($id: ID!) {
    song(id: $id) {
      id
      title
    }
  }
`;

export default graphql(query, {
  options: (props) => { return { variables: { id: props.id }}}
})(SongDetail);
