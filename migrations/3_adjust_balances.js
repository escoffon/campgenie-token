var CGToken = artifacts.require("./contracts/CGToken.sol");
var CGRewarder = artifacts.require("./contracts/CGRewarder.sol");

module.exports = function(deployer, network, accounts) {
    var token;
    var rewarder;
    var ownerBalance;

    CGToken.deployed()
	.then(function(instance) {
		  token = instance;
		  return CGRewarder.deployed();
	      })
	.then(function(instance) {
		  rewarder = instance;
		  return token.owner.call();
	      })
	.then(function(owner) {
		  return token.balanceOf.call(owner);
	      })
	.then(function(balance) {
		  deployer.logger.log("CGToken owner balance: " + balance + " tokens");
		  ownerBalance = balance;
		  return token.transfer(rewarder.address, balance);
	      })
	.then(function(result) {
		  deployer.logger.log("Transferred " + ownerBalance + " tokens to the rewarder");
		  return token.balanceOf.call(rewarder.address);
	      })
	.then(function(rewarderBalance) {
		  deployer.logger.log("New rewarder balance: " + rewarderBalance);
	      })
	.catch(function(e) {
		   deployer.logger.log("error: " + e);
	       });
};
