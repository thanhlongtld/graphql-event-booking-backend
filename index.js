const express = require("express")
const bodyParser = require("body-parser")
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")
const mongoose = require("mongoose")

const app = express()

const events = []

app.use(bodyParser.json())
app.use(
    "/graphql",
    graphqlHTTP({
        schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
        rootValue: {
            events: () => {
                return events
            },
            createEvent: (args) => {
                const event = {
                    _id: Math.random().toString(),
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: args.eventInput.date
                }
                events.push(event)
                return events
            }
        },
        graphiql: true
    })
)

mongoose
    .connect("mongodb://localhost:27017/test", { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        console.log("Connected to db")
        app.listen(3000, () => {
            console.log("Listen on port 3000")
        })
    })
    .catch((err) => {
        console.log(err)
    })
