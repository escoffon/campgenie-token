var CGToken = artifacts.require("./contracts/CGToken.sol");
var CGRewarder = artifacts.require("./contracts/CGRewarder.sol");

var token;
var initialBalance;

module.exports = function(deployer, network, accounts) {
    deployer.deploy(CGToken, '2000000', '2', 'CampGenieToken', 'CGT')
	.then(function() {
		  deployer.logger.log("Deployed CGToken as CampGenieToken at " + CGToken.address);
		  return deployer.deploy(CGRewarder, CGToken.address);
	      })
	.then(function() {
		  deployer.logger.log("Deployed CGRewarder at " + CGRewarder.address);
		  token = CGToken.at(CGToken.address);
		  return token.initialSupply();
	      })
	.catch(function(e) {
		   deployer.logger.log("error: " + e);
	       });
};
