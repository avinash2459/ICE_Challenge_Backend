# ICE_Coding_Challenge_Backend

## Description

This Project is to develop the API enpoint for the conversion of TSV data input into JSON output.

## Commands

Run the below command in the project directory to install all the dependency packages

```bash
npm install
```

Command to start the Node Server to access the API

```bash
npm start
```

## EndPoints:

> test

Once the application has been started, enpoint /test can be accessed to test the application.

/test API response => {"status":"200","message":"hello! Test is a success"}

> handle

The TSV to JSON conversion is done using the POST API /handle

As an input to this POST API, we send a data variable to the request body. This data variable is a string that is in TSV format.

The input is read by the API from the request parameter as => request.body.data

## Other Information

The Business logic provided has been modified a bit for capturing errors and the same can be accessed in the project directory with the file name 'model.js'

## Deployment

This Project is deployed on heroku for demo purpose and can be accessed at : https://ice-node-challenge.herokuapp.com/
