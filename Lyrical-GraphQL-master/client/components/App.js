import React, { Component } from 'react';
import SongList from './SongList';
import SongCreate from './SongCreate';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.handleRerenderChange = this.handleRerenderChange.bind(this);
    this.state = { toggleToRerender: false };
  }

  handleRerenderChange() {
    this.setState({ toggleToRerender: !this.state.toggleToRerender})
  }

  render() {
    return (
      <div className='container'>
        <SongCreate handleRerenderChange={this.handleRerenderChange} />
        <SongList handleRerenderChange={this.handleRerenderChange} />
      </div>
      );
  }
};