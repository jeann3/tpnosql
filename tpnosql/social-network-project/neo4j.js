const neo4j = require('neo4j-driver');
const faker = require("faker");

const driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic('neo4j', 'password')
);

/*INSERT*/

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

async function addProductsToNeo4j() {
    const session = driver.session();
    const products = generateProducts(10000);
    const batchSize = 1000;
    const startTime = performance.now();
    await insertProductsInBatches(session, products, batchSize);
    const endTime = performance.now();
    console.log(`Inserted ${products.length} products into the Neo4j database in ${(endTime - startTime)/1000} seconds.`);
    await session.close();
}

async function insertProductsInBatches(session, products, batchSize) {
    const numBatches = Math.ceil(products.length / batchSize);
    for (let i = 0; i < numBatches; i++) {
        const batch = products.slice(i * batchSize, (i + 1) * batchSize);
        console.log(`Inserting batch ${i + 1} of ${numBatches} (${batch.length} products)...`);

        const result = await session.run(
            `
              UNWIND $batch AS product
              MERGE (p:Product {id: product.id})
              ON CREATE SET p.name = product.name, p.price = product.price
              RETURN count(*)
            `,
            { batch }
        );

        console.log(`Inserted ${result.records[0].get(0)} products.`);
    }
}

function generateProducts(numProducts) {
    const products = [];
    for (let i = 1; i <= numProducts; i++) {
        const id = i;
        const name = `Product ${i}`;
        const price = Math.floor(Math.random() * 100) + 1;
        products.push({
            id,
            name,
            price,
        });
    }
    return products;
}

async function insertOrderedInBatches(session, orders, batchSize) {
    const numBatches = Math.ceil(orders.length / batchSize);
    for (let i = 0; i < numBatches; i++) {
        const batch = orders.slice(i * batchSize, (i + 1) * batchSize);

        const params = {
            batch: batch
        };

        await session.run(`
          CALL apoc.periodic.iterate(
            "UNWIND $batch as rel
            MATCH (u:User {id: rel.userId}), (p:Product {id: rel.productId}) 
            MERGE (u)-[:ORDERED]->(p)",
            "RETURN count(*)",
            {batchSize: ${batchSize}, params: $params}
          )
        `, {params: params});
    }
}

async function insertFollowsInBatches(session, follows, batchSize) {
    const numBatches = Math.ceil(follows.length / batchSize);
    for (let i = 0; i < numBatches; i++) {
        const batch = follows.slice(i * batchSize, (i + 1) * batchSize);

        const params = {
            batch: batch
        };

        console.log("inserting batch");
        await session.run(`
          CALL apoc.periodic.iterate(
            "UNWIND $batch as rel
            MATCH (follower:User {id: rel.followerId}), (followed:User {id: rel.followedId}) 
            MERGE (follower)-[:FOLLOWS]->(followed)",
            "RETURN count(*)",
            {batchSize: ${batchSize}, params: $params}
          )
        `, {params: params});
        console.log("inserted batch");
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
    const batchSize = 10;
    const startTime = performance.now();
    await insertFollowsInBatches(session, follows, batchSize);
    const endTime = performance.now();
    console.log(`Inserted ${follows.length} follow relationships into the Neo4j database in ${(endTime - startTime)/1000} seconds.`);
    await session.close();
}

async function addOrdersToUsers() {
    const session = driver.session();
    const numUsers = await getUsersCount();
    const productCount = 10000;

    const orders = [];
    for (let i = 1; i <= numUsers; i++) {
        const numProducts = Math.floor(Math.random() * 6); // each user can order 0 - 5 product
        for (let j = 0; j < numProducts; j++) {
            const productId = Math.floor(Math.random() * productCount) + 1;
            orders.push({ userId: i, productId: productId });
        }
    }
    console.log(orders[0]);
    const batchSize = 1000;
    const startTime = performance.now();
    await insertOrderedInBatches(session, orders, batchSize);
    const endTime = performance.now();
    console.log(`Inserted ${orders.length} bought relationships into the Neo4j database in ${(endTime - startTime)/1000} seconds.`);
    await session.close();
}


/*SEARCH*/

async function searchNeo4j(user, depth, product) {
    const session = driver.session();
    let query;
    if(user !== undefined){
        if(product !== undefined){
            query = `MATCH (:User {id: ${user}})<-[:FOLLOWS *0..${depth}]-(f:User)
            WITH DISTINCT f
            MATCH (f)-[:ORDERED]->(p:Product {id: ${product}})
            RETURN p.name, COUNT(*)`;
        }
        else {
            query = `MATCH (:User {id: ${user}})<-[:FOLLOWS *0..${depth}]-(f:User)
            WITH DISTINCT f
            MATCH (f)-[:ORDERED]->(p:Product)
            RETURN p.name, COUNT(*)`;
        }
    }
    else{
        query = `MATCH (p:Product {id: ${product}})<-[:ORDERED]-(u:User)
        RETURN u.name`;
    }

    try {
        const startTime = performance.now();
        const result = await session.run(query, {});
        if(user !== undefined){
            let products = [];
            for (let i = 0; i < result.records.length; i++) {
                products.push(
                    {
                        name: result.records[i].get(0),
                        nbrOrders: result.records[i].get(1).low
                    }
                )
            }
            await session.close();
            const endTime = performance.now();
            console.log(`Found ${products.length} products for User ${user}'s circle in ${(endTime - startTime) / 1000} seconds.\``);
            console.log(products);
            return(products);
        }
        else{
            let users = [];
            for (let i = 0; i < result.records.length; i++) {
                users.push(
                    {
                        name: result.records[i].get(0)
                    }
                )
            }
            await session.close();
            const endTime = performance.now();
            console.log(`Found ${users.length} users for product ${product} in ${(endTime - startTime) / 1000} seconds.\``);
            console.log(users);
            return(users);
        }
    } catch (e) {
        console.error(e);
    }
}

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
    addOrdersToUsers,
    addProductsToNeo4j,
    searchNeo4j
};