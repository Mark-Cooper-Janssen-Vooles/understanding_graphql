import React, { Component } from 'react';
import gql from 'graphql-tag';

class SongCreate extends Component {
  constructor(props) {
    super(props);

    this.state = { title: '' };
  }

  onSubmit(event) {
    event.preventDefault();

    
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

// to communicate the data from the components form to the mutation?
const mutation = gql`
  mutation AddSong($title: String){
    addSong(title: $title) {
      title
    }
  }
`;

export default SongCreate;