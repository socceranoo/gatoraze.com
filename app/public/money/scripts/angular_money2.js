$(document).ready(function() {
});

function FriendCtrl($scope) {
	$("#afdiv").show();
	$(".nav").children("li").eq(1).addClass('active');
	$scope.friends = ["arthisridhar@gmail.com", "socceranoo@gmail.com", "rasnud@gmail.com"];
	$scope.email = '';
	$scope.results = {};
	$scope.error = false;
	$scope.arrayempty = false;
	$scope.addFriend = function() {
		if ($scope.email && $.inArray($scope.email, $scope.friends)) {
			$scope.friends.push($scope.email);
			$scope.email = '';
			$scope.error = false;
			$scope.arrayempty = false;
			$scope.results = {};
		} else {
			$scope.error = true;
		}
	};
	$scope.submitFriend = function() {
		if ($scope.friends.length > 0 ){
			$.post("/money/friend", {friends:$scope.friends}, function(data){
				//alert(JSON.stringify(data));
				// update the model with a wrap in $apply(fn) which will refresh the view for us
				$scope.$apply(function() {
					$scope.friends = [];
					$scope.error = false;
					$scope.arrayempty = false;
					$scope.results = data;
					//window.location.href = '/money';
				});
			}, "json");
		} else {
			$scope.arrayempty = true;
		}
	};
	$scope.removeFriend = function(item) {
		var index=$scope.friends.indexOf(item);
		$scope.friends.splice(index,1);
	};
}

function ViewBills($scope) {
	$(".nav").children("li").eq(3).addClass('active');
}
function BillCtrl($scope) {
	$(".nav").children("li").eq(2).addClass('active');
	//see init function for inits
	$scope.togglePayment = function() {
		if (billObj.new) {
			$scope.payment = !$scope.payment;
			$scope.resetFields(3);
			$scope.resetFields(2);
			$scope.initValues();
		}
	};
	$scope.paidAmountChange = function(elem) {
		elem.edit = true;
		$scope.changeAmounts($scope.paid, 0);
	};
	$scope.partAmountChange = function(elem) {
		elem.edit = true;
		$scope.changeAmounts($scope.part, 1);
	};
	$scope.amountChange = function () {
		if ($scope.payment) {
			if ($scope.paid.length > 0)
				$scope.paid[0].amount = $scope.amount;
			if ($scope.part.length > 0)
				$scope.part[0].amount = $scope.amount;
			return;
		}
		$scope.resetFields(0);
		$scope.resetFields(1);
	};
	$scope.resetEdits = function (elem) {
		for (var i = 0; i < elem.length; i++) {
			elem.edit = false;
		}
		//alert($scope.paid[0].edit);
	};
	$scope.addPayerPayee = function(user, option) {
		if (user == "default") 
			return;
		$scope.Payee = "default";
		$scope.Payer = "default";
		var user_found = false;
		var elem = null;
		if (option === 1) {
			elem = $scope.part;
		} else {
			elem = $scope.paid;
		}
		//alert("payment = "+$scope.payment);
		if ($scope.payment) {
			if (elem.length === 0) {
				elem.push({name:user, amount:$scope.amount, edit:false});
			}else {
				elem[0].name = user;
			}
			return;
		}
		for (var i = 0, len = elem.length; i < len; i++) {
			if (elem[i].name == user) {
				user_found = true;	
			}
		}
		if (!user_found && user) {
			elem.push({name:user, amount:0, edit:false});
			$scope.changeAmounts(elem, option);
		}
	};
	$scope.changeAmounts = function (elem, option) {
		var rest_amount= $scope.amount;
		var rest_count = elem.length;
		var edited_amount= 0;
		if (rest_count === 0) {
			return;
		}
		for (var i = 0; i < elem.length; i++) {
			if (elem[i].edit === true) {
				rest_amount = rest_amount - elem[i].amount;
				rest_count--;
				edited_amount += elem[i].amount;
			}
		}
		if (rest_count === 0) {
			$scope.checkFinalAmount(elem, option);
			return;
		}
		var amt = parseFloat(rest_amount/rest_count).toFixed(2);
		var final_amt = parseFloat(amt * rest_count).toFixed(2);
		var diff = parseFloat(rest_amount - final_amt).toFixed(2);
		final_amt = (parseFloat(amt) + parseFloat(diff)).toFixed(2);
		for (i = 0, j = 0; i < elem.length; i++) {
			if (elem[i].edit === false) {
				if (j == (rest_count - 1)){
					elem[i].amount = final_amt;
				} else {
					elem[i].amount = amt;
				}
				j++;
			}
		}
		$scope.checkFinalAmount(elem, option);
	};
	
	$scope.checkFinalAmount = function(elem, option) {
		var retval = true;
		var final_amount = 0.00;
		for (i = 0; i < elem.length; i++) {
			if (parseFloat(elem[i].amount) > 0 ){
				final_amount = (parseFloat(final_amount) + parseFloat(elem[i].amount)).toFixed(2);
			}
		}
		//alert("FINAL AMOUNT ="+final_amount+" ACtual "+$scope.amount);
		if (final_amount != $scope.amount) {
			retval = false;
			if (option === 0)
				$scope.paidAmountError = true;
			else
				$scope.partAmountError = true;
		}else {
			if (option === 0)
				$scope.paidAmountError = false;
			else
				$scope.partAmountError = false;
		}
		return retval;
	};
	$scope.validations = function () {
		$scope.checkFinalAmount($scope.paid, 0);
		$scope.checkFinalAmount($scope.part, 1);
		//$scope.$apply();
		if ($scope.paidAmountError || $scope.partAmountError) {
			return false;
		}
		if ($scope.amount === 0) {
			$("#genError").html("Amount cannot be 0");
			return false;
		}
		if ($scope.paid.length === 0 || $scope.part.length === 0) {
			$("#genError").html("Atleast one payee or participant must be present");
			return false;
		}
		if ($scope.payment){
			if ($scope.paid[0].name == $scope.part[0].name) {
				$("#genError").html("Payment from and to fields are same");
				return false;
			}
		}
		$scope.genError = false;
		$("#genError").html("");
		return true;
	};
	$scope.submitBill = function() {
		var retval = $scope.validations();
		if (!retval) {
			$scope.genError = true;
			//$scope.$apply();
			return;
		}
		if ($scope.payment){
			$scope.event = "Payment";
			$scope.description ="From "+$scope.paid[0].name+" to "+$scope.part[0].name+" on "+$scope.date;
		} else {
			if ($scope.event == "Payment") {
				$scope.event = "Payment..." ;
			}
		}
		var paidjsonarray = {};
		var partjsonarray = {};
		for (var i = 0; i < $scope.paid.length; i++) {
			paidjsonarray[$scope.paid[i].name]= $scope.paid[i].amount;
		}
		for (i = 0; i < $scope.part.length; i++) {
			partjsonarray[$scope.part[i].name]= $scope.part[i].amount;
		}
		if (!paidjsonarray[username] && !partjsonarray[username]) {
			$("#genError").html("Atleast one payee or participant must be you");
			$scope.genError = true;
			return;
		}
		billObj.event=$scope.event;
		billObj.desc=$scope.description;
		billObj.date=$scope.date;
		billObj.amount=$scope.amount;
		billObj.paid= paidjsonarray;
		billObj.part= partjsonarray;
		//alert(billObj['bill_id']);
		$.post("/money/bill", {bill:billObj}, function(data){
			alert(JSON.stringify(data));
			//window.location.href = data.url;
		}, "json");
		
	};
	$scope.resetFields = function(option) {
		if (option === 0) {
			for (i = 0; i < $scope.paid.length; i++) {
				$scope.paid[i].edit = false;
			}
			$scope.changeAmounts($scope.paid, option);
		} else if(option === 1) {
			for (i = 0; i < $scope.part.length; i++) {
				$scope.part[i].edit = false;
			}
			$scope.changeAmounts($scope.part, option);
		} else if(option === 2) {
			$scope.paid = [];
			$scope.paidAmountError = false;
		} else {
			$scope.part = [];
			$scope.partAmountError = false;
		}
	};
	$scope.removePayerPayee = function(elem, option) {
		var items = null;
		if (option === 1) {
			items = $scope.part;
		} else {
			items = $scope.paid;
		}
		items.splice(_.indexOf(items, _.find(items, function (item) { return item === elem; })), 1);
		$scope.changeAmounts(items, option);
	};
	$scope.initValues = function () {
		$scope.event = "";
		$scope.description = "";
		$scope.date = new Date().toJSON().slice(0,10);
		$scope.amount = 0.00;
		if ($scope.payment){
			$scope.event = "Payment";
			$scope.description ="From ";
		}
		$scope.paid = [];
		$scope.part = [];
	};
	$scope.initOldBill = function() {
		$scope.id = billObj.id;
		$scope.event = billObj.event;
		$scope.description = billObj.description;
		$scope.date = billObj.date;
		$scope.amount = parseFloat(billObj.amount);
		$scope.payment = billObj.payment;
		$scope.paid = billObj.paid;
		$scope.part = billObj.part;
	};
	$scope.init = function () {
		$scope.Payer = "default";
		$scope.Payee = "default";
		if (billObj.new) {
			$scope.initValues();
		} else {
			$scope.initOldBill();
		}
		$("#abdiv").show();
	};
	$scope.init();
}
/*
function BillOpr($scope) {
	$scope.opr = $("#bill-opr").data('opr');
	$scope.billId = $("#bill-opr").data('id');
	$scope.invalidBill = $("#bill-opr").data('auth');
	if ($scope.invalidBill == true) {
		$("#invalid-bill").show();	
		return;
	}
	$("#bill-opr").show();
	if ($scope.opr == "view") {
		return;	
	} else if ($scope.opr == "del") {
		$scope.delete = true;
	} else if ($scope.opr == "rev") {
		$scope.revive = true;
	} else if ($scope.opr == "trash") {
		$scope.trash = true;
	}
	$("#delete-button").click(function(event) {
		$("#bill-opr").hide();
		$.post("include/action.php", {action:"delete-bill", arg:$scope.billId}, function(data){
			$("#bill-info").html(data.retval);
		}, "json");
	});
	$("#revive-button").click(function(event) {
		$("#bill-opr").hide();
		$.post("include/action.php", {action:"revive-bill", arg:$scope.billId}, function(data){
			$("#bill-info").html(data.retval);
		}, "json");
	});
	$("#trash-button").click(function(event) {
		$("#bill-opr").hide();
		$.post("include/action.php", {action:"trash-bill", arg:$scope.billId}, function(data){
			$("#bill-info").html(data.retval);
		}, "json");
	});
	$scope.cancel = true;
}
*/

function Summary($scope) {
	$(".nav").children("li").eq(0).addClass('active');
	$scope.cur_val = 0;
	$scope.cur_val2 = 0;
	$scope.ouend = parseFloat($("#owesyou").html()).toFixed(2);
	$scope.uoend = parseFloat($("#youowe").html()).toFixed(2);

	$scope.ouinc = 1  + parseInt($scope.ouend/100, 10);
	$scope.uoinc = 1  + parseInt($scope.uoend/100, 10);

	$scope.uotimer = self.setInterval(function () {
		$scope.decrement();
	}, 10);
	$scope.decrement = function() {
		$scope.cur_val2+=$scope.uoinc;
		$("#youowe").html("- $"+$scope.cur_val2);
		if ($scope.cur_val2 > $scope.uoend) {
			window.clearInterval($scope.uotimer);
			$("#youowe").html("- $"+$scope.uoend);
		}
	};
	$scope.outimer = self.setInterval(function () {
		$scope.increment();
	}, 10);
	$scope.increment = function() {
		$scope.cur_val+=$scope.ouinc;
		$("#owesyou").html("+ $"+$scope.cur_val);
		if ($scope.cur_val > $scope.ouend) {
			window.clearInterval($scope.outimer);
			$("#owesyou").html("+ $"+$scope.ouend);
		}
	};
	$scope.plot = function () {
		var data_owesyou = plot_data.owesyou;
		var data_youowe = plot_data.youowe;
		if (data_owesyou[0].length === 0 ) {
			data_owesyou = [[[0]]];
		}
		if (data_youowe[0].length === 0 ) {
			data_youowe = [[[0]]];
		}
		var oweyouplot = new jqPlotChart("pie1", $.jqplot.PieRenderer, data_owesyou);
		var legend = { show:true, placement: 'outside', rendererOptions: { numberRows: 1, animate:{show:true}}, location:'s', marginTop: '7px' };
		oweyouplot.setChartOptions("legend", legend);
		//oweyouplot.setChartOptions("title", "Owes you");
		oweyouplot.setChartLevel2Options("grid", "borderWidth", 0);
		oweyouplot.setChartLevel2Options("grid", "shadow", false);
		oweyouplot.setChartLevel2Options("grid", "background", __well); 
		//oweyouplot.setChartOptions("seriesColors", [__sunFlower, __peterRiver, __alizarin]);
		oweyouplot.setChartOptions("seriesColors", get_random_colors(master_color_array, data_owesyou[0].length));
		oweyouplot.drawChart();
		//var youoweplot = new Chart("pie2", $.jqplot.PieRenderer, [[[0]]]);
		var youoweplot = new jqPlotChart("pie2", $.jqplot.PieRenderer, data_youowe);
		youoweplot.setChartOptions("legend", legend);
		//youoweplot.setChartOptions("title", "You Owe");
		youoweplot.setChartLevel2Options("grid", "borderWidth", 0);
		youoweplot.setChartLevel2Options("grid", "shadow", false);
		youoweplot.setChartLevel2Options("grid", "gridLineColor", "#000"); 
		youoweplot.setChartLevel2Options("grid", "background", __well); 
		//youoweplot.setChartOptions("seriesColors", [__sunFlower, __greenSea, __clouds]);
		youoweplot.setChartOptions("seriesColors", get_random_colors(master_color_array, data_owesyou[0].length));
		youoweplot.drawChart();
	};
	$scope.plot();
	$("#summary").css('visibility', 'visible');
}
