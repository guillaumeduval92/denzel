const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb+srv://test:test@denzel-3i4vy.gcp.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Denzel";
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
var app = Express();
var database, collection;
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));


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


app.get("/movies/populate", async (request, response) => {
	const movies = await imdb(DENZEL_IMDB_ID);
	collection.insert( movies, (error, result) => {
		if(error) {
			return response.status(500).send(error);
		}
		response.send(result);
	});
});


app.get("/movies/search", (request, response) => {
	var metascore, limit;
	if (request.query.metascore != undefined){
		metascore = request.query.metascore;
	}
	else {
		metascore = 0;
	}
	if (request.query.limit != undefined){
		limit = request.query.limit;
	}
	else {
		limit = 0;
	}
	collection.aggregate([{$match: {metascore: {$gte: Number(metascore)}}}, {$sample: {size: Number(limit)}}, {$sort: {"metascore": -1}}]).toArray((error, result) => {
		if (error) {
			return response.status(500).send(error);
		}
		response.send(result);
	}); 
});


app.get("/movies", async (request, response) => {
	var query = {metascore: { $gt: 70 }};
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
	collection.findOne({"id": request.params.id}, (error, result) => {
		if(error) {
			return response.status(500).send(error);
		}
		response.send(result);
	});
});


app.post("/movies/:id", (request, response) => {
	collection.updateOne({"id": request.params.id}, {$set: {"date": request.body.date, "review": request.body.review}}, (error, result) => {
		if (error) {
			return response.status(500).send(error);
		}
	});
	collection.findOne({"id": request.params.id}, (error, result) => {
		if(error) {
			return response.status(500).send(error);
		}
		response.send(result);
	});
});