const AWS = require('aws-sdk-mock');
const sinon = require('sinon');
const assert = require('chai').assert;
var proxyquire = require('proxyquire');
var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");
//const expect = require('chai').expect;
const app = require('../index');


describe('SignIn Function', async function () {

    it("signin success", async () => {
        let data = { queryStringParameters: { email: "abc@gmail.com",password: "Admin1234",role: "Admin"}};
        var mock = new MockAdapter(axios);
        mock.onGet("https://23f1ap2itc.execute-api.us-east-1.amazonaws.com/dev/users?email=abc@gmail.com&role=Admin").reply(200, {
            message: [{ name: "Sridhar", role: "Admin", created_date:"12/02/2021",email_address:"abc@gmail.com"}],
          });
        const getJwtTokenStub = sinon.stub().returns("1234abcd")
        const authenticateUserStub = sinon.stub().yieldsTo('onSuccess', {
          getIdToken: sinon.stub().returns({getJwtToken: getJwtTokenStub})
        });
        var testedModule = proxyquire('../index.js', {
            'amazon-cognito-identity-js': {
              'CognitoUser': function () {
                return {
                    authenticateUser: authenticateUserStub
                }
              }
            }
          });
        let result = await testedModule.handler(data);
        assert.equal(result.statusCode, 200);
        mock.restore();

    })


    it("signin failure", async () => {
        let data = { queryStringParameters: { email: "abc@gmail.com",password: "Admin1234",role: "Admin"}};
        var mock = new MockAdapter(axios);
        mock.onGet("https://23f1ap2itc.execute-api.us-east-1.amazonaws.com/dev/users?email=abc@gmail.com&role=Admin").reply(200, {
            message: [{ name: "Sridhar", role: "Admin", created_date:"12/02/2021",email_address:"abc@gmail.com"}],
          });
        const authenticateUserStub = sinon.stub().yieldsTo('onFailure', {
          message: "Incorrect username or password"
        });
        var testedModule = proxyquire('../index.js', {
            'amazon-cognito-identity-js': {
              'CognitoUser': function () {
                return {
                    authenticateUser: authenticateUserStub
                }
              }
            }
          });
        let result = await testedModule.handler(data);
        assert.equal(result.statusCode, 500);
        mock.restore();

    })

    it("Axios get request failure", async () => {
        let data = { queryStringParameters: { email: "abc@gmail.com",password: "Admin1234",role: "Admin"}};
        var mock = new MockAdapter(axios);
        mock.onGet("https://23f1ap2itc.execute-api.us-east-1.amazonaws.com/dev/users?email=abc@gmail.com&role=Admin").reply(500, {
            message: "Error occured while fetching the data",
          });
        const getJwtTokenStub = sinon.stub().returns("1234abcd")
        const authenticateUserStub = sinon.stub().yieldsTo('onSuccess', {
          getIdToken: sinon.stub().returns({getJwtToken: getJwtTokenStub})
        });
        var testedModule = proxyquire('../index.js', {
            'amazon-cognito-identity-js': {
              'CognitoUser': function () {
                return {
                    authenticateUser: authenticateUserStub
                }
              }
            }
          });
        let result = await testedModule.handler(data);
        assert.equal(result.statusCode, 500);
        mock.restore();

    })

   
})