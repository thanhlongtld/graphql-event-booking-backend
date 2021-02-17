const express = require("express")
const bodyParser = require("body-parser")
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")
const mongoose = require("mongoose")

const Event = require("./models/event")

const app = express()

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
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date)
                })
                return event
                    .save()
                    .then((result) => {
                        console.log(result)
                        return { ...result._doc }
                    })
                    .catch((err) => {
                        console.log(err)
                        throw err
                    })
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
