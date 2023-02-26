const faker = require('faker');
const { Pool } = require('pg');

const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'tpnosql',
        password: 'nosoroot',
        port: 5432,
});

// async function getUsers() {
//         try {
//                 // Get a new client from the pool
//                 const client = await pool.connect();
//
//                 // Run the query to retrieve all users
//                 const result = await client.query('SELECT * FROM "user"');
//
//                 // Release the client back to the pool
//                 client.release();
//
//                 // Return the results
//                 return result.rows;
//         } catch (err) {
//                 console.error(err);
//         }
// }

const getUsers = async (req, res) => {
        const client = await pool.connect();
        try {
                await client.query('BEGIN');
                const startTime = performance.now();
                const result = await pool.query('SELECT * FROM "user"');
                const endTime = performance.now();
                await client.query('COMMIT');
                console.log(`Request to get users from the Postgres database in ${endTime - startTime} milliseconds.`);
                res.send(result.rows);
        } catch (err) {
                console.error(err);
                res.status(500).send('Error retrieving users');
        }finally {
                client.release();
        }
};

async function insertUsers(numUsers) {
        const client = await pool.connect();

        try {
                await client.query('BEGIN');

                const startTime = performance.now();

                for (let i = 1; i <= numUsers; i++) {
                        const firstname = faker.name.firstName();
                        const lastname = faker.name.lastName();
                        console.log(firstname);
                        console.log(lastname);
                        await client.query('INSERT INTO "user"(firstname, lastname) VALUES($1, $2)', [firstname, lastname]);
                }

                const endTime = performance.now();

                await client.query('COMMIT');

                console.log(`Inserted ${numUsers} users into the Postgres database in ${endTime - startTime} milliseconds.`);
        } catch (err) {
                await client.query('ROLLBACK');
                throw err;
        } finally {
                client.release();
        }
}

module.exports = {
        insertUsers, getUsers
};