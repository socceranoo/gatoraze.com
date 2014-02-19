module.exports = function (MySql) {
	var tables = {money:"money", deleted:"deleted", userpair:"userpair"};
	var moneyModel = MySql.Model.extend({
		tableName: tables.money
	});
	var moneyCollection = MySql.Collection.extend({
		tableName: tables.money
	});

	var deletedModel = MySql.Model.extend({
		tableName: tables.deleted
	});
	var deletedCollection = MySql.Collection.extend({
		tableName: tables.deleted
	});

	var userPairModel = MySql.Model.extend({
		tableName: tables.userpair
	});
	var userPairCollection = MySql.Collection.extend({
		tableName: tables.userpair
	});

	var exportVariable = {};
	var PHPunserialize = require('php-unserialize');

	//var user = "socceranoo";
	var monthHash = ["asd", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	var getDateForString = function (str) {
		var arr = str.split('-');
		var retStr = '';
		return arr[2]+' '+monthHash[parseInt(arr[1], 10)]+' '+arr[0].substr(2)+'\'';
	};

	var updateFriendArray = function (req, user, userlookup, callback) {
		req.session.friends = [];
		var plot = {youowe:[[]], owesyou:[[]]};
		var total = {youowe:0.00, owesyou:0.00};
		new userPairCollection().query(function (qb) {
			qb.where('user1', '=', user).orWhere('user2', '=', user).orderBy('amount');
		}).fetch().then(function (collection) {
			var obj = collection.toJSON({shallow:true});
			for(var i = 0; i < obj.length; i++) {
				var amount = parseFloat(obj[i].amount);
				var absamount = Math.abs(amount).toFixed(2);
				var amountstr = "$"+absamount;
				if (amount === 0.00) {
					amountstr = "-";
				}
				var displayname = "";
				var status = true;
				if (obj[i].user1 == user) {
					displayname = userlookup(obj[i].user2).nickname;
					if (amount < 0.00) {
						status = false;
						plot.youowe[0].push([displayname, parseFloat(absamount)]);
						total.youowe += parseFloat(absamount);
					} else if (amount > 0.00) {
						status = true;
						plot.owesyou[0].push([displayname, parseFloat(absamount)]);
						total.owesyou += parseFloat(absamount);
					}
					req.session.friends.push([obj[i].user2, displayname, status, amountstr]);
				} else if (obj[i].user2 == user) {
					displayname = userlookup(obj[i].user1).nickname;
					if (amount < 0.00) {
						status = true;
						plot.owesyou[0].push([displayname, parseFloat(absamount)]);
						total.owesyou += parseFloat(absamount);
					} else if (amount > 0.00) {
						status = false;
						plot.youowe[0].push([displayname, parseFloat(absamount)]);
						total.youowe += parseFloat(absamount);
					}
					req.session.friends.push([obj[i].user1, displayname, status, amountstr]);
				}
			}
			total.youowe = total.youowe.toFixed(2);
			total.owesyou = total.owesyou.toFixed(2);
			callback(plot, total);
		});
	};
	exportVariable.showSummary = function(req, userlookup, callback)
	{
		var user = req.session.user.user;
		updateFriendArray(req, user, userlookup, function (plot, total) {
			getAllBills(true, function (bills) {
				callback({friends:{user:user, data:req.session.friends}, arg:{plot:plot, total:total, current:true, data:bills}});
			}, user, userlookup, null, 5);
		});
	};

	exportVariable.editOrNewBill = function(req, userlookup, id, callback)
	{
		var user = req.session.user.user;
		var friends = (req.session.friends)?req.session.friends:[];
		var billObj = {new:true, billId:-1};
		var callbackFailure = function () {
			callback({friends:{user:user, data:friends}, arg:{}}, false);
		};
		var callbackSuccess = function (model) {
			var billJson = model.toJSON({shallow:true});	
			var paidObj = JSON.parse(billJson.paid);
			var partObj= JSON.parse(billJson.participants);
			var amount = parseFloat(billJson.amount).toFixed(2);
			var payment = (billJson.event == "Payment")?true:false;
			billObj = {
				new:false,
				id:id,
				event:billJson.event,
				amount:amount,
				date:billJson.date,
				description:billJson.description,
				paid:paidObj,
				part:partObj,
				payment:payment
			};
			callback({friends:{user:user, data:friends}, arg:billObj}, true);
		};
		if (id == -1) {
			callback({friends:{user:user, data:friends}, arg:billObj}, true);
		} else {
			checkBillPermission(user, {id:id, current:'true'}, callbackSuccess, callbackFailure);
		}
	};
	/* record insertion, update & deletion methods */

	exportVariable.showBillDetails = function(argObj, req, userlookup, callback)
	{
		var user = req.session.user.user;
		var friends = (req.session.friends)?req.session.friends:[];
		var callbackFailure = function () {
			callback({friends:{user:user, data:friends}, arg:{}}, false);
		};
		var callbackSuccess = function (model) {
			var billJson = model.toJSON({shallow:true});
			var paidObj = JSON.parse(billJson.paid);
			var partObj= JSON.parse(billJson.participants);
			var amount = parseFloat(billJson.amount).toFixed(2);
			var current = (argObj.current == 'true') ? true : false;
			var result = getResultSummary(paidObj, partObj, amount);
			var summary = [];
			var paidArr = [];
			var partArr = [];
			var loaner, borrower;
			var amt;
			for (var key in paidObj) {
				paidArr.push({name:userlookup(key).nickname, amount:paidObj[key]});
			}
			for (key in partObj) {
				partArr.push({name:userlookup(key).nickname, amount:partObj[key]});
			}
			for (key in result) {
				if (result[key].details.amount > 0) {
					loaner = result[key].details.user1;
					borrower = result[key].details.user2;
					amt = result[key].details.amount;	
				} else {
					loaner = result[key].details.user2;
					borrower = result[key].details.user1;
					amt = result[key].details.amount * -1;	
				}
				summary.push({loaner:userlookup(loaner).nickname, borrower:userlookup(borrower).nickname, amount:amt});
			}
			var billObj = {
				current:current,
				id:billJson.id,
				event:billJson.event,
				amount:amount,
				date:getDateForString(billJson.date),
				description:billJson.description,
				payees: paidArr,
				participants: partArr 
			};
			billObj.summary = summary;
			callback({friends:{user:user, data:friends}, arg:billObj}, true);
		};
		checkBillPermission(user, argObj, callbackSuccess, callbackFailure);
	};

	var checkBillPermission = function (user, argObj, callbackSuccess, callbackFailure) {
		if (argObj.id === null  || argObj.current === null) {
			callbackFailure();
		} else {
			var current = (argObj.current == 'true') ? true : false;
			var newModel = (current) ? new moneyModel({id:argObj.id}): new deletedModel({id:argObj.id});
			newModel.fetch().then(function (model) {
				if (model) {
					var billJson = model.toJSON({shallow:true});
					var paidObj = JSON.parse(billJson.paid);
					var partObj= JSON.parse(billJson.participants);
					if (!paidObj[user] && !partObj[user]) {
						callbackFailure();
					} else {
						callbackSuccess(model);
					}
				} else {
					callbackFailure();
				}
			});
		}
	};
	exportVariable.showAllBills = function(argObj, req, userlookup, callback)
	{
		var user = req.session.user.user;
		var user2 = argObj.user2;
		var current = argObj.current;
		var friends = (req.session.friends)?req.session.friends:[];
		if (user2) {
			console.log(user2);
		}
		getAllBills(current, function (bills) {
			callback({friends:{user:user, data:friends}, arg:{current:current, data:bills}});
		}, user, userlookup, user2, 100);
	};

	exportVariable.addFriends = function(array, req, userlookup, callback) 
	{
		var user = req.session.user.user;
		var retarray = {};
		var checklastitem = function () {
			if (Object.keys(retarray).length == array.length)
				callback(retarray);
		};
		array.forEach(function (elem, index, array) {
			var userObj = userlookup(elem);
			var obj = '';
			if (userObj) {
				username = userObj.user;
				if (user == username) {
					retarray[elem]= [false, "Cannot add yourself"];
					checklastitem();
					return;
				}

				addUserPairModel(user, username, function (model, newentry) {
					retarray[elem] = (newentry) ? [true, "Successfully added"] : [true, "Already your friend"];
					checklastitem();
				});
			} else {
				retarray[elem]=[false, "Doesn't exist"];
				checklastitem();
				return;
			}
		});
	};

	exportVariable.reviveDeleteBill = function(user, argObj, internal, callback)
	{
		var callbackFailure = function () {
			callback(-1);
		};
		var callbackSuccess = function (model) {
			var factor = (argObj.current == 'true') ? -1 : 1;
			var billJson = model.toJSON({shallow:true});
			var paidObj = JSON.parse(billJson.paid);
			var partObj= JSON.parse(billJson.participants);
			var amount = parseFloat(billJson.amount).toFixed(2);
			var result = getResultSummary(paidObj, partObj, amount);
			var innercallback = function(finalresult) {
				if (internal === false) {
					model.destroy().then(function () {
						delete billJson.id;
						var newModel = (argObj.current == 'false') ? new moneyModel(billJson): new deletedModel(billJson);
						newModel.save().then(function (model) {
							callback(model.attributes.id);
						});
					});
				} else {
					callback(finalresult);
				}
			};
			applyResult(result, factor, innercallback);
		};
		checkBillPermission(user, argObj, callbackSuccess, callbackFailure);

	};

	exportVariable.addEditBill = function(data, req, userlookup, callback)
	{
		var user = req.session.user.user;
		var factor = 1;
		var result = getResultSummary(data.paid, data.part, data.amount);
		var editModel = null;
		var enterNewBill = function () {
			var billData = {
				event:data.event,
				description:data.description,
				date:data.date,
				paid:JSON.stringify(data.paid),
				participants:JSON.stringify(data.part),
				amount:parseFloat(data.amount)
			};
			console.log(billData);
			//Insert the model
			new moneyModel(billData).save().then(function (model) {
				console.log(billData);
				applyResult(result, factor, function () {
					var url = '/money/details?current=true&id='+model.attributes.id;
					callback({url:url});
				});
			});

		};
		var checkLastEdit = function (interresult) {
			console.log("Addition done deleteion pending");
			var innercallback = function (finalresult) {
				//Update the model
				var updateData = {
					event:data.event,
					description:data.description,
					amount:parseFloat(data.amount).toFixed(2),
					date:data.date,
					paid:JSON.stringify(data.paid),
					participants:JSON.stringify(data.part)
				};
				editModel.save(updateData, {patch:true}).then(function (model) {
					var url = '/money/details?current=true&id='+model.attributes.id;
					callback({error:false, url:url});
				});
			};
			exportVariable.reviveDeleteBill(user, {id:data.id, current:'true'}, true, innercallback);
		};
		var callbackFailure = function () {
			var url = '/money/details?current=true&id=-1';
			callback({error:true, url:url});
		};
		var callbackSuccess = function (model) {
			editModel = model;
			applyResult(result, factor, checkLastEdit);
		};
		if (data.new == 'true') {
			enterNewBill();
		} else if (data.new == 'false') {
			checkBillPermission(user, {id:data.id, current:'true'}, callbackSuccess, callbackFailure);
		}
	};

	var getAllBills = function (current, callback, user1, userlookup, user2, limit) {
		var bills = [];
		var newCollection = (current) ? new moneyCollection(): new deletedCollection();
		newCollection.query(function (qb) {
			if (user2) {
				qb.where(function () {
					this.where('paid', 'LIKE', '%'+user1+'%').andWhere('participants', 'LIKE', '%'+user2+'%');
				}).orWhere(function () {
					this.where('paid', 'LIKE', '%'+user2+'%').andWhere('participants', 'LIKE', '%'+user1+'%');
				}).orWhere(function () {
					this.where('paid', 'LIKE', '%'+user1+'%').andWhere('paid', 'LIKE', '%'+user2+'%');
				}).orWhere(function () {
					this.where('participants', 'LIKE', '%'+user1+'%').andWhere('participants', 'LIKE', '%'+user2+'%');
				}).orderBy('date', 'desc').limit(limit);
			} else {
				qb.where(function () {
					this.where('paid', 'LIKE', '%'+user1+'%').orWhere('participants', 'LIKE', '%'+user1+'%');
				}).orderBy('date', 'desc').limit(limit);
			}
		}).fetch().then(function (collection) {
			var obj = collection.toJSON({shallow:true});
			for(var i = 0; i < obj.length; i++) {
				var paid = [];
				var part = [];
				var paidObj = JSON.parse(obj[i].paid);
				var partObj= JSON.parse(obj[i].participants);
				for (var key in paidObj) {
					paid.push((key == user1) ? "You":userlookup(key).nickname);	
				}
				for (key in partObj) {
					part.push((key == user1) ? "You":userlookup(key).nickname);	
				}
				var amount = parseFloat(obj[i].amount).toFixed(2);
				var date = obj[i].date;
				date = getDateForString(obj[i].date);
				bills.push({id:obj[i].id, event:obj[i].event, description:obj[i].description, amount:amount, paid:paid, part:part, date:date});
			}
			callback(bills);
		});

	};

	var applyResult = function (result, factor, callback) {
		var keyarray = Object.keys(result);
		var count = 0;
		var checklast = function () {
			if (count == keyarray.length) {
				callback(result);
			}
		};
		keyarray.forEach(function (key, index, array) {
			var user1 = result[key].details.user1;
			var user2 = result[key].details.user2;
			var amount = result[key].details.amount;
			addUserPairModel(user1, user2, function (model, newentry) {
				result[key].new = newentry;
				result[key].model = model;
				var newAmount = model.attributes.amount + (factor * amount);
				model.save({amount:newAmount}, {patch:true}).then(function(o) {
					count++;
					checklast();
				});
			});
		});
	};
	var getResultSummary  = function (paidObj, partObj, amt)  {
		var amount = parseFloat(amt);
		var paid_user, part_user, paid_amt, part_amt;
		var share_percent, per_payee_share;
		var result = {};
		var paid_count = Object.keys(paidObj).length;
		var part_count = Object.keys(partObj).length;
		var key;
		var value, user1, user2;

		for (paid_user in paidObj) {
			paid_amt = paidObj[paid_user];
			for (part_user in partObj) {
				part_amt = partObj[part_user];
				share_percent = part_amt/amount;
				per_payee_share = parseFloat((share_percent * paid_amt).toFixed(2));
				if (paid_user != part_user) {
					if (paid_user < part_user) {
						key = paid_user+part_user;
						value = per_payee_share;
						user1 = paid_user;
						user2 = part_user;
					} else {
						key = part_user+paid_user;
						value = -1 * per_payee_share;
						user1 = part_user;
						user2 = paid_user;
					}
					if (result[key])
						result[key].details.amount += value;	
					else {
						result[key] = {};
						result[key].details = {user1:user1, user2:user2, amount:value};
					}
				}

			}
		}
		return result;
	};
	var addUserPairModel = function (user1, user2, callback) {
		var obj;
		if (user1 < user2) {
			obj = {user1:user1, user2:user2};
		} else if (user2 < user1) {
			obj = {user1:user2, user2:user1};
		}
		new userPairModel(obj).fetch().then(function (model) {
			if (model) {
				callback(model, false);
			} else {
				obj.amount = 0.00;
				new userPairModel(obj).save().then(function(model) {
					callback(model, true);
				});
			}
		});
	};
	return exportVariable;
};
