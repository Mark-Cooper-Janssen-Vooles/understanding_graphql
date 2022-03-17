import React, { Component } from 'react';
import SongList from './SongList';
import SongCreate from './SongCreate';
import SongDetail from './SongDetail';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.updateActiveSong = this.updateActiveSong.bind(this);
    this.state = { 
      activeSong: {}
     };
  }

  updateActiveSong(songDetail) {
    this.setState({ activeSong: songDetail })
  }

  render() {
    return (
      <div className='container'>
        <SongCreate />
        <SongList  updateActiveSong={this.updateActiveSong} />
        { this.state.activeSong.id !== undefined && <SongDetail id={this.state.activeSong.id} /> }
      </div>
      );
  }
};