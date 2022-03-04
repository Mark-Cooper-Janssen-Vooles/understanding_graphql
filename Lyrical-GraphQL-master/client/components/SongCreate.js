import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import fetchSongs from '../queries/fetchSongs';


class SongCreate extends Component {
  constructor(props) {
    super(props);

    this.state = { title: '' };
  }

  onSubmit(event) {
    event.preventDefault();

    this.props.mutate({
      variables: { title: this.state.title },
      refetchQueries: [{ query: fetchSongs }]
    })

    this.props.handleRerenderChange();
    this.setState({title: ''})
  }

  render() {
    return (
      <div>
        <h3>Create a new Song</h3>
        <form onSubmit={this.onSubmit.bind(this)}>
          <label>Song Title:</label>
          <input 
            onChange={e => this.setState({title: e.target.value})}
            value={this.state.title}
          />
        </form>
      </div>
    )
  }
}

// to communicate the data from the components form to the mutation
const mutation = gql`
  mutation AddSong($title: String){
    addSong(title: $title) {
      title
    }
  }
`;

export default graphql(mutation)(SongCreate);