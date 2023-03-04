const neo4j = require('neo4j-driver');
const faker = require("faker");
const {session} = require("neo4j-driver");
const fs = require('fs');
const path = require('path');

const batchSize = 10000;
const insertUserQuery = 'CREATE (:User {id: $id, name: $name})';
const insertFollowsQuery = `MATCH (a:User),(b:User)
                            WHERE a.id = $userId AND b.id = $followUserId
                            CREATE (a)-[:Follows]->(b)`;


// Define the Cypher query to create the follow relationships
const followsQuery = `
LOAD CSV WITH HEADERS FROM "file:///follows.csv" AS row
MATCH (a:User {id: row.user_id}), (b:User {id: row.follower_id})
CREATE (a)-[:FOLLOWS]->(b)
`;

const driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic('neo4j', 'password')
);


// Create a function to insert all users in batches
async function insertUsersBatchNeo4j(numUsers) {
    const session = driver.session();
    const batchSize = 1000;
    const numBatches = Math.ceil(numUsers / batchSize);
    console.log(numBatches);
    const startTime = performance.now();
    let id = 0;

    for (let i = 0; i < numBatches; i++) {
        const batch = [];
        for (let j = 0; j < batchSize; j++) {
            const name = faker.name.findName();
            batch.push({id, name});
            id ++;
        }

        const params = {
            batch: batch
        };

        await session.run(`
          CALL apoc.periodic.iterate(
            "UNWIND $batch as row
             CREATE (u:User {id: row.id, name: row.name})",
            "RETURN count(*)",
            {batchSize: ${batchSize}, params: $params}
          )
        `, {params: params});
    }
    console.log("last id:"+id);
    const endTime = performance.now();
    console.log(`Inserted ${numUsers} users into the Neo4j database in ${(endTime - startTime)/1000} seconds.`);

    await session.close();
}



async function insertFollowsInBatches(session, follows, batchSize) {
    const numBatches = Math.ceil(follows.length / batchSize);
    for (let i = 0; i < numBatches; i++) {
        const batch = follows.slice(i * batchSize, (i + 1) * batchSize);

        const params = {
            batch: batch
        };

        await session.run(`
          CALL apoc.periodic.iterate(
            "UNWIND $batch as rel
            MATCH (follower:User {id: rel.followerId}), (followed:User {id: rel.followedId}) 
            MERGE (follower)-[:FOLLOWS]->(followed)",
            "RETURN count(*)",
            {batchSize: ${batchSize}, params: $params}
          )
        `, {params: params});
    }
}

async function addFollowsToUsers() {
    const session = driver.session();
    const numUsers = await getUsersCount();

    const follows = [];
    for (let i = 1; i <= numUsers; i++) {
        const numFollowed = Math.floor(Math.random() * 21); // each user can follow 0 - 20 people
        for (let j = 0; j < numFollowed; j++) {
            const followedId = Math.floor(Math.random() * numUsers) + 1;
            follows.push({ followerId: i, followedId: followedId });
        }
    }
    const batchSize = 1000;
    const startTime = performance.now();
    await insertFollowsInBatches(session, follows, batchSize);
    const endTime = performance.now();
    console.log(`Inserted ${follows.length} follow relationships into the Neo4j database in ${(endTime - startTime)/1000} seconds.`);
    await session.close();
}



// Create product relationships
const createProductRelationships = async (numProducts) => {
    const tx = driver.session.beginTransaction();

    for (let i = 0; i < numProducts; i++) {
        const user = `User ${Math.floor(Math.random() * 10)}`;
        const product = `Product ${i}`;
        const result = await tx.run(
            'MATCH (u:User {name: $user}) CREATE (u)-[:BOUGHT]->(:Product {name: $product})',
            { user, product }
        );
        console.log(`${user} bought ${product}`);
    }

    await tx.commit();
};



async function clearDatabase() {
    const session = driver.session();
    try {
        const query = 'MATCH (n) DETACH DELETE n';
        await session.run(query);
        console.log('Neo4j database cleared');
    } catch (error) {
        console.error(error);
    } finally {
        await session.close();
    }
}

async function closeNeo4jSession() {
    await driver.session().close();
    console.log("closing neo4j session")

    //driver.close().then(() => console.log("closing neo4j session"));
}
async function getUsersCount(){
    const session = driver.session();
    try {
        const query = 'MATCH (u:User)\n' +
            'RETURN count(u) as userCount\n';
        const result = await session.run(query);
        return result.records[0].get(0).toNumber();
    } catch (error) {
        console.error(error);
    } finally {
        await session.close();
    }
}


module.exports = {
    closeNeo4jSession,
    clearDatabase,
    insertUsersBatchNeo4j,
    addFollowsToUsers,
    driver
};