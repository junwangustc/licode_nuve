var config = {}

/*********************************************************
 COMMON CONFIGURATION
 It's used by Nuve, ErizoController, ErizoAgent and ErizoJS
**********************************************************/
config.rabbit = {};
config.rabbit.host = '10.8.126.84'; //default value: 'localhost'
config.rabbit.port = 5672; //default value: 5672
// Sets the AQMP heartbeat timeout to detect dead TCP Connections
config.rabbit.heartbeat = 8; //default value: 8 seconds, 0 to disable
config.logger = {};
config.logger.configFile = '../log4js_configuration.json'; //default value: "../log4js_configuration.json"

/*********************************************************
 CLOUD PROVIDER CONFIGURATION
 It's used by Nuve and ErizoController
**********************************************************/
config.cloudProvider = {};
config.cloudProvider.name = '';

/*********************************************************
 NUVE CONFIGURATION
**********************************************************/
config.nuve = {};
config.nuve.dataBaseURL = "10.8.126.84:27017/nuvedb"; // default value: 'localhost/nuvedb'
config.nuve.superserviceID = '56c2db5db92de8c63ff53'; // default value: ''
config.nuve.superserviceKey = '4802'; // default value: ''
config.nuve.testErizoController = '10.8.126.84:8080'; // default value: 'localhost:8080'
// Nuve Cloud Handler policies are in nuve/nuveAPI/ch_policies/ folder
config.nuve.cloudHandlerPolicy = 'default_policy.js'; // default value: 'default_policy.js'

/***** END *****/
// Following lines are always needed.
var module = module || {};
module.exports = config;
