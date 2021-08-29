require('dotenv').config()

const fetch = require('node-fetch');
const { Connection, TYPES } = require('tedious');
const version = 'v1.0'
const option = {
    method: 'get',
    headers: { 'Authorization': `Bearer ${process.env.LOYVERSE_TOKEN}` }
};
const config = {
    authentication: {
        options: {
            userName: process.env.SQL_USERNAME,
            password: process.env.SQL_PASSWORD
        },
        type: "default"
    },
    server: process.env.SQL_HOST,
    options: {
        database: process.env.SQL_DATABASE,
        encrypt: process.env.SQL_ENCRYPT === 'true',
        port: Number(process.env.SQL_PORT)
    }
};

const dateCheck = new Date()
dateCheck.setDate(dateCheck.getDate() - 1)

async function fetchCustomer () {
    try{
        const response = await fetch(
            `https://api.loyverse.com/${version}/customers?created_at_min=${dateCheck.toISOString()}`,
            option
        )
        const data = await response.json()

        const connection = new Connection(config);

        // Attempt to connect and execute queries if connection goes through
        connection.on("connect", err => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('connect success')
                // console.log(data)
                const customerLength = data.customers.length
                if (customerLength) {
                    loadBulkCustomer(connection, data, customerLength)
                } else {
                    connection.close();
                }
            }
        });

        connection.connect();
    } catch (e) {
        console.error(e)
    }
}

// Executing Bulk Load
//--------------------------------------------------------------------------------
function loadBulkCustomer(connection, data, customerLength) {
    const option = { keepNulls: true }; // option to enable null values
    const bulkLoad = connection.newBulkLoad('bcl.customers', option, (err, rowCont) => {
        if (err) {
            throw err;
        }

        console.log('rows inserted :', rowCont);
        console.log('DONE!');
        connection.close();
    });

    // setup columns
    bulkLoad.addColumn('loyverse_id', TYPES.VarChar, { nullable: false });
    bulkLoad.addColumn('name', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('email', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('phone_number', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('address', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('city', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('region', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('postal_code', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('country_code', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('note', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('customer_code', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('first_visit', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('last_visit', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('total_visits', TYPES.Int, { nullable: true });
    bulkLoad.addColumn('total_spent', TYPES.Float, { nullable: true });
    bulkLoad.addColumn('total_points', TYPES.Float, { nullable: true });
    bulkLoad.addColumn('permanent_deletion_at', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('created_at', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('updated_at', TYPES.VarChar, { nullable: true });
    bulkLoad.addColumn('deleted_at', TYPES.VarChar, { nullable: true });

    // add rows
    for (let i = 0;i < customerLength;i++) {
        if ('id' in data.customers[i]) {
            data.customers[i].loyverse_id = data.customers[i].id
            delete data.customers[i].id
        }
        bulkLoad.addRow(data.customers[i]);
    }

    // perform bulk insert
    connection.execBulkLoad(bulkLoad);
}


function main() {
    fetchCustomer()
}

main()