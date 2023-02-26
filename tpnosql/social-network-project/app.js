const express = require('express');
const {driver, closeNeo4jSession, insertUsersNeo4j, clearDatabase, insertUsersBatchNeo4j} = require('./neo4j');
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

// Insert users endpoint
app.post('/api/data/neo4j/insert/users/:numUsers', async (req, res) => {
    const numUsers = parseInt(req.params.numUsers);
    console.log(numUsers);
    /*await insertUsersNeo4j(numUsers);
    res.send(`Inserted ${numUsers} users into Neo4j`);*/
    // Call the function to insert all users in batches
    try{
        await insertUsersBatchNeo4j(numUsers);
        res.status(200).json({ message: 'Users created successfully' });
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error creating users' });
    }

    //     .then(() => {
    //         console.log(`Inserted all ${numUsers} users`);
    //         driver.close();
    //     })
    //     .catch(error => {
    //         console.error(error);
    //         driver.close();
    //     });
});

// Create follow relationships endpoint
app.get('/api/data/neo4j/create-follow/:numFollows', async (req, res) => {
    const numFollows = parseInt(req.params.numFollows);
    await createFollowRelationships(numFollows);
    res.send(`Created ${numFollows} follow relationships in Neo4j`);
});

// Create product relationships endpoint
app.get('/api/data/neo4j/create-product/:numProducts', async (req, res) => {
    const numProducts = parseInt(req.params.numProducts);
    await createProductRelationships(numProducts);
    res.send(`Created ${numProducts} product relationships in Neo4j`);
});


// define a route for retrieving the Neo4j database count
app.get('/api/data/neo4j', async (req, res) => {
    const neo4jSession = driver.session();
    await neo4jSession.run('MATCH (n) RETURN count(n) AS count')
        .then(r => {
            const count = r.records[0].get('count').toNumber();
            res.json({ count });
        }).catch(error => {
            console.log(error)
        })
        .then(async () => await neo4jSession.close())
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

// define a route for retrieving the Postgres database count
app.get('/api/data/postgres', async (req, res) => {
    /*client.connect();
    await client.query('SELECT COUNT(*) FROM user') // your query string here
        .then(result => {
            console.log(result);
            const count = result.rows[0].count;
            res.json({ count });
        })
        .catch(e => console.error(e.stack))
        .then(() => client.end());*/


    /*const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'tpnosql',
        password: 'nosoroot',
        port: 5432,
    });
    const result = await pool.query('SELECT COUNT(*) FROM user');
    const count = result.rows[0].count;
    res.json({ count });
    await pool.end();*/

   /* var db = require('./postgresql');
    var pool = db.getPool();
    const result = await pool.query('SELECT COUNT(*) FROM user');
    const count = result.rows[0].count;
    res.json({ count });*/
    //await pool.end();




});

app.get('/api/data/postgres/users', getUsers);


app.listen(3000, () => console.log('Server running on port 3000'));
