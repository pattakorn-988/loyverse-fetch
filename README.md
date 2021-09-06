# Loyverse Fetch Script

## Running the script

1. Clone this repository.  
    `$ git clone https://github.com/pattakorn-988/loyverse-fetch.git`
2. Install script's dependencies.  
    `$ npm install`
3. Duplicate `.env.sample` file into `.env` file.  
4. Populate configurations inside `.env` file.
    ```
    LOYVERSE_TOKEN=<Your Loyverse instance token here.>
    SQL_USERNAME=<SQL username>
    SQL_PASSWORD=<SQL user's password>

    SQL_HOST=<Hostname of SQL database>
    SQL_DATABASE=<Target database name>
    SQL_ENCRYPT=true
    SQL_PORT=1433
    ```
   
5.Run the script.  
    `$ node index.js`