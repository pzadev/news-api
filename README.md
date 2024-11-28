# READ ME

- **Link to hosted version: https://news-api-5gcc.onrender.com/api**

- **Find a list of available endpoints above**

### Background and Requirements

**This project is an API built for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as Reddit) which should provide this information to the front end architecture.**

This project requires that you have downloaded and minimum version of
- `Node.js V14`
- `PostgreSQL V10`


## Step One

- To connect to the two databases locally you will need to clone this repo and set up two .env files separately, one named `.env.development` and the other `.env.test`. You can find the database names in `setup.sql`.

## Step Two

- Open `package.json` and run `npm install` to install all required packages to run this project. You will also see the scripts needed to seed, run and test this project.

## Step Three 

- Seed the project by running `npm run setup-dbs` and proceed to start the project by using `npm run seed`.


--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
