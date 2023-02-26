const neo4jsession = require('./neo4j');
const postgresClient = require('./postgresql');

neo4jsession
    .run('MATCH (n) RETURN count(n)')
    .then((result) => {
        console.log(`Neo4j count : ${result.records[0].get(0)}`);
    })
    .catch((error) => console.error(error))
    .finally(() => {
        neo4jsession.close();
    });

postgresClient
    .query('SELECT COUNT(*) FROM follows')
    .then((result) => {
        console.log(`PostgreSQL count : ${result.rows[0].count}`);
    })
    .catch((error) => console.error(error))
    .finally(() => {
        postgresClient.end();
    });