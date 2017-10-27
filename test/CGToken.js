var CGToken = artifacts.require("./contracts/CGToken.sol");
var CGRewarder = artifacts.require("./contracts/CGRewarder.sol");

contract('CGToken (deployed)', function(accounts) {
  it("deployed correctly", function() {
	 var cgt;

	 return CGToken.deployed()
	     .then(function(instance) {
		       cgt = instance;
		       return cgt.name.call();
		   })
	     .then(function(n) {
		       assert.equal(n, 'CampGenieToken', "token name is not initialized correctly");
		       return cgt.symbol.call();
		   })
	     .then(function(s) {
		       assert.equal(s, 'CGT', "token symbol is not initialized correctly");
		       return cgt.decimals.call();
		   })
	     .then(function(d) {
		       assert.equal(d, 2, "decimals is not initialized correctly");
		       return cgt.initialSupply.call();
		   })
	     .then(function(initialSupply) {
		       assert.equal(initialSupply.valueOf(), 200000000, "initial supply is not 2000000.00");
		       return cgt.totalSupply.call();
		   })
	     .then(function(totalSupply) {
		       assert.equal(totalSupply.valueOf(), 200000000, "total supply is not 2000000.00");
		   });
     });

  it("placed 2000000 * 10**2 tokens in the rewarder account", function() {
	 var cgt;

	 return CGToken.deployed()
	     .then(function(instance) {
		       cgt = instance;
		       return CGRewarder.deployed();
		   })
	     .then(function(instance) {
		       return cgt.balanceOf.call(instance.address);
		   })
	     .then(function(balance) {
		       assert.equal(balance.valueOf(), 200000000, "2000000.00 wasn't in the rewarder account");
		   });
     });

  it("fails to transfer insufficient funds", function() {
	 var cgt;
	 var rew;
	 var owner;

	 return CGToken.deployed()
	     .then(function(instance) {
		       cgt = instance;
		       return CGRewarder.deployed();
		   })
	     .then(function(instance) {
		       rew = instance;
		       return cgt.owner.call();
		   })
	     .then(function(o) {
		       owner = o;
		       return cgt.balanceOf.call(owner);
		   })
	     .then(function(balance) {
		       assert.equal(balance.valueOf(), 0, "Owner account did not have a zero balance");
		       return cgt.transfer(rew.address, '1000', { from: owner });
		   })
	     .then(function(rv) {
		       assert(false, 'transfer should have failed');
		   },
		  function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "transfer should have raised VM exception");
		  });
     });
});

contract('CGToken (new)', function(accounts) {
  var ncgt;
  var owner;

  beforeEach(function createToken() {
		 return CGToken.deployed()
		     .then(function(instance) {
			       return CGToken.new('10', '4', 'NewCGToken', 'NCGT');
			   })
		     .then(function(instance) {
			       ncgt = instance;
			       return ncgt.owner.call();
			   })
		     .then(function(o) {
			       owner = o;
			   });
	     });

  it("initializes correctly", function() {
	 return CGToken.deployed()
	     .then(function(instance) {
		       return ncgt.name.call();
		   })
	     .then(function(n) {
		       assert.equal(n, 'NewCGToken', "token name is not initialized correctly");
		       return ncgt.symbol.call();
		   })
	     .then(function(s) {
		       assert.equal(s, 'NCGT', "token symbol is not initialized correctly");
		       return ncgt.decimals.call();
		   })
	     .then(function(d) {
		       assert.equal(d, 4, "decimals is not initialized correctly");
		       return ncgt.initialSupply.call();
		   })
	     .then(function(i) {
		       assert.equal(i, 100000, "initial supply is not initialized correctly");
		       return ncgt.totalSupply.call();
		   })
	     .then(function(i) {
		       assert.equal(i, 100000, "total supply is not initializedized correctly");
		       return ncgt.balanceOf.call(owner);
		   })
	     .then(function(b) {
		       assert.equal(b.valueOf(), 100000, "10.0000 wasn't in the owner account");
		   });
     });

  it("should transfer tokens correctly", function() {
	 var account_two = accounts[2];

	 var owner_starting_balance;
	 var account_two_starting_balance;
	 var owner_ending_balance;
	 var account_two_ending_balance;

	 var amount = 60000;

	 return CGToken.deployed()
	     .then(function(instance) {
		       return ncgt.balanceOf.call(owner);
		   })
	     .then(function(b) {
		       owner_starting_balance = b.toNumber();
		       return ncgt.balanceOf.call(account_two);
		   })
	     .then(function(b) {
		       account_two_starting_balance = b.toNumber();
		       return ncgt.transfer(account_two, amount, { from: owner });
		   })
	     .then(function(rv) {
		       return ncgt.balanceOf.call(owner);
		   })
	     .then(function(b) {
		       owner_ending_balance = b.toNumber();
		       return ncgt.balanceOf.call(account_two);
		   })
	     .then(function(b) {
		       account_two_ending_balance = b.toNumber();

		       assert.equal(owner_ending_balance, owner_starting_balance - amount, "Amount wasn't correctly taken from the sender");
		       assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
		   });
     });

  it("should reject transfers with insufficient funds", function() {
	 var account_two = accounts[2];
	 var account_three = accounts[3];

	 var amount = 120000;

	 return CGToken.deployed()
	     .then(function(instance) {
		       return ncgt.transfer(account_two, amount, { from: owner });
		   })
	     .then(function(rv) {
		       assert(false, 'transfer (1) of insufficient funds should have failed');
		       return true;
		   },
		  function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "transfer (1) of insufficient funds should have raised VM exception");
		  })
	     .then(function(r) {
		       amount = 10000;
		       return ncgt.transfer(account_two, amount, { from: owner });
		   })
	     .then(function(rv) {
		       return ncgt.balanceOf.call(account_two);
		   })
	     .then(function(b) {
		       assert.equal(b, amount, 'tokens did not all transfer to account (2)');
		       amount = 20000;
		       return ncgt.transfer(account_three, amount, { from: account_two });
		   })
	     .then(function(rv) {
		       assert(false, 'transfer (2) of insufficient funds should have failed');
		       return true;
		   },
		  function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "transfer (2) of insufficient funds should have raised VM exception");
		  });
     });

  it("should reject transfers with insufficient allowances", function() {
	 var account_two = accounts[2];
	 var account_three = accounts[3];
	 var account_four = accounts[4];

	 var amount = 20000;
	 var allowance = 10000;

	 return CGToken.deployed()
	     .then(function(instance) {
		       return ncgt.transfer(account_two, amount, { from: owner });
		   })
	     .then(function(rv) {
		       amount = 5000;
		       return ncgt.transferFrom(account_two, account_three, amount, { from: account_four });
		   })
	     .then(function(rv) {
		       assert.isFalse(rv, 'transfer (1) of insufficient allocation should have failed');
		       return rv;
		   },
		   function(e) {
		       assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "transfer (1) of insufficient allocation should have raised VM exception");
		       return ncgt.approve(account_four, allowance, { from: account_two });
		   })
	     .then(function(r) {
		       return ncgt.transferFrom(account_two, account_three, amount, { from: account_four });
		   })
	     .then(function(r) {
		       return ncgt.balanceOf.call(account_three);
		   })
	     .then(function(b) {
		       assert.equal(b, amount, 'tokens did not all transfer to account (3)');
		       amount = 6000;
		       return ncgt.transferFrom(account_two, account_three, amount, { from: account_four });
		   })
	     .then(function(rv) {
		       assert(false, 'transfer (3) of insufficient funds should have failed');
		       return false;
		   },
		  function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "transfer (3) of insufficient funds should have raised VM exception");
		  });
     });

  it('allows only owner to pause/unpause', function() {
	 var account_two = accounts[2];

	 return CGToken.deployed()
	     .then(function(instance) {
		       return ncgt.pause({ from: owner });
		   })
	     .then(function(r) {
		       return ncgt.unpause({ from: account_two });
		  })
	     .then(function(r) {
		       assert(false, 'unpause from account (2) should have failed');
		   },
		   function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "unpause from account (2) should have raised VM exception");
		       return ncgt.unpause({ from: owner });
		  })
	     .then(function(r) {
		       return ncgt.pause({ from: account_two });
		  })
	     .then(function(r) {
		       assert(false, 'pause from account (2) should have failed');
		   },
		   function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "pause from account (2) should have raised VM exception");
		  });
     });

  it('should enforce pause/unpause', function() {
	 var account_two = accounts[2];
	 var account_three = accounts[3];
	 var account_four = accounts[4];

	 var amount = 20000;
	 var allowance = 10000;

	 return CGToken.deployed()
	     .then(function(instance) {
		       return ncgt.transfer(account_two, amount, { from: owner });
		   })
	     .then(function(r) {
		       return ncgt.approve(account_four, allowance, { from: account_two });
		   })
	     .then(function(r) {
		       amount = 4000;
		       return ncgt.transferFrom(account_two, account_three, amount, { from: account_four });
		   })
	     .then(function(r) {
		       return ncgt.pause({ from: owner });
		   })
	     .then(function(r) {
		       return ncgt.transfer(account_two, amount, { from: owner });
		   })
	     .then(function(r) {
		       assert(false, 'transfer while paused should have failed');
		   },
		   function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "transfer while paused should have raised VM exception");
		  })
	     .then(function(r) {
		       amount = 2000;
		       return ncgt.transferFrom(account_two, account_three, amount, { from: account_four });
		   })
	     .then(function(r) {
		       assert(false, 'transferFrom while paused should have failed');
		   },
		   function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "transferFrom while paused should have raised VM exception");
		       return ncgt.approve(account_four, allowance, { from: account_two });
		  })
	     .then(function(r) {
		       assert(false, 'approve while paused should have failed');
		   },
		   function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "approve while paused should have raised VM exception");
		       return ncgt.burn(amount, { from: owner });
		   })
	     .then(function(r) {
		       assert(false, 'burn while paused should have failed');
		   },
		   function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "burn while paused should have raised VM exception");
		       return ncgt.unpause({ from: owner });
		  });
     });

  it('burns correctly', function() {
	 var amount = 20000;
	 var initial_balance;
	 var final_balance;
	 var initial_supply;
	 var final_supply;

	 return CGToken.deployed()
	     .then(function(instance) {
		       return ncgt.balanceOf.call(owner);
		   })
	     .then(function(b) {
		       initial_balance = b.toNumber();
		       return ncgt.totalSupply.call();
		   })
	     .then(function(s) {
		       initial_supply = s.toNumber();
		       return ncgt.burn(amount, { from: owner });
		   })
	     .then(function(r) {
		       return ncgt.balanceOf.call(owner);
		   })
	     .then(function(b) {
		       final_balance = b.toNumber();
		       return ncgt.totalSupply.call();
		   })
	     .then(function(s) {
		       final_supply = s.toNumber();
		       assert.equal(final_supply, (initial_supply - amount), 'total supply after burn is incorrect');
		       assert.equal(final_balance, (initial_balance - amount), 'balance after burn is incorrect');
		       return ncgt.burn(final_balance += 1000, { from: owner });
		   })
	     .then(function(r) {
		       assert(false, 'burn more than balance should have failed');
		   },
		   function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "burn more than balance should have raised VM exception");
		       return ncgt.burn(0, { from: owner });
		  })
	     .then(function(r) {
		       assert(false, 'burn 0 should have failed');
		   },
		   function(e) {
		      assert.match(e, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/, "burn 0 should have raised VM exception");
		  });
     });
});
