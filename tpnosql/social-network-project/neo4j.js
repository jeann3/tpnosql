const neo4j = require('neo4j-driver');
const faker = require("faker");
const {session} = require("neo4j-driver");
const batchSize = 10000;
const insertUserQuery = 'CREATE (:User {id: $id, name: $name})';

const driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic('neo4j', 'password')
);


// Create a function to generate a batch of user objects
function generateUserBatch(numUsers) {
    const batch = [];
    for (let i = 1; i <= numUsers; i++) {
        batch.push({ id: i, name: faker.name.findName() });
    }
    return batch;
}

// Create a function to insert a batch of users into Neo4j
async function insertUsers(batch, session) {
    await session.writeTransaction(tx => {
        for (const user of batch) {
            tx.run(insertUserQuery, user);
        }
    });
}

// Create a function to insert all users in batches
async function insertUsersBatchNeo4j(numUsers) {
    const session = driver.session();
    const startTime = performance.now();
    try{
        for (let i = 0; i < numUsers; i += batchSize) {
            const batch = generateUserBatch(batchSize);
            await insertUsers(batch, session);
            console.log(`Inserted ${batchSize} users (${i + 1}-${i + batchSize})`);
        }
        const endTime = performance.now();
        console.log(`Inserted ${numUsers} users into the Neo4j database in ${endTime - startTime} milliseconds.`);
    }
    finally {
        await session.close();
        console.log("session closed");
    }
}


// Insert users
const insertUsersNeo4j = async (numUsers) => {
    const tx = driver.session().beginTransaction();
    const startTime = performance.now();

    for (let i = 0; i < numUsers; i++) {
        const firstname = faker.name.firstName();
        const lastname = faker.name.lastName();
        const result = await tx.run('CREATE (:User {firstname: $firstname, lastname: $lastname})',
            { firstname,lastname });
        console.log(`Created user ${firstname}`);
    }
    const endTime = performance.now();
    console.log(`Inserted ${numUsers} users into the Neo4j database in ${endTime - startTime} milliseconds.`);
    await tx.commit();
};

// Create follow relationships
const createFollowRelationships = async (numFollows) => {
    const tx = driver.session.beginTransaction();

    for (let i = 0; i < numFollows; i++) {
        const user1 = `User ${Math.floor(Math.random() * 10)}`;
        const user2 = `User ${Math.floor(Math.random() * 10)}`;
        const result = await tx.run(
            'MATCH (u1:User {name: $user1}), (u2:User {name: $user2}) CREATE (u1)-[:FOLLOWS]->(u2)',
            { user1, user2 }
        );
        console.log(`${user1} follows ${user2}`);
    }

    await tx.commit();
};

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

module.exports = {
    closeNeo4jSession,
    insertUsersNeo4j,
    clearDatabase,
    insertUsersBatchNeo4j,
    driver
};