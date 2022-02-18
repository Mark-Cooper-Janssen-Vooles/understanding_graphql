import React from 'react';
import ReactDOM from 'react-dom';
// import { Router, Route, hashHistroy, IndexRoute } from 'react-router';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import SongList from './components/SongList';
import App from './components/App';

const client = new ApolloClient({});

const Root = () => {
  return (
    // <ApolloProvider client={client}>
    //   <Router history={hashHistroy}>
    //     <Route path="/" component={App}>
    //       <IndexRoute component={SongList} />
    //     </Route>
    //   </Router>
    // </ApolloProvider>

    <ApolloProvider client={client}>
      <SongList />
    </ApolloProvider>
  );
};

ReactDOM.render(
  <Root />,
  document.querySelector('#root')
);
