import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

class SongDetail extends Component {
  render() {
    if (this.props.data.song != undefined) {
      console.log(this.props.data.song);
      const { title } = this.props.data.song;

      return (
        <div>
          <h3>{title}</h3>
        </div>
      )
    }

    return (<div></div>)
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
