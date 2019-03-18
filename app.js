const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const CONNECTION_URL = "mongodb+srv://test:test@denzel-3i4vy.gcp.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Denzel";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(9292, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("Movies");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});


const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';


app.get("/movies/populate", async (request, response) => {
	const movies = await imdb(DENZEL_IMDB_ID);
    collection.insert( movies, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});


app.get("/movies", async (request, response) => {
	var query = { metascore : { $gt: 70 }};
	var n = await collection.countDocuments(query);
	var r = await Math.floor(Math.random() * n);
    collection.find(query).limit(1).skip(r).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});


app.get("/movies/:id", (request, response) => {
    collection.findOne({ "id": request.params.id }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

/*
app.get("/movies/search", (request, response) => {
    collection.findOne({ "id": request.params.id }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});
*/