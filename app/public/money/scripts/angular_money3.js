$(document).ready(function() {
});

function FriendCtrl($scope) {
	$("#afdiv").show();
	$(".nav").children("li").eq(1).addClass('active').children("a").addClass('color-pumpkin');
	//$scope.friends = ["arthisridhar@gmail.com", "socceranoo@gmail.com", "rasnud@gmail.com"];
	$scope.friends = [];
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
	$('#af-form').bind("keyup keypress keydown", function(e) {
		var code = e.keyCode || e.which; 
		if (code  == 13) {
			e.preventDefault();
			return false;
		}
	});
}

function ViewBills($scope) {
	$(".nav").children("li").eq(3).addClass('active').children("a").addClass('color-pumpkin');
}
function BillCtrl($scope) {
	$(".nav").children("li").eq(2).addClass('active').children("a").addClass('color-pumpkin');
	$scope.edit = [{}, {}];
	$scope.array = [{}, {}];
	//see init function for inits
	$scope.togglePayment = function() {
		if (billObj.new) {
			$scope.payment = !$scope.payment;
			$scope.resetFields(3);
			$scope.resetFields(2);
			$scope.initValues();
		}
	};
	$scope.paidAmountChange = function(key) {
		$scope.edit[0][key] = true;
		$scope.changeAmounts(0);
	};
	$scope.partAmountChange = function(key) {
		$scope.edit[1][key] = true;
		$scope.changeAmounts(1);
	};
	$scope.amountChange = function () {
		if ($scope.payment) {
			if (Object.keys($scope.array[0]).length > 0)
				$scope.array[0][Object.keys($scope.array[0])[0]] = $scope.amount;
			if (Object.keys($scope.array[1]).length > 0)
				$scope.array[1][Object.keys($scope.array[1])[0]] = $scope.amount;
			return;
		}
		$scope.resetFields(0);
		$scope.changeAmounts(0);
		$scope.resetFields(1);
		$scope.changeAmounts(1);
	};
	$scope.equalizeAmounts = function(option) {
		$scope.resetFields(option);
		$scope.changeAmounts(option);
	};
	$scope.addPayerPayee = function(user, option) {
		if (user == "default") 
			return;
		$scope.Payee = "default";
		$scope.Payer = "default";
		if ($scope.payment) {
			$scope.array[option] = {};
			$scope.array[option][user] = $scope.amount;
			return;
		}
		if (!$scope.array[option][user] && user) {
			$scope.array[option][user] = $scope.amount;
			$scope.edit[option][user] = false;
			$scope.changeAmounts(option);
		}
	};
	$scope.changeAmounts = function (option) {
		var rest_amount= $scope.amount;
		var rest_count = Object.keys($scope.array[option]).length;
		var edited_amount= 0;
		if (rest_count === 0) {
			return;
		}
		for (var key in $scope.array[option]) {
			if ($scope.edit[option][key] === true) {
				rest_amount = rest_amount - $scope.array[option][key];
				rest_count--;
				edited_amount += $scope.array[option][key];
			}
		}
		if (rest_count === 0) {
			$scope.checkFinalAmount(option);
			return;
		}
		var amt = parseFloat(rest_amount/rest_count).toFixed(2);
		var final_amt = parseFloat(amt * rest_count).toFixed(2);
		var diff = parseFloat(rest_amount - final_amt).toFixed(2);
		final_amt = (parseFloat(amt) + parseFloat(diff)).toFixed(2);
		var j = 0;
		for (key in $scope.array[option]) {
			if ($scope.edit[option][key] === false) {
				if (j == (rest_count - 1)){
					$scope.array[option][key] = final_amt;
				} else {
					$scope.array[option][key] = amt;
				}
				j++;
			}
		}
		$scope.checkFinalAmount(option);
	};
	
	$scope.checkFinalAmount = function(option) {
		var retval = true;
		var final_amount = 0.00;
		for (var key in $scope.array[option]) {
			if (parseFloat($scope.array[option][key]) > 0 ){
				final_amount = (parseFloat(final_amount) + parseFloat($scope.array[option][key])).toFixed(2);
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
		$scope.checkFinalAmount(0);
		$scope.checkFinalAmount(1);
		//$scope.$apply();
		if ($scope.paidAmountError || $scope.partAmountError) {
			return false;
		}
		if ($scope.amount === 0) {
			$("#genError").html("Amount cannot be 0");
			return false;
		}
		if (Object.keys($scope.array[0]).length === 0 || Object.keys($scope.array[1]).length=== 0) {
			$("#genError").html("Atleast one payee or participant must be present");
			return false;
		}
		if ($scope.payment){
			if (Object.keys($scope.array[0])[0] == Object.keys($scope.array[1])[0]) {
				$("#genError").html("Payment from and to fields are same");
				return false;
			}
		}
		if (!$scope.array[0][username] && !$scope.array[1][username]) {
			$("#genError").html("Atleast one payee or participant must be you");
			$scope.genError = true;
			return;
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
			$scope.description ="From "+Object.keys($scope.array[0])[0]+" to "+Object.keys($scope.array[1])[0]+" on "+$scope.date;
		} else {
			if ($scope.event == "Payment") {
				$scope.event = "Payment..." ;
			}
		}
		billObj.event=$scope.event;
		billObj.description=$scope.description;
		billObj.date=$scope.date;
		billObj.amount=$scope.amount;
		billObj.paid= $scope.array[0];
		billObj.part= $scope.array[1];
		//alert(billObj['bill_id']);
		$.post("/money/bill", {bill:billObj}, function(data){
			//alert(JSON.stringify(data));
			window.location.href = data.url;
		}, "json");
		
	};
	$scope.resetFields = function(option) {
		var key;
		if (option === 0 || option === 1) {
			for (key in $scope.edit[option]) {
				$scope.edit[option][key] = false;
			}
		} else if(option === 2) {
			$scope.array[0] = {};
			$scope.edit[0] = {};
			$scope.paidAmountError = false;
		} else {
			$scope.array[1] = {};
			$scope.edit[1] = {};
			$scope.partAmountError = false;
		}
	};
	$scope.removePayerPayee = function(key, option) {
		delete $scope.array[option][key];
		$scope.changeAmounts(option);
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
	};
	$scope.initOldBill = function() {
		$scope.id = billObj.id;
		$scope.event = billObj.event;
		$scope.description = billObj.description;
		$scope.date = billObj.date;
		$scope.amount = parseFloat(billObj.amount);
		$scope.payment = billObj.payment;
		$scope.array[0]= billObj.paid;
		$scope.array[1] = billObj.part;
		for (var key in $scope.array[0]) {
			$scope.edit[0][key] = false;
		}
		for (key in $scope.array[1]) {
			$scope.edit[1][key] = false;
		}
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
function BillOpr($scope) {
	$(".nav").children("li").eq(3).addClass('active').children("a").addClass('color-pumpkin');
	var opr = ["edit", "delete", "revive", "trash"];
	var Uopr = ["Edit", "Delete", "Revive", "Trash"];
	$scope.opr = '';
	$scope.popUp = function (option) {
		$scope.opr = opr[option];
		$scope.Uopr = Uopr[option];
		$("#confirm-modal").modal();
	};
/*
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
*/
}

function Summary($scope) {
	$(".nav").children("li").eq(0).addClass('active').children("a").addClass('color-pumpkin');
	$scope.cur_val = 0;
	$scope.cur_val2 = 0;
	$scope.ouend = parseFloat(total_data.owesyou).toFixed(2);
	$scope.uoend = parseFloat(total_data.youowe).toFixed(2);

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
		var legend = { show:true, placement: 'outside', background:'rgba(0,0,0,0)', rendererOptions: { numberRows: 0, animate:{show:true}}, location:'ne', marginTop: '7px' };
		oweyouplot.setChartOptions("legend", legend);
		//oweyouplot.setChartOptions("title", "Owes you");
		oweyouplot.setChartLevel2Options("grid", "borderWidth", 0);
		oweyouplot.setChartLevel2Options("grid", "shadow", false);
		oweyouplot.setChartLevel3Options("seriesDefaults", "rendererOptions", "dataLabelThreshold", 3);
		var __well ="rgba(0,0,0,0)";
		oweyouplot.setChartLevel2Options("grid", "background", __well); 
		//oweyouplot.setChartOptions("seriesColors", [__pumpkin, __peterRiver, __alizarin]);
		oweyouplot.setChartOptions("seriesColors", get_random_colors(data_owesyou[0].length, 0));
		oweyouplot.drawChart();
		//var youoweplot = new Chart("pie2", $.jqplot.PieRenderer, [[[0]]]);
		var youoweplot = new jqPlotChart("pie2", $.jqplot.PieRenderer, data_youowe);
		youoweplot.setChartOptions("legend", legend);
		//youoweplot.setChartOptions("title", "You Owe");
		youoweplot.setChartLevel2Options("grid", "borderWidth", 0);
		youoweplot.setChartLevel2Options("grid", "shadow", false);
		youoweplot.setChartLevel2Options("grid", "gridLineColor", "#000"); 
		youoweplot.setChartLevel2Options("grid", "background", __well); 
		youoweplot.setChartLevel3Options("seriesDefaults", "rendererOptions", "dataLabelThreshold", 10);
		//youoweplot.setChartOptions("seriesColors", [__pumpkin, __greenSea, __clouds]);
		youoweplot.setChartOptions("seriesColors", get_random_colors(data_youowe[0].length, 0));
		youoweplot.drawChart();
	};
	$scope.plot();
	$("#summary").css('visibility', 'visible');
}
