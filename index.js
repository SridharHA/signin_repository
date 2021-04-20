/** 
 * Lambda Function that would do the following:
 * 1. Read the data from API gateway
 * 2. authenticate user in congnito userpool
 * 3. Fetch records from dynamodb
 * 4. Return the successful records or error codes to caller.
 */
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const axios = require('axios');
exports.handler = async (event, context) => {
    const poolData = {
        UserPoolId: "us-east-1_vn1MDgmkf", // user pool id   
        ClientId: "4d3kn5m89trjsd0husu4h982ng" // client id 
    };
    const pool_region = 'us-east-1';
    let errorMessage;

    // Header for response method
    let headers = {
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Accept": "*/"
    }

     // Assigning the querystring parameters to variables
    let email = event.queryStringParameters.email;
    let pass = event.queryStringParameters.password;
    let role = event.queryStringParameters.role;
    let token;
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: pass,
    });
    var userData = {
        Username: event.queryStringParameters.email,
        Pool: userPool
    };

    // Cognito userpool authentication method to user verification
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    let verify = new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('id token + ' + result.getIdToken().getJwtToken());
                token = result.getIdToken().getJwtToken();
                resolve(true);
            },
            onFailure: function (err) {
                console.log(err);
                errorMessage = err.message
                resolve(false);
            },

        });
    })
    let authenticateResult = await verify;
    let returnResult;

    // Fetch records from db if authentication is successful
    if (authenticateResult) {
        let requestResult = await axios.get(`https://23f1ap2itc.execute-api.us-east-1.amazonaws.com/dev/users?email=${email}&role=${role}`,
            { headers: { 'Authorization': token } })
            .then(function (response) {
                // handle success
                console.log(response.data.message);
                returnResult = {
                    statusCode: 200,
                    headers: headers,
                    body: JSON.stringify(
                        {
                            message: response.data.message
                        },
                        null,
                        2
                    )
                };
            })
            .catch(function (error) {
                // handle error
                console.log(error.response.data.message);
                returnResult = {
                    statusCode: 500,
                    headers: headers,
                    body: JSON.stringify(
                        {
                            message: error.response.data.message
                        },
                        null,
                        2
                    )
                };
            });

    } else {
        // Return error response if authentication is unsuccessful
        console.log(authenticateResult);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify(
                {
                    message: errorMessage
                },
                null,
                2
            )
        };
    }
    return returnResult;
}