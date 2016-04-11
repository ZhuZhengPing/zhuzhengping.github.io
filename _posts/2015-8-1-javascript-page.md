---
layout : post
title : "javascript 基础分页"
category : javascript
duoshuo: true
date : 2016-4-11

---

	function DataTable(config) {

		var that = this;

		// ajax 参数
		this.url = config.url;

		// 页码数，默认为1
		this.pageIndex = config.pageIndex || 1;

		$("#pageIndex")[0].value = this.pageIndex;

		// 查询数量，默认为20
		this.pageSize = config.pageSize || 20;
		$("#pageSize")[0].value = this.pageSize;

		// 分页查询url
		this.getPageParams();

		// 加载数据
		this.tryPageAjax();

		// 绑定上一页
		$("#prevPage").click(function () {
			that.prevPage();
		});

		// 绑定下一页
		$("#nextPage").click(function () {
			that.nextPage();
		});

		// 绑定首页
		$("#firstPage").click(function () {
			that.firstPage();
		});

		// go
		$("#doSearch").click(function () {
			var index = $("#pageIndex").val();
			that.goPage(index);
		});
	}

	// 获得查询数据，待优化
	DataTable.prototype.getPageParams = function () {
		var DeptName = $("#DeptName").val();
		var EmployeeCode = $("#EmployeeCode").val();
		var CName = $("#CName").val();
		var Cornet = $("#Cornet").val();
		var PhoneNo = $("#PhoneNo").val();
		this.pageUrl = this.url + "&DeptName=" + escape(DeptName) + "&EmployeeCode=" + EmployeeCode + "&CName=" + CName + "&Cornet=" + Cornet + "&PhoneNo=" + PhoneNo + "&PageIndex=" + this.pageIndex + "&PageSize=" + this.pageSize;
	}

	// 开启查询
	DataTable.prototype.tryPageAjax = function () {
		var pageIndex = this.pageIndex;
		var pageSize = this.pageSize;
		// 分页数据
		$.get(this.pageUrl, function (data) {
			var pageTotal = data.page.count;
			var pageCount = Math.ceil(pageTotal / pageSize);

			// 设置页码信息
			$("#pageInfo").html("『页次" + pageIndex + "/" + pageCount + "页 共" + pageTotal + "条记录』");

			// 加载数据
			for (var i = 0, html = [], count = data.data.length; i < count; i++) {
				html.push("<tr>");
				html.push("<td>" + data.data[i]["CName"] + "</td>");
				html.push("<td>" + data.data[i]["EmployeeCode"] + "</td>");
				html.push("<td>" + data.data[i]["ShortDeptName"] + "</td>");
				html.push("<td>" + data.data[i]["PostName"] + "</td>");
				html.push("<td>" + data.data[i]["PhoneNo"] + "</td>");
				html.push("<td>" + data.data[i]["companyCornet"] + "</td>");
				html.push("<td><input type='button' value='同步' class='btn' /><input type='button' value='编辑' class='btn' /><input type='button' value='删除' class='btn' /></td>");
				html.push("<tr>");
			}
			$(".data_table tbody").empty().html(html.join(''));
		});
	}

	// 上一页
	DataTable.prototype.prevPage = function () {
		if (this.pageIndex <= 1) {
			this.pageIndex = 1;
			return;
		}
		// 页码加一
		this.pageIndex--;
		this.getPageParams();
		this.tryPageAjax();
	}

	// 下一页
	DataTable.prototype.nextPage = function () {
		this.pageIndex++;
		this.getPageParams();
		this.tryPageAjax();
	}

	// 首页
	DataTable.prototype.firstPage = function () {
		this.pageIndex=1;
		this.getPageParams();
		this.tryPageAjax();
	}

	// 链接页码
	DataTable.prototype.goPage = function (index) {
		this.pageIndex = index;
		this.getPageParams();
		this.tryPageAjax();
	}

	// 设置过滤条件
	DataTable.prototype.setConversion = function (conversion) {
		this.conversion = conversion;
	}















	
	