import React, { Component } from 'react';
import SongList from './SongList';
import SongCreate from './SongCreate';
import SongDetail from './SongDetail';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.handleRerenderChange = this.updateActiveSong.bind(this);
    this.state = { 
      activeSong: {}
     };
  }

  updateActiveSong(songDetail) {
    this.setState({ activeSong: { songDetail }})
  }

  render() {
    return (
      <div className='container'>
        <SongCreate />
        <SongList />
        <SongDetail updateActiveSong={this.updateActiveSong} id={"62215a286523a70d0acb15ad"} />
      </div>
      );
  }
};