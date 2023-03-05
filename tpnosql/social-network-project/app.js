const express = require('express');
const {closeNeo4jSession, clearDatabase, addOrdersToUsers, addProductsToNeo4j, addFollowsToUsers, insertUsersBatchNeo4j,
searchNeo4j} = require('./neo4j');
const { insertUsers, getUsers } = require('./postgresql');


const app = express();
const cors = require('cors');
app.use(cors());


/**NEO4J**/

app.get('/api/close-neo4j-session', closeNeo4jSession);

app.get('/api/data/neo4j/clear',  async (req, res) => {
    try{
        await clearDatabase();
        res.status(200).json({ message: 'Neo4J database cleared' });
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error clearing database' });
    }
});

/*SEARCH*/
app.get('/api/data/neo4j/query1', async (req, res) => {
    try{
        const result = await searchNeo4j(1,2, undefined);
        res.status(200).json({ message: `Found ${result.length} products`});
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error clearing database' });
    }
});

app.get('/api/data/neo4j/query2', async (req, res) => {
    try{
        const result = await searchNeo4j(1,5, 7099);
        res.status(200).json({ message: `Found ${result.length} products`});
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error clearing database' });
    }
});

app.get('/api/data/neo4j/query3', async (req, res) => {
    try{
        const result = await searchNeo4j(undefined,0, 7099);
        res.status(200).json({ message: `Found ${result.length} users`});
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error clearing database' });
    }
});

/*INSERT*/
// Insert users endpoint
app.post('/api/data/neo4j/insert/users/:numUsers', async (req, res) => {
    const numUsers = parseInt(req.params.numUsers);
    console.log(numUsers);
    try{
        await insertUsersBatchNeo4j(numUsers);
        res.status(200).json({ message: 'Users created successfully' });
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error creating users' });
    }
});


// Insert products endpoint
app.post('/api/data/neo4j/insert/products/', async (req, res) => {
    try{
        await addProductsToNeo4j();
        res.status(200).json({ message: 'Products created successfully' });
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error creating products' });
    }
});

// Insert orders endpoint
app.post('/api/data/neo4j/insert/orders/', async (req, res) => {
    try{
        await addOrdersToUsers();
        res.status(200).json({ message: 'Orders created successfully' });
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error creating orders' });
    }
});

// Insert follows endpoint
app.post('/api/data/neo4j/insert/followers/', async (req, res) => {
    try{
        await addFollowsToUsers();
        res.status(200).json({ message: 'Followers created successfully' });
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error creating followers' });
    }
});


/**POSTGRES**/

app.post('/api/data/postgres/insert/:numUsers', async (req, res) => {
    const { numUsers } = req.params;

    try {
        await insertUsers(numUsers);
        res.status(200).send(`Inserted ${numUsers} users into the database.`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error.');
    }
});

app.get('/api/data/postgres/users', getUsers);


app.listen(3000, () => console.log('Server running on port 3000'));
