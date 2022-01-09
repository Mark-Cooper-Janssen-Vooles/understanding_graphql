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
- Clientside GraphQL
- Gotchas with Queries in React 
- Frontend mutations
- Automatic Data Caching
- React Router + GraphQL
- More on Client side Mutations
- Building from (Mostly) scratch
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
