finished code can be found here: https://github.com/StephenGrider/GraphQLCasts


# GraphQL and Apollo

- What is graphQL
- A REST-ful routing primer
- On to GraphQL
  - setting it up with express
  - writing a schema
  - root queries
  - resolving 
  - graphiQL tool
- Fetching Data with Queries
- The GraphQL Ecosystem
  - front end libraries 
  - back end libraries
- Clientside GraphQL
- Gotchas with Queries in React 
- Frontend mutations
- Automatic Data Caching
- React Router + GraphQL
- More on Client side Mutations
- Building from (Mostly) scratch (haven't done this or below yet)
- Moving Client side 
- Handling Errors Gracefully
- Extras

---

## What is graphQL

tldr:
GraphQL lets you ask for what you want in a single query, saving bandwidth and reducing waterfall requests. It also enables clients to request their own unique data specifications.

longer version: 
Before there was GraphQL, there was REST.

In recent years, REST has become the dominant API style for building backend web services. With REST, you could signal the type of request we want to make (ex: GET, POST, PUT, or DELETE) and the resource we’d like to fetch or interact with (ex: /api/pets/1) using an HTTP method and a URL.

GraphQL has strictly-typed interfaces where REST APIs have much looser ones.

It’s a great approach (and one we initially used at StockX for several years). But REST comes with some downsides like:

Over-fetching
Multiple requests for multiple resources
Waterfall network requests on nested data
Each client need to know the location of each service
Then came GraphQL: a server-side runtime and query language for your API.

---

## A REST-ful routing primer

GraphQL was built to solve a very specific set of problems

TLDR: restful routing with highly-related data starts to get very challenging. This is what GraphQL is aiming to fix. 

REST-ful routing: Given a collection of records on a server, there should be a uniform URL and HTTP request method used to utilize that collection of records. i.e: 
- 'URL' of /posts could have 'method' of POST with the operation of creating a new post 
- 'URL' of /posts could have 'method' of GET with operation of fetch all posts
- 'URL' of /posts/14 could have 'method' of GET to fetch post 14
- 'URL' of /posts/15 could have 'method' of PUT to update post 15
- 'URL' of /posts/18 could have 'method' of DELETE to delete post 18
- 'URL' of /name/:id is a more generic way.

to deal with relations, i.e. lets say users will have blog posts, something like this: 
- 'URL' of /users could have 'method' of POST with the operation of creating a new user
- etc, all of the above. So we'd have a new controller for users

then get rid of the original controller for posts and instead we'd also have:
- /users/23/posts with 'method' of POST to create a post associated with user 23
- etc, all of the above. we'd nest them 


What if we nest further? Shortcomings of RESTful routing
i.e. the current user has friends who work at a company (with its own schema / table) with a position (with its own schema / table)
- /users/23
- /users/23/friends
- ???
- /users/23/friends/1/company/1 => doesn't include position 
- /users/23/friends/1/positions/2 => doesn't include company

One option:
- /users/1/companies
- /users/1/positions
Downside to above solutions is that we'd be making lots of seperate HTTP requests to our backend server to get this data

Another option:
- /users/23/friends/companies
- /users/23/friends/positions
Downside to these endpoints is they're very particular / customised. We've got to make lots of endpoints doing this. 

Final option: 
- /users/23/friends_with_companies_and_positions
Above endpoint fetches all the friends with all the companies and positions: fetches massive amount and breaks restful conventions

In conclusion, these conventions start to break down when we're working with highly related issues: too many HTTP requests, or very customised tightly-coupled endpoints 

---

## On to GraphQL

#### What is GraphQL?

- Example query
````js
query { // tells graphQL we want to make a query
  user(id:"23") { // we want to find user with id 23
    friends() { // we tell graphQL we want to find all of users 23 friends
      company { // we want the companies associated with the friends
        name // we want it to return the company name
      }
    }
  }
}
````

#### Working with GraphQL

GraphiQL is a front end app created by the GraphQL team to help us view whats going on more easily. 
Looks something like: GraphiQL <---> Express/GraphQL server <---> dataStore

create new 'users' folder, `npm install --save express express-graphql graphql lodash`
express-graphql lets express and graphql talk to each other. 

#### Registering GraphQL with Express

Express is a HTTP server, a users browser does a HTTP request over to our express server, that processses it, and sends a response back to the users browsers. 

Web page => Request => Express => if asking for graphQL => GraphQL => Response => back to web page. 

GraphQL is just one portion of the express app and only used if the request is specifically a graphQL one. Express can also have authentication, other REST-based APIs etc. 

by convention its always capital G and QL, i.e. expressGraphQL 

can now start our server in the users folder with `node server.js` and navigate to: http://localhost:4000/graphql , however it has the error "GraphQL middleware options must contain a schema."

#### GraphQL Schemas 

app.use is how to wire up middleware in express
'options must contain a schema', we've passed in graphiql: true, but no schema. 
GraphQL considers all of the data in our app like a graph, it needs to know what the data is like.

The schema file is the lynch-pin of every graphQL application

in users we make a new file called 'schema' and inside that 'schema.js' 

the schema file contains all the knowledge for telling graphQL what the applications data looks like. What properties each object has, and exactly how each object is related to each other:
- User (table)
  - id (Id)
  - firstName (string)
  - company_id (Id, relates to Company table) 
  - position_id (Id, relates to Position table)
  - users (array of Id's, the users friends)
- Company (table)
  - id (Id)
  - name (String)
  - description (String)
- Position (table)
  - id (Id)
  - name (string)
  - description (string)

#### Writing a GraphQL Schema 

````js
const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString
} = graphql;

// we'll use GraphQLObjectType to instruct graphQL of the presence of a user 
const UserType = new GraphQLObjectType({
  name: 'User', // required. always a string that defines the type are are defining, by convention we capitalise 
  fields: { // required & most important property. keys are the names of the properties that the user has.
    id: { type: GraphQLString}, // need to tell graphQL about what each type of data these fields are
    firstName: { type: GraphQLString},
    age: { type: GraphQLInt}
  }
});
````

#### Root Queries 

A root query allows us to jump in to our graph of data. 
Think of root query being an 'entry point' into our GraphQL query or data.

````js
// purpose of this is to allow graphQL to jump and land in a very specific area of our data
// below code says: you can ask me, the rootQuery, about users in the app. If you give the id of the user you're looking for, i'll return the user back to you. 
const RootQuery = new GraphQLObjectType({ 
  name: 'RootQueryType', 
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) { 
        // resolve functions purpose is to say "You're looking for user of id 23, ill try ot find it"
        // resolve function goes into DB and tries to find the data we're looking for.

        // parentValue is notorious for not really ever being used. 
        // args gets called with whatever arguments passed into the original query, i.e. the id of the user. 

      }
    }
  }
});
````

#### Resolving with Data

````js
const RootQuery = new GraphQLObjectType({ 
  name: 'RootQueryType', 
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) { 
        // lodash walks through list of users, and finds and returns the first user with an id or args.id
        // must return the user object
        return _.find(users, { id: args.id });
      }
    }
  }
});

// graphQLSchema takes in a rootQuery and returns a graphQL schema instance 
module.exports = new GraphQLSchema({
  query: RootQuery
});
````

in server.js import the schema and then use it in the middleware: 
````js
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true // allows us to make queries against our development server
}));
````

refreshing localhost:4000/graphql and you now get the graphiQL interface in the browser! 

#### The GraphiQL Tool 

A tool provided to us by the express-graphql library 
on the left we can enter graphQL queries, press play, and see the results pop-up on the right. 
"Docs" is a documentation explorer, automatically populated when we add more queries. 

Writing the schema file is probably 50% of everything going on with graphQL. the other 50% is writing queries 

on the left we added this: (it looks like javascript, but it is not)
````js
{
	user(id: "23") {
    id, 
    firstName,
    age
  }
}
````
the above code:
- asks graphQL to look through users, with ID of 23
- when thats found, we then ask for the id, firstName and age to be returned. 

hit play, and it returns: 
````json
{
  "data": {
    "user": {
      "id": "23",
      "firstName": "Bill",
      "age": 20
    }
  }
}
````

What happens:
- we're saying user with id of 23 - this is handled in schema.js by the rootQuery
  - which has a user field that accepts args of string for the id. 
- then in the rootQuery we're specifying we want to resolve the user with this id
  - in the rootQuery resolve, it returns a raw javascript object. We didn't need to coerce it. That gets handled by graphQL. 
- on the left we added id, firstName and age, meaning we only want those values to be returned
  - if you remove the firstName, you will no longer get that back in the response. 
    - this plays into one of the shortcomings of restful routing (over fetching data)

if you try to find a user that doesn't exist, we get back 
````json
{
  "data": {
    "user": null
  }
}
````
if we don't pass an argument, i.e. no id, we'll get an error 


#### A Realistic Data Source

One approach: 
- GraphiQL <---> Express/GraphQL server <---> dataStore

Another approach used by big companies i.e. facebook:
- GrapiQL <---> Express/GraphQL server <----> outside server #1 <---> database 
                                       <----> outside API
                                       <----> outside server #2 <---> database
- we'll use json-server to do this 

#### Async Resolve Functions

all data fetching we'll do inside node is async in nature, so we'll nearly always need return a promise from the resolve function. Need to make HTTP request and return the promise that it generates, in the resolve. 

````js
const RootQuery = new GraphQLObjectType({ 
  name: 'RootQueryType', 
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) { 
        return axios.get(`http://localhost:3030/users/${args.id}`) // now we're hosting it using json-server
          .then(response => response.data); // just because axios nests it in a data object as well 
      }
    }
  }
});
````

because resolve returns a promise, we can use it to fetch any piece of data we can imagine

#### Nodemon Hookup

not graphql related, this will just enable us to automatically restart our server after a change 
`npm install --save nodemon` and add the npm script `"dev": "nodemon server.js"`

#### Company Definitions

hooking up relating a company to a user
- add companies to db.json (represents companies table)
- add companyId to users
- when you go to json server now, its set up relations. i.e. http://localhost:3030/companies/2/users/ now shows all the companies with id 2 that have users associated with them (i.e. a companyId of 2)

---

## Fetching Data with Queries 

#### Nested Queries 

getting the company associated with the user: 
````js
// important you define companyType above userType
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString }
  }
})

const UserType = new GraphQLObjectType({
  name: 'User', 
  fields: {
    id: { type: GraphQLString},
    firstName: { type: GraphQLString},
    age: { type: GraphQLInt},
    company: { 
      type: CompanyType, // why are we able to call this 'company' not 'companyId' ? it gets handled in resolve below.
      resolve(parentValue, args) {
        console.log(parentValue, args); 
        // above parent value is the user we just fetched, it prints: { id: '23', firstName: 'Bill', age: 20, companyId: 1 }

        return axios.get(`http://localhost:3030/companies/${parentValue.companyId}`)
          .then(res => res.data);
      } 
    }
  }
});
````

to teach graphQL how to populate the 'company' field, we use the resolve function. 
in graphiQL we can now ask it this: 
````js
{
	user(id: "23") {
    firstName,
    company {
			id,
      name,
      description
    }
  }
}
````
and it returns info on the company id, name, description. 


#### A Quick Breather

What happens when we make a query: 
- find me a user with ID 23 
- query goes to Root Query with args object of id 23
  - resolve(null, { id: 23}) (ie. parentValue null, args is id: 23)
- root query points us now to the user with id 23
- then the query says we want to know about company, now the user resolve's function gets called
  - resolve(user23, {}) (ie. parentValue is the user23 object, args is empty)
  - resolve then returns us a promise of the company we're looking for
- the whole data structure is then returned 

best to think of schema / data as a bunch of functions that return references to other objects in our graph.
another way is to think that we're truly working with a graph. each relation would be its own resolve function, that is how they relate. 

#### Multiple RootQuery Entry points 

Currently we can provide a user's ID and get company info from that. But we cannot search directly for a company using the companys ID directly. 

````js
const RootQuery = new GraphQLObjectType({ 
  name: 'RootQueryType', 
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) { 
        return axios.get(`http://localhost:3030/users/${args.id}`)
          .then(response => response.data);
      }
    },
    company: { // we can add a company field just like we added a user
      type: CompanyType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3030/companies/${args.id}`)
          .then(response => response.data);
      }
    }
  }
});
````

#### Bidirectional Relations 

what if we want to search a user from a company? i.e.: 
````js
{
	company(id: "1") {
			id,
      name,
      description,
    	users {
        firstName
      }
  }
}
````
we would need to get a list of users, as one company can have many users. (but one user only one company)

json server gives us this by default: http://localhost:3030/companies/${args.id}/users

there is a circular dependency here because userType requires companyType and companyType requires userType - but which one do you define first?! we need to deal with 'closures' and 'closure scopes'. 

````js
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({ // wrapping fields with an arrow function turns fields object into an arrow function that returns an object, meaning function gets defined but not executed until after entire file has been read 
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType), // we need to tell graphQL that it'll be expecting a list of users
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3030/companies/${args.id}/users`)
          .then(res => res.data);
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User', 
  fields: () => ({ // also wrapped this one to avoid circular dependency
    id: { type: GraphQLString},
    firstName: { type: GraphQLString},
    age: { type: GraphQLInt},
    company: { 
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3030/companies/${parentValue.companyId}`)
          .then(res => res.data);
      } 
    }
  })
});
````

can now search grapgiQL using query: 
````js
{
	company(id: "2") {
			id,
      name,
      description,
    	users {
        id,
        age,
        firstName
      }
  }
}
````
note that you can recursively request info if you wanted (but you wouldn't, i.e. asking the company on the nested users object)

#### Query Fragments 

sometimes you might see queries written like; (it has the same behavior)
````js
query {
	company(id: "2") {
			id,
      name,
      description,
    	users {
        firstName
      }
  }
}
````

you can also name the query, which is useful when working on the frontend. You might have many queries, and you might want to reuse them.
i.e. in this case its called 'findCompany': 
````js
query findCompany{
	company(id: "2") {
			id,
      name,
      description,
    	users {
        firstName
      }
  }
}
````

the opening set of query braces, you can imagine that query is being sent to the rootQuery. Either user or company, and from there the result functions take over. 

we can ask for as many things from a single query as we like: 
````js
{
	company(id: "2") {
      name,
  }

  company(id: "1") { // this won't work, as we've got two company fields. to get around this, need to name them
      name,
  }
}
````

because the response key from GraphiQL is 'company', we need to name them, i.e: 
needs this: 
````js
{
	apple: company(id: "2") {
      id,
      name,
      description
  }

  google: company(id: "1") { 
      name,
      name,
      description
  }
}
````

now the result is:
````json
{
  "data": {
    "apple": {
      "id": "2",
      "name": "Google",
      "description": "search"
    },
    "google": {
      "name": "Apple",
      "description": "iphone"
    }
  }
}
````

The use of Query Fragments: 
the above has id, name and description written out twice. to solve this, we can make use of query fragments. 
a query fragment is a list of different attributes we want to get access to.

````js
{
	apple: company(id: "2") {
      ...companyDetails
  }

  google: company(id: "1") { 
      ...companyDetails
  }
}

// this is the query fragment
fragment companyDetails on Company { // we say 'on Company' for type checking, that company has these fields
  id
  name
  description
}
````

you see fragments more commonly on the frontend 


#### Introduction to Mutations

How to use graphQL to modify the data stored on our server by using mutations 
Delete, update, create!

Mutations are notorious in graphQL for being difficult to work with 

json server has the ability to be edited by RESTful conventions. i.e. if we post data to /companies, that will add some data. if we DELETE to /users/1, it can delete the user. 

GraphQL Schema
- Query <---> root Query <---> userType || CompanyType 
- Mutation <---> mutations <---> addUser || deleteUser

we'll set up mutations in a similar fashion as the existing query.


the fields on the mutation describe the operations that the mutation is going to take:
````js
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      addUser: {
        type: UserType, // the type of data we'll return from the resolve function. sometimes with a mutation the type you operate on and the type you return might not be the same. but it is for adding a user.
        args: {
          firstName: { type: new GraphQLNonNull(GraphQLString) }, // can't be null
          age: { type: new GraphQLNonNull(GraphQLInt) }, // can't be null
          companyId: { type: GraphQLString }
        },
        resolve(parentValue, { firstName, age }) {
          return axios.post(`http://localhost:3030/users/`, { firstName, age }) // second arg is just axios method of sending data
            .then(res => res.data);
        }
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation // need to add it here too
});
````

refresh graphiQL and you should see mutation added 
calling a mutation has a different syntax than queries. 
````js
mutation { //we must add keyword 'mutation' at the front
  addUser(firstName:"MrBean", age:35) {
    // whenever we call a mutation, we must add curly braces and call some information coming back off of it 
    // kinda awkward
    id
    firstName
    age
  }
}
````
which returns: 
````json
{
  "data": {
    "addUser": {
      "id": "rz70yXH", // this id is generated by json server
      "firstName": "MrBean",
      "age": 35
    }
  }
}
````

#### Delete Mutation 

adding delete mutation: 
````js
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, { firstName, age }) {
        return axios.post(`http://localhost:3030/users/`, { firstName, age })
          .then(res => res.data);
      }
    },
    deleteUser: { // new mutation here
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3030/users/${id}`)
          .then(res => res.data);
      }
    }
  }
})
````
and call it in graphiQL:
````js
mutation {
  deleteUser(id:"41") {
    id
  }
}
````
responds with: 
````json
{
  "data": {
    "deleteUser": {
      "id": null
    }
  }
}
````
graphQL failed to return the id of the user that deleted, because of how json server works. i.e. when user is deleted, json server just doesn't respond with info on the user that was deleted. 

graphQL always expects to get back useful data from resolve function (awkward part of graphQL), but we can't instruct it to not expect anything back. 

#### Edit Mutation

````js
// inside mutation: 
  editUser: {
    type: UserType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      firstName: { type: GraphQLString },
      age: { type: GraphQLInt },
      companyId: { type: GraphQLInt }
    },
    resolve(parentValue, { id, firstName, age, companyId }) {
      return axios.patch(`http://localhost:3030/users/${id}`, { firstName, age, companyId })
        .then(res => res.data);
    }
  }
````

facebook famously has their entire schema in one file. 
we can let schema file get large, but will break it up in future apps. 


---

## The GraphQL Ecosystem

the goal is to get familiar with the different libraries using graphQL on the frontend 

if you fire a request using graphiQL you can look in network tab and see the response, its the exact json object we get back. 
similarly if you look at the the request payload, its an exact string of what we entered into our graphiQL website. 

With all the different graphQL clients we can use, they all speak the same language over the wire (the same request and response message format)

Instead of:
- GraphiQL <---> GraphQL Query <---> Express/GraphQL Server <---> Datastore 
We'll have:
- React + GraphQL Client <---> GraphQL Query <---> Express / GraphQL Server <---> Datastore

React and GraphQL Client will be  tightly coupled.
The GraphQL Client will be doing exactly what GraphiQL is doing 



Three big clients (frontend) in use today in javascript and graphQL world. JS clients (used inside of the browser - not backend)
- Lokka
  - easiest - simple as possible, basic queries / mutations. some simple caching. Similar to GraphiQL
- Apollo Client
  - biggest fullstack uses of graphQL, called "the apollo stack" (has a backend graphQL server, and apollo client which runs in frontend)
  - Produced by the same guys as Meteor JS. Good balance between features and complexitiy
- Relay
  - Amazing performance for mobile. By far most insanely complex
  - used by FB team
  - very very complicated, especially when it comes to mutations. 


***Sidenote - Apollo Server vs GraphQL server***

We'll use a graphQL technology for backend as well. 
I.e. we've been using express-graphQL so far. 

GraphQL Express example: 
````js
// i.e. from our schema in ./users: 
const UserType = new GraphQLObjectType({
  name: 'User', 
  fields: () => ({
    id: { type: GraphQLString},
    firstName: { type: GraphQLString},
    age: { type: GraphQLInt},
    company: { 
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3030/companies/${parentValue.companyId}`)
          .then(res => res.data);
      } 
    }
  })
});
````
Apollo Server example:
````js
// types file:
type User {
  id: String!
  firstName: String
  age: Int
  company: Company
}

type Company: {
  id: String!
  name: String
  employees: [User]
}

// resolvers file:
const resolveFunctions = {
  Query: {
    users() {
      return users;
    }
  }
} 
````

Neither of above are better than the other. 
GraphQL EXpress uses one big schema file that defines the type information and the resolve logic
Apollo breaks up that info into two files: a "types" file and a "resolvers" file 

---

## Clientside GraphQL

in our backend: express / node / database (we just did this)
this section is frontend: using react / apollo-client. 
section 3 will be both. 

### Starter pack walkthrough 

referring to 'lyrical-graphql-master' folder
it has client (react and js) and server (done for us - has schema file) folder. schema files are broken up.

app is a 'song writing application'
holds a bunch of songs (Song index page)
songs hold a collection of lyrics (song detail page)
a collaborative song-writing app

Created mongoDB account: https://cloud.mongodb.com/v2/61e9e841b54aca702be9e320#clusters/connect?clusterId=graphQL-Tutorial
created user and password (in .env file only locally) - used xero email

### Working through the schema 

mutations:
- 'addSong' takes arg of title 
- 'addLyricToSong' takes arg of content and song id 
- 'likeLyric' takes id of lyric
- 'deleteSong' takes song id

root query:
- 'songs' returns list of all the songs
- 'song' returns one song, takes arg of id
- 'lyric' returns one lyric, takes arg of id

````js
// add a song
mutation {
  addSong(title: "Cold Nights") {
    id
  }
}
// add a lyric to above song
mutation {
  addLyricToSong(
    content:"Is so cold", 
    songId:"61e9fabb1e41f5fe261121df"
  ) {
    id // returns the id of the song modified, not of the lyric added.
  }
}
// query all songs and lyrics
{
  songs {
    id
		title
    lyrics {
			content
    }
  }
}
````

you can then go to the mongoDB website and see the lyrics and songs in the db. 


### Apollo client setup 

open index.js in client folder, we've got component 'root' 

we'll wrap react component in apollo client library. 

Apollo provider wraps our react app <---> apollo store <---> graphQL server
- Apollo store is what communicates with graphQL server and stores data that comes back from it. Exists on the client-side (frontend!). A repository from what comes from graphQL server. 
- Apollo store doesn't care about what frontend framework we use (it doesnt care we're using react)
- Integration between apollo store and our react app is the apollo provider. The provider takes data from apollo store and injects it into our react app. 
- Most config is in the apollo provider. 

ApolloClient is what interacts with our graphQL on the backend (ie. apollo store)

Below is minimal setup for apollo:
````js
import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient from 'apollo-client'; 
import { ApolloProvider } from 'react-apollo';

// this assumes graphql server is on /graphql route (set in server/server.js line 25)
// may need to add options if not
const client = new ApolloClient({});

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <div>lyricall</div>
    </ApolloProvider>
  );
};

ReactDOM.render(
  <Root />,
  document.querySelector('#root')
);
````


#### React Component Design 

A song Index page, a list of songs you can click on
Goes to a Song Detail page, which has a LyricList, a LyricCreate (and you can like the lyrics)

#### GQL Queries in React

GraphQL + React Strategy: 
1. Identify Data requried
2. Write Query in Graph(i)QL (for practice) and in component file
3. Bond Query + component
4. Access Data 

On "Song Index Page" all we'll need to know is the title of each song (i.e. 1)

1. for the songList page, we just need the title 
2. this provides the information we need, when used on localhost:4000/graphql (note i need to be on the VPN or mongodb says my IP isn't authenticated)
````js 
{
  songs {
    title
  }
}
````
3. the graphql search syntax is not JS, so we need to use a library: 
````js
import gql from 'graphql-tag'; // helps us to write queries inside of a component file
// looks like: 
const query = gql`
  {
    songs {
      title
    }
  }
`;

// to bond query and component together: 
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

var SongList = (props) => {
  console.log(props) //this logs out two objects, the second one has songs. first one has 'loading: true'

  return (
    <div>
      SongList
    </div>
  )
}

const query = gql`
  {
    songs {
      title
    }
  }
`;

export default graphql(query)(SongList); // works similar to redux 
````

Bondng query and component: 
- Render component to screen (without data)
- Query we wrote will be executed to backend server to fetch data (async process)
- Query complete
- Rerender component with data


Accessing the data comes on the props.data object. It will first be loading, then in a loaded state return data. Can do something like this:

````js
var SongList = (props) => {
  console.log(props.data);
  const { loading, songs } = props.data;

  const renderSongs = () => {
    if (!loading) { // check for loading here
      return songs.map(song => {
        return (
          <li key={song.id} className="collection-item">
            {song.title}
          </li>
        )
      })
    }
  }

  if (loading) { // if loading still, return another element
    return <div>Loading...</div>
  }

  return (
    <ul className="collection">
      {renderSongs()}
    </ul>
  )
}
````

#### Query Params 

How can we hook up our components form input data with the mutation / query? 
In graphiql (localhost:4000/graphql) we can test it out too. 

Think of mutation like a function - we'll pass something to it. 
"Query variables" injects a variable from outside the query into the query (or mutation).

````js
// normally we'd call a mutation like this:
mutation {
  addSong(title: "Some title") {
    id
    title
  }
}

// but when we want the component to pass some data from the forum: 

// we've named the mutation 'addSong' (Can be anything - named for our personal use) - imagine the function is called 'addSong', and when you call it it calls the addSong mutation
mutation AddSong($title: String) { // inside the mutation, can refer back to $title - a variable of sorts.
  addSong(title: $title) {
    id
    title
  }
}

// in graphiql, you'd need to pass this as the query variable:
{
	"title":"Sprite vs Coke" //we do not use the $ here
}
````

#### Defining Query Variables in React 

````js
import { graphql } from 'react-apollo'; // first import this

export default graphql(mutation)(SongCreate); // connect the component to graphql and the mutation 

// we now have access in the state to 'this.props.mutate' 
// we pass mutate an object with the variables we want to send
onSubmit(event) {
  event.preventDefault();

  this.props.mutate({
    variables: {
      title: this.state.title
    }
  }).then(() => ) // we can also add a .then if we want, to do something if its successful. i.e. to navigate on successful submission (what he does)
    .catch(() => ) // or a .catch if it fails, i.e. if we want to handle validation errors
}

````


#### Troubleshooting list fetching 


cold cache: create song => run query => songs fetched 
warm cache: fetch songs => songs 2,3,4 fetched =>create song 5 => already fetched query, no need to fetch again => render songs 2,3,4

warm cache needs to re-fetch! 

To do this:
=> In songList.js we have our initial list-fetching query written using the gql`` syntax. We will export this into its own file inside a src/queries folder and hook it back up again, calling it 'fetchSongs'
=> in songCreate.js: 

````js
  onSubmit(event) {
    event.preventDefault();

    this.props.mutate({
      variables: { title: this.state.title },
      refetchQueries: [{ query: fetchSongs }] // once we mutate, we now use the refetchQueries object and pass it the query we exported above 'fetchSongs'. We can also pass variables here like above, if the query needs them. i.e.: 
      // [{ query: fetch songs, variables: { someVariable: this.state.someVariable }}]
      // and we can also refetch multiple queries.
    })

    this.setState({title: ''})
  }
````

the big reminder: Whenever we insert an item using a mutation into a list of data, we might have to re-fetch the data that list is associated with. 

Re-loading a component does not equal refetching from graphql! 


#### Deletion by Mutation

````js
// in songList, 
const mutation = gql`
  mutation DeleteSong($id: ID) {
    deleteSong(id: $id) {
      id
    }
  }
`;

// however we've already got: 
export default graphql(fetchSongs)(SongList);

// how can we have two associated queries / mutations to the one component, SongList? 
// (for this version of graphql), need to call it twice:
export default graphql(mutation)(
  graphql(fetchSongs)(SongList)
);
````

#### Alternate approach for refetching data 

````js
// in songList.js
onSongDelete(id) {
  this.props.mutate({ variables: { id } })
  .then(() => this.props.data.refetch());
}
````

we couldn't use this previously in songCreate.js - because the query for songList was not associated with the songCreate component, it was associated with songList.js (i.e. it was called in songList) - it has no idea that the query exists. 

#### Fetching Individual Records

````js
query findSong($id: ID!) { // the ! means the argument must be provided
  song(id: $id) {
    title
  }
}
````

when trying to connect this with a component, it differs as it has a required field (id) and queries are executed automatically, unlike the mutation above which was execuded manually, i.e. on click (so we could easily pass it a variable). 

When you connect it, it needs to look something like this: 

````js

export default graphql(query, {
  options: (props) => { return { variables: { id: props.id }}} // whatever is on the props can be used here
})(SongDetail);

````

===

#### The createLyric Mutation

````js
const mutation = gql`
  mutation AddLyricToSong($content:String, $songId: ID) {
    addLyricToSong(content:$content, songId:$songId) {
      id
      lyrics {
        content
      }
    }
  }
`;
````

===

#### Enhancing queries 

We have SongDetail which has a graphql query which gives us the id and the title. 
We have also now added the LyricList component which is a child of SongDetail, and it requires a list of lyrics associated with the song. 

Graphql is good here - we don't have to go and create another query for LyricList, we can simply enhance the query in SongDetail to also return lyrics and pass them down to SongDetail. Using a standard API we'd have to go into the backend and make changes to get this same functionality. 

===

#### Identifying Records 

When we submit a lyric the list of lyrics is not refreshing by default. 
We can (apparently) get this working using the old technique. 

How is apollo storing data internally? 
Apollo Store (or apollo client, created in index.js) has internal buckets of data => internal list of songs and list of lyrics. 
It knows how to go and fetch data from our graphql server, and then stores the data into one of these buckets. 

Apollo store knows which bucket to place the data in because it knows what type they are. i.e. "__typename: "LyricType" can be seen in network tab. 

Shortcoming: Apollo has no idea about what data / properties exist inside of Songs and Lyrics. It can see that theres 4 lyrics coming back, but only renders 3. Because it doesn't know what properties exist inside the Song (in this case, the lyrics array)

To fix this issue you can configure the apollo client. One way is to give it the id. It will allow apollo to bond with the react components much more easily. 

We want: 
Fetch list of lyrics => Create a new lyric => refetch entire song + lyrics => apollo sees song 5 updated => apollo rerenders components 

````js
// original code: 
const client = new ApolloClient({});

// new: 
const client = new ApolloClient({
  dataIdFromObject: o => o.id
});

// this takes every piece of data fetched by apollo-client from the backend, and runs it through this function.
// whatever is returned from this function is used to identify that piece of data inside of the apollo client/store. 
````

Ramifications of doing this: 
When we use the id off of every record, whenever we make a query, we have to make sure we ask for the id of every record of every query we put together. 

When you use the refetch queries technique, i.e.: 
````js
    this.props.mutate({
      variables: { title: this.state.title },
      refetchQueries: [{ query: fetchSongs }]
    })
````
we actually do the mutation and then to the fetch query, so it does two requests. When we use the dataIdFromObject caching system, only a single request is needed.


====

#### The Like Mutation 


Every time you run this mutation it just increments the number of likes. (graphql docs say this, its set this way in the server)
````js
mutation LikeLYric($id: ID) { // $id is the name of the variable being passed as a query variable, ID is the type 
  likeLyric(id: $id) { // id is the name of the variable, $id is the value being passed.
    id
    likes
  }
} 
````

Steps: 
1. define mutation (or query) in browser, graphiql, to confirm working: http://localhost:4000/graphql
2. use gql syntax and write query in the component its used in 
````js
  const mutation = gql`
    mutation LikeLyric($id: ID) {
      likeLyric(id: $id) {
        id
        likes
      }
    } 
  `;
````
3. connect it to graphql at the default export 
````js
export default graphlql(mutation)(LyricList);
````
4. call the mutation in the code:
````js
  onLike(id) {
    this.props.mutate({
      variables: { id }, 
    })
  }
````

===


#### Optimistic UI Updates 

When you hit the like button, there is a brief moment before the UI updates an increments the likes. This is because it needs to get the data back from the request again. 

To make this instant, apollo has support for this out of the box with a system it calls "optimisic updates" or "optimistic responses" 

Call mutation => Guess at response => UI updates => .... waiting a moment => response comes back => UI updates

In this case, once a lyric is liked, we expect to see an object returned like: { id: "23234", likes: 5, __typename: "LyricType" }, where the likes is the existing likes +1. It should be the only thing changed. So we can guess at the response. 

````js
  onLike(id, likes) {
    this.props.mutate({
      variables: { id }, 
      optimisticResponse: {
        __typename: 'Mutation',
        likeLyric: {
          id: id,
          __typename: 'LyricType',
          likes: likes + 1 // this is the optimisic part.
        }
      }
    })
  }
````

if the guess at response is wrong, then there will be a small delay (where the guess appears) shortly overwritten by the actual happenings. I.e. if your optimisticResponse is "likes + 10" and you click on something which has 5 likes: it will first become 15, then as the actual response comes in it will change to 6. 

