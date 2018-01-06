---
layout: post
title:  "miniui"
date:   2017-05-03 16:32:18 +0800
categories: miniui
tags: miniui
author: Zhengping Zhu
---

* content
{:toc}

### 破解js

```js
__CreateJSPath = function (js) {
    var scripts = document.getElementsByTagName("script");
    var path = "";
    for (var i = 0, l = scripts.length; i < l; i++) {
        var src = scripts[i].src;
        if (src.indexOf(js) != -1) {
            var ss = src.split(js);
            path = ss[0];
            break;
        }
    }
    var href = location.href;
    href = href.split("#")[0];
    href = href.split("?")[0];
    var ss = href.split("/");
    ss.length = ss.length - 1;
    href = ss.join("/");
    if (path.indexOf("https:") == -1 && path.indexOf("http:") == -1 && path.indexOf("file:") == -1 && path.indexOf("\/") != 0) {
        path = href + "/" + path;
    }
    return path;
}

var bootPATH = __CreateJSPath("boot.js");


//skin
var skin = getCookie("miniuiSkin");
if (skin) {
    document.write('<link href="' + bootPATH + 'miniui/themes/' + skin + '/skin.css" rel="stylesheet" type="text/css" />');
}
document.write('<link href="' + bootPATH + 'miniui/themes/default/miniui.css" rel="stylesheet" type="text/css" />');
document.write('<link href="' + bootPATH + 'miniui/themes/icons.css" rel="stylesheet" type="text/css" />');

mini_debugger = true;

//miniui
document.write('<script src="' + bootPATH + 'jquery/jquery-1.12.3.min.js" type="text/javascript"></sc' + 'ript>');

document.write('<script src="' + bootPATH + 'miniui/miniui.3.4.js" type="text/javascript" ></sc' + 'ript>');
//document.write('<script src="' + bootPATH + 'miniui/miniui.js" type="text/javascript" ></sc' + 'ript>');
//document.write('<link href="' + bootPATH + 'miniui/themes/bootstrap/skin.css" rel="stylesheet" type="text/css" />');


```












### 单页模板

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title></title>
    <link href="~/Content/css/MiniUIBaseCss.css" rel="stylesheet" />
    <script src="~/Scripts/jquery/jquery-1.11.3.min.js" type="text/javascript"></script>
    <script src="~/Scripts/boot.js"></script>
    <script src="~/Scripts/base.js"></script>
    <link href="~/Scripts/miniui/themes/pure/skin.css" rel="stylesheet" type="text/css" />
    <link href="~/Scripts/jquery.easyui/themes/icon.css" rel="stylesheet" />
</head>
<body>

    @RenderSection("MoreDiv",false)

    <div id="layout1" class="mini-layout" style="width:100%;height:100%;">

        <!-- 标题搜索以及按钮样式 -->
        <div region="north" showcollapsebutton="false" showheader="false" style="border:none;">
            <div id="toolbar1" class="mini-toolbar" style="border:none;background:none;" plain="true">

                <div id="AdvanceButtons">
                    @if (Html.GetBtnRole("新增"))
                    {
                        <a id="btnAdd" class="mini-button" iconcls="icon-add" style="display:none;" onclick="baseAdd">新增</a>
                    }
                    @if (Html.GetBtnRole("修改"))
                    {
                        <a id="btnEdit" class="mini-button" iconcls="icon-edit" style="display:none;" onclick="baseEdit">修改</a>
                    }
                    @if (Html.GetBtnRole("保存"))
                    {
                        <a id="btnSave" class="mini-button" iconcls="icon-save" style="display:none;" onclick="baseSave">保存</a>
                    }
                    @if (Html.GetBtnRole("作废"))
                    {
                        <a id="btnCancel" class="mini-button" iconcls="" style="display:none;" onclick="baseCancel">作废</a>
                    }
                    @if (Html.GetBtnRole("审核"))
                    {
                        <a id="btnAudit" class="mini-button" iconcls="" style="display:none;" onclick="baseAudit">审核</a>
                    }
                    @if (Html.GetBtnRole("删除"))
                    {
                        <a id="btnDelete" class="mini-button" iconcls="icon-remove" style="display:none;" onclick="baseDelete">删除</a>
                    }
                    <!-- 添加更多按钮 -->
                    @RenderSection("AdvanceButtons", false)

                    @if (Html.GetBtnRole("导出Excel"))
                    {
                        <a id="btnExportExcel" class="mini-button" onclick="baseExportExcel">导出Excel</a>
                    }
                </div>

                <div id="searchForm">
                    <div id="baseSearchControl">
                        <!-- 搜索框信息 -->
                        @RenderSection("BaseSearch")
                    </div>

                    <div id="advanceSearchControl">
                        @RenderSection("AdvanceSearch", false)
                    </div>
                    

                    <a id="btnBaseSearch" class="mini-button" iconcls="icon-search" onclick="baseSearch">查询</a>
                    <a id="btnAdvanceSearch" class="mini-button" onclick="baseAdvanceSearch">高级查询</a>
                    <a id="btnClear" class="mini-button" iconcls="icon-clear" onclick="baseClear">清空</a>

                    <!-- 添加更多按钮 -->
                    @RenderSection("Buttons", false)
                </div>
            </div>
        </div>

        <!-- 主菜单列表 -->
        <div region="center" showcollapsebutton="false" showheader="false" showsplit="false" showspliticon="true" style="border:none;">
            
                    <div id="dataGrid" class="mini-datagrid" showsummaryrow="true" ondrawsummarycell="baseDrawSummaryCell" oncellclick="baseOnCellClick" showpager="true" pagesize="25" style="width:auto; height:100%;border:none;" allowcellselect="true">
                        <div property="columns">
                            @RenderSection("DataGrid")
                        </div>
                    </div>
                
        </div>
    </div>
    <script type="text/javascript">
        var options = {};
        var grid;
        // 查询
        function baseSearch() {
            // 获得表单查询数据
            var form = new mini.Form("#searchForm");
            var data = form.getData(true, false);
            // 查询前函数
            if (typeof search == 'function') {
                search(data);
            }
            grid.load(data);
        }
        function baseDrawSummaryCell(e) {
            if (typeof onDrawSummaryCell == 'function') {
                onDrawSummaryCell(e);
            }
        }
        function baseOnCellClick(e) {
            if (typeof OnCellClick == 'function') {
                OnCellClick(e);
            }
        }
        // 高级查询
        function baseAdvanceSearch() {

            if ($("#advanceSearchControl").css("display") == "none") {
                $("#advanceSearchControl").css("display", "inline");
                mini.get("btnAdvanceSearch").setText("收起");
            } else {
                $("#advanceSearchControl").hide();
                mini.get("btnAdvanceSearch").setText("高级查询");

                // 清空高级查询
                var advanceForm = new mini.Form("#advanceSearchControl");
                advanceForm.clear();
                // 高级查询特殊清空
                if (typeof advanceSearchAfter == 'function') {
                    advanceSearchAfter();
                }
            }

            if (typeof advanceSearch == 'function') {
                advanceSearch(element);
            }

            mini.get("layout1").updateRegion("north", { height: $("#toolbar1").outerHeight(true) });
        }

        // 清空
        function baseClear() {
            var form = new mini.Form("#searchForm");
            form.clear();

            if (typeof baseClearAfter == 'function') {
                baseClearAfter();
            }
        }

        // 导出
        function baseExportExcel() {
            // 获得表单查询数据
            var form = new mini.Form("#searchForm");
            var data = form.getData(true, false);
            if (typeof exportExcel == 'function') {
                exportExcel(data);
            }
            var url = '';
            var i = 0;
            for (var item in data) {
                if (i == 0) {
                    url += '?' + item + '=' + data[item];
                }
                else {
                    url += '&' + item + '=' + data[item];
                }
                i++;
            }
            window.open(options.exportUrl + url, 'DownFile');
        }

        // 初始化
        function baseInit() {

            if (!options.url) {
                mini.alert("请设置参数！");
                return;
            }
            //$("#dataGridTitle").attr("title", options.title);

            mini.parse();

            grid = mini.get("dataGrid");

            // 如果高级查询里面有控件，则显示高级查询，否则删除该按钮
            if ($('#advanceSearchControl').html().trim() == "") {
                $("#btnAdvanceSearch").remove();
            }

            // 如果顶部没有按钮，就把它隐藏掉
            if ($("#AdvanceButtons a").size() == $("#AdvanceButtons .AytgirityHide").size()) {
                $("#AdvanceButtons").remove();
            }


            mini.get("layout1").updateRegion("north", { height: $("#toolbar1").outerHeight(true) });

            grid.setUrl(options.url);

            grid.setShowPager(options.isPaged);
            grid.setMultiSelect(options.multiselect)
            grid.setShowSummaryRow(options.isShowSummaryRow);
            if (options.fitColumns)
                grid.setFitColumns(options.fitColumns);
            grid.setSizeList(options.sizeList||[10,20,50,100,200]);
            grid.setPageSize(options.pageSize || 25);

            if (typeof baseInitBefore == 'function') {
                baseInitBefore();
            }

            // 执行查询
            baseSearch();
        }
    </script>

    @RenderSection("Script")

    <script type="text/javascript">
        baseInit();
    </script>
    <style type="text/css">
        .mini-grid-rows-view {
            width: 99.999% !important;
        }
    </style>
</body>
</html>


```

### 上下结构模板

```html
<!-- 类似临时收费模板 -->
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title></title>
        <link href="~/Content/css/MiniUIBaseCss.css" rel="stylesheet" />
        <script src="~/Scripts/jquery/jquery-1.11.3.min.js" type="text/javascript"></script>
        <script src="~/Scripts/boot.js"></script>
        <script src="~/Scripts/base.js"></script>
        <link href="~/Scripts/miniui/themes/pure/skin.css" rel="stylesheet" type="text/css" />
        <link href="~/Scripts/jquery.easyui/themes/icon.css" rel="stylesheet" />

        
    </head>
<body>
    <div id="layout1" class="mini-layout" style="width:100%;height:100%;">
        
        <!-- 标题搜索以及按钮样式 -->
        <div region="north" showcollapsebutton="false" showheader="false" style="border:none;">
            <div id="toolbar1" class="mini-toolbar" style="border:none;background:none;" plain="true">
                <div id="AdvanceButtons">
                    @if (Html.GetBtnRole("新增"))
                    {
                        <a id="btnAdd" class="mini-button" iconcls="" onclick="baseAdd">新增</a>
                    }
                    @if (Html.GetBtnRole("修改"))
                    {
                        <a id="btnEdit" class="mini-button" iconcls="" onclick="baseEdit">修改</a> 
                    }
                    @if (Html.GetBtnRole("保存"))
                    {
                        <a id="btnSave" class="mini-button" iconcls="icon-save" style="display:none;" onclick="baseSave">保存</a>
                     }
                    @if (Html.GetBtnRole("作废"))
                    {
                        <a id="btnCancel" class="mini-button" iconcls="" style="display:none;" onclick="baseCancel">作废</a>
                    }
                    @if (Html.GetBtnRole("审核"))
                    {
                        <a id="btnAudit" class="mini-button" iconcls="" style="display:none;" onclick="baseAudit">审核</a>
                    }
                    <a id="btnBack" class="mini-button" iconcls="icon-back" style="display:none;" onclick="baseBack">返回</a>
                    @if (Html.GetBtnRole("删除"))
                    {
                        <a id="btnDelete" class="mini-button" iconcls="icon-remove" style="display:none;" onclick="baseDelete">删除</a>
                    }
                    <!-- 添加更多按钮 -->
                    @RenderSection("Buttons", false)
                </div>
                
                <div id="searchForm">
                    <div id="baseSearchControl">
                        <!-- 搜索框信息 -->
                        @RenderSection("BaseSearch")
                    </div>

                    <div id="advanceSearchControl">
                        @RenderSection("AdvanceSearch", false)
                    </div>
                    
                    <a id="btnBaseSearch" class="mini-button" iconcls="icon-search" onclick="baseSearch">查询</a>
                    <a id="btnAdvanceSearch" class="mini-button" onclick="baseAdvanceSearch">高级查询</a>
                    <a id="btnClear" class="mini-button" iconcls="icon-clear" onclick="baseClear">清空</a>
                    
                </div>
            </div>
        </div>

        <!-- 子菜单 -->
        <div region="south" showcollapsebutton="false" showheader="false" style="border:none;">
            <div class="mini-tabs" activeindex="0" plain="false" style="overflow:hidden;height:100%;border:none;padding:0;margin:0;">
                <div title="" id="childDataGridTitle">
                    <div class="mini-toolbar" id="btnAddRow" style="display:none;">
                        @if (Html.GetBtnRole("增行"))
                        {
                            <a class="mini-button" plain="true" iconcls="icon-collapse" tooltip="增行" onclick="baseAddRow">增行</a>
                        }

                        <!-- 添加更多按钮 -->
                        @RenderSection("ChildButtons", false)
                    </div>
                    <div id="childDataGrid" class="mini-datagrid" showpager="false" style="width:auto; height:100%;border:none;" allowcelledit="true" allowcellselect="true" oncellcommitedit="baseChildDataGridCommitedit" oncellbeginedit="baseChildDataGridBeginedit">
                        <div property="columns">
                            @RenderSection("ChildDataGrid")
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 主菜单列表 -->
        <div region="center" showcollapsebutton="false" showheader="false" showsplit="false" showspliticon="true" style="border:none;overflow:hidden;">
            <div id="parentDataGridMain" class="mini-tabs" activeindex="0" plain="false" style="overflow:hidden;height:99%;border:none;">
                <div title=" " id="parentDataGridTitle">
                    <div id="parentDataGrid" class="mini-datagrid" showpager="true" pagesize="20" onselectionchanged="baseSelectionChanged" onrowdblclick="baseRowDbClick" style="height:100%;border:none;" allowcelledit="false" allowcellselect="true">
                        <div property="columns">
                            @RenderSection("ParentDataGrid")
                        </div>
                    </div>
                </div>
            </div>

            <!-- 主菜单明细 -->
            <div id="parentDataGridDetail" style="display:none;border-top: 1px solid #ccc;">
                <div id="detailForm">
                    <ul>
                        <!-- 双击后主菜单明细 -->
                        @RenderSection("Detail", false)
                    </ul>
                </div>
            </div>
        </div>
     </div> 
    <script type="text/javascript">

        var options = {};

        var parentGrid;
        var childGrid;


        // 查询
        function baseSearch() {
            // 获得表单查询数据
            var form = new mini.Form("#searchForm");
            var data = form.getData(true, false);
            // 查询前函数
            if (typeof search == 'function') {
                search(data);
            }
            parentGrid.load(data);
        }

        // 高级查询
        function baseAdvanceSearch() {

            if ($("#advanceSearchControl").css("display") == "none") {
                $("#advanceSearchControl").css("display", "inline");
                mini.get("btnAdvanceSearch").setText("收起");
            } else {
                $("#advanceSearchControl").hide();
                mini.get("btnAdvanceSearch").setText("高级查询");

                // 清空高级查询
                var advanceForm = new mini.Form("#advanceSearchControl");
                advanceForm.clear();
                // 高级查询特殊清空
                if (typeof advanceSearchAfter == 'function') {
                    advanceSearchAfter();
                }
            }

            if (typeof advanceSearch == 'function') {
                advanceSearch(element);
            }

            mini.get("layout1").updateRegion("north", { height: $("#toolbar1").outerHeight(true) });
        }

        // 清空
        function baseClear() {
            var form = new mini.Form("#searchForm");
            form.clear();

            if (typeof baseClearAfter == 'function') {
                baseClearAfter();
            }
        }

        // 父列表选择，加载子列表
        function baseSelectionChanged(e) {
            // 获得选择的对象
            var recode = parentGrid.getSelected();
            childGrid.load({
                id: recode.ID || recode.RecordID
            });
        }

        // 父列表双击
        function baseRowDbClick(e) {

            // 记录初始高度
            options.baseToolBarHeight = $("#toolbar1").outerHeight(true);
            options.baseChildDataGridHeight = childGrid.getHeight();

            // 调整按钮样式
            $("#searchForm").addClass("dbclick");

            baseSetSize();

            // 获得选择的对象
            var recode = parentGrid.getSelected();
            id = recode.ID;
            // 隐藏当前页面
            baseShowOrHidden(true);

            var form = new mini.Form("#detailForm");
            form.setData(recode, false);
            // 如果已审核，则不能编辑
            if (recode.Status == 1) {
                form.setEnabled(false);
                auditStatus();
            } else if (recode.Status == -1) {
                form.setEnabled(true);
                addStatus();
            }
            else {
                form.setEnabled(true);
                saveOrEditStatus();
            }

            // 回调函数
            if (typeof rowDbClickAfter == 'function') {
                rowDbClickAfter(recode);
            }
        }

        // 返回
        function baseBack() {

            baseSetSize(true);

            // 取消按钮样式
            $("#searchForm").removeClass("dbclick");
            // 还原子菜单高度
            //childGrid.setHeight(options.baseChildDataGridHeight);

            // 隐藏显示部分元素
            baseShowOrHidden();

            // 清空表单
            var form = new mini.Form("#detailForm");
            form.clear();

            // 重新加载主菜单
            baseSearch();

            // 回调
            if (typeof backAfter == 'function') {
                backAfter();
            }
        }

        // 设置高度
        function baseSetSize(choose) {
            if (choose) {
                mini.get("layout1").updateRegion("center", { height: $(window).height() * 0.75 });
                mini.get("layout1").updateRegion("south", { height: $(window).height() * 0.2 });
                mini.get("layout1").updateRegion("north", { height: options.baseToolBarHeight || $("#toolbar1").outerHeight(true) });
            } else {
                mini.get("layout1").updateRegion("north", { height: 35 });
                mini.get("layout1").updateRegion("center", { height: $("#parentDataGridDetail").outerHeight(true) });
                mini.get("layout1").updateRegion("south", { height: $(window).outerHeight(true) - $("#parentDataGridDetail").outerHeight(true) - 46 });
                // 是否显示子菜单toolbar
                showOrHideChildToolbar();
            }
        }

        // 双击或返回元素
        function baseShowOrHidden(choose) {

            if (choose) {
                $("#btnBaseSearch").hide();
                $("#btnAdvanceSearch").hide();
                $("#btnClear").hide();

                $("#baseSearchControl").hide();
                $("#advanceSearchControl").hide();

                $("#btnAdd").hide();
                mini.get("parentDataGridMain").hide();

                $("#parentDataGridDetail").show();
                $("#btnBack").show();
                
                $("#btnAudit").show();
                $("#btnSave").show();
                $("#btnEdit").hide();
            } else {
                $("#btnBaseSearch").show();
                $("#btnAdvanceSearch").show();
                $("#btnClear").show();
                $("#btnAddRow").hide();
                $("#baseSearchControl").css("display", "inline");
                // 判断高级查询是否启用
                var advanceText = mini.get("btnAdvanceSearch").getText();
                if (advanceText == "收起") {
                    baseAdvanceSearch();
                }

                $("#btnAdd").show();
                mini.get("parentDataGridMain").show();

                $("#parentDataGridDetail").hide();
                $("#btnBack").hide();

                $("#btnAudit").hide();
                $("#btnSave").hide();
                $("#btnEdit").show();
                //$("#AdvanceButtons").hide();
            }
        }

        // 子菜单曾行
        function baseAddRow() {
            var row = {};

            mini.get("childDataGrid").addRow({}, 0);
        }

        // 判断是否显示子菜单工具栏
        function showOrHideChildToolbar() {
            var isShow = false;
            $("#btnAddRow a").each(function () {
                if ($(this).css("display") != "none") {
                    isShow = true;
                    return false;
                }
            });
            if (isShow) {
                $("#btnAddRow").show();

            } else {
                $("#btnAddRow").hide();
            }
            // 重新设置子菜单高度
            childGrid.setHeight(mini.get("layout1").getRegion("south").height - $("#btnAddRow").outerHeight(true) - 38);
            return isShow;
        }

        // 子菜单行开始编辑
        function baseChildDataGridBeginedit(e) {
            // 列表页子菜单不能编辑
            if ($("#parentDataGridDetail").css("display") == "none") {
                e.cancel = true;
            } else {
                if (typeof childDataGridBeginedit == 'function') {
                    childDataGridBeginedit(e);
                } else {
                    e.cancel = false;
                }
            }
        }

        // 子菜单行结束编辑
        function baseChildDataGridCommitedit(e) {
            if (typeof childDataGridCommitedit == 'function') {
                childDataGridCommitedit(e);
            }
        }

        // 初始化
        function baseInit() {

            if (!options.parentUrl || !options.childUrl) {
                mini.alert("请设置参数！");
                return;
            }

            $("#parentDataGridTitle").attr("title", options.parentTitle);
            $("#childDataGridTitle").attr("title", options.childTitle);

            mini.parse();

            parentGrid = mini.get("parentDataGrid");
            childGrid = mini.get("childDataGrid");

            // 如果高级查询里面有控件，则显示高级查询，否则删除该按钮
            if ($('#advanceSearchControl').html().trim() == "") {
                $("#btnAdvanceSearch").remove();
            }

            // 如果顶部没有按钮，就把它隐藏掉
            if ($("#AdvanceButtons a").size() == $("#AdvanceButtons .AytgirityHide").size()) {
                $("#AdvanceButtons").remove();
            }

            mini.get("layout1").updateRegion("north", { height: $("#toolbar1").outerHeight(true) });

            parentGrid.setUrl(options.parentUrl);
            childGrid.setUrl(options.childUrl);

            parentGrid.setShowPager(options.isPaged);
            parentGrid.setMultiSelect(options.multiselect)
            parentGrid.setShowSummaryRow(options.isShowSummaryRow);
            parentGrid.setFitColumns(options.fitColumns || true);
            parentGrid.setSizeList(options.sizeList || [10, 20, 50, 100, 200]);
            parentGrid.setPageSize(options.pageSize || 25);

            // 调整详细菜单的高度
            baseSetSize(true);

            // 执行查询
            baseSearch();
        }

        // 添加时按钮显示
        function addStatus() {
            $("#btnAdd").hide();
            $("#btnEdit").hide();
            $("#btnCancel").hide();
            $("#btnSave").show();
            $("#btnAudit").hide();
            $("#btnBack").show();
            $("#btnDelete").hide();
        }

        // 保存后按钮显示
        function saveOrEditStatus() {
            $("#btnAdd").hide();
            $("#btnEdit").hide();
            $("#btnCancel").show();
            $("#btnSave").show();
            $("#btnAudit").show();
            $("#btnBack").show();
            $("#btnDelete").show();
        }

        // 审核后按钮显示
        function auditStatus() {
            $("#btnAdd").hide();
            $("#btnEdit").hide();
            $("#btnCancel").hide();
            $("#btnSave").hide();
            $("#btnAudit").hide();
            $("#btnBack").show();
            $("#btnDelete").hide();
        }
    </script>

    @RenderSection("Script")   
    
    <script type="text/javascript">
        baseInit();
    </script>
    <style type="text/css">
        .mini-grid-rows-view{
            width:99.999% !important;
        }
    </style>
</body>
</html>


```

### 上中下结构模板

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title></title>
    <link href="~/Content/css/MiniUIBaseCss.css" rel="stylesheet" />
    <script src="~/Scripts/jquery/jquery-1.11.3.min.js" type="text/javascript"></script>
    <script src="~/Scripts/boot.js"></script>
    <script src="~/Scripts/base.js"></script>
    <link href="~/Scripts/miniui/themes/pure/skin.css" rel="stylesheet" type="text/css" />
    <link href="~/Scripts/jquery.easyui/themes/icon.css" rel="stylesheet" />
    <style type="text/css">
        #detailForm:after{
            content:'';
            display:block;
            clear:both;
        }
    </style>
</head>
<body>
    <div id="layout1" class="mini-layout" style="width:100%;height:100%;">
        
        <!-- 标题搜索以及按钮样式 -->
        <div region="north" showcollapsebutton="false" showheader="false" style="border:none;">
            <div id="toolbar1" class="mini-toolbar" style="border:none;background:none;" plain="true">
                <div id="AdvanceButtons">
                    @if (Html.GetBtnRole("新增"))
                    {
                        <a id="btnAdd" class="mini-button" iconcls="" onclick="baseAdd">新增</a>
                    }
                    @if (Html.GetBtnRole("修改"))
                    {
                        <a id="btnEdit" class="mini-button" iconcls="" onclick="baseEdit">修改</a>
                    }
                    @if (Html.GetBtnRole("保存"))
                    {
                        <a id="btnSave" class="mini-button" iconcls="icon-save" style="display:none;" onclick="baseSave">保存</a>
                    }
                    @if (Html.GetBtnRole("作废"))
                    {
                        <a id="btnCancel" class="mini-button" iconcls="" style="display:none;" onclick="baseCancel">作废</a>
                    }
                    @if (Html.GetBtnRole("审核"))
                    {
                        <a id="btnAudit" class="mini-button" iconcls="" style="display:none;" onclick="baseAudit">审核</a>
                    }
                    @if (Html.GetBtnRole("反审核"))
                    {
                        <a id="btnNoAudit" class="mini-button" iconcls="" style="display:none;" onclick="baseNoAudit">反审核</a>
                    }
                    <a id="btnBack" class="mini-button no-control-button" iconcls="icon-back" style="display:none;" onclick="baseBack">返回</a>
                    
                    <!-- 添加更多按钮 -->
                    @RenderSection("Buttons", false)
                </div>

                <div id="searchForm">
                    <div id="baseSearchControl">
                        <!-- 搜索框信息 -->
                        @RenderSection("BaseSearch")
                    </div>

                    <div id="advanceSearchControl">
                        @RenderSection("AdvanceSearch", false)
                    </div>

                    <a id="btnBaseSearch" class="mini-button" iconcls="icon-search" onclick="baseSearch">查询</a>
                    <a id="btnAdvanceSearch" class="mini-button" onclick="baseAdvanceSearch">高级查询</a>
                    <a id="btnClear" class="mini-button" iconcls="icon-clear" onclick="baseClear">清空</a>

                </div>
            </div>
        </div>

        <!-- 底部菜单 -->
        <div region="south" showcollapsebutton="false" showheader="false" style="border:none;">
            <div id="tabBottomDataGrid" class="mini-tabs" activeindex="0" plain="false" style="overflow:hidden;height:100%;border:none;padding:0;margin:0;" onactivechanged="baseSelectionChanged">
                @RenderSection("BottomDataGrid")
            </div>
        </div>

        <!-- 主菜单列表 -->
        <div region="center" showcollapsebutton="false" showheader="false" showsplit="false" showspliticon="true" style="border:none;overflow:hidden;">
            <div id="parentDataGridMain" class="mini-tabs" activeindex="0" plain="false" style="overflow:hidden;height:99%;border:none;">
                <div title=" " id="parentDataGridTitle">
                    <div id="parentDataGrid" class="mini-datagrid" showpager="true" pagesize="20" onselectionchanged="baseSelectionChanged" onrowdblclick="baseRowDbClick" style="height:100%;border:none;" allowcelledit="false" allowcellselect="true">
                        <div property="columns">
                            @RenderSection("ParentDataGrid")
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 主菜单明细 -->
            <div id="parentDataGridDetail" style="display:none;border-top: 1px solid #ccc;width:100%;margin-bottom:5px;">
                <div id="detailForm">
                    <ul>
                        <!-- 双击后主菜单明细 -->
                        @RenderSection("Detail", false)
                    </ul>
                </div>
            </div>

            <div id="childDataGridTabs" class="mini-tabs" activeindex="0" plain="false" style="border:none;display:none;width:100%;clear:both;">
                <div title="" id="childDataGridTitle">
                    <div class="mini-toolbar" id="btnAddRowToolBar" >
                        <a class="mini-button" id="btnIntoAmount" plain="true" iconcls="icon-collapse" tooltip="一键带入金额" onclick="baseIntoAmount">一键带入金额</a>
                        @RenderSection("ChildDataGridButtons", false)
                    </div>
                    <div id="childDataGrid" class="mini-datagrid" showpager="false" style="width:auto; height:100%;border:none;" allowcelledit="true" allowcellselect="true" oncellcommitedit="baseMiddleDataGridCommitedit" oncellbeginedit="baseMiddleDataGridBeginedit">
                        <div property="columns">
                            @RenderSection("ChildDataGrid")
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script type="text/javascript">
        // 当前记录ID
        var id;

        // 主 grid
        var parentGrid;

        // 中间 grid
        var childGrid;

        // 底部 tabs
        var tabs;

        // 冲抵子表
        var relationDetail = [];

        // 冲抵主表
        var relationMain = [];

        // 查询
        function baseSearch() {
            // 获得表单查询数据
            var form = new mini.Form("#searchForm");
            var data = form.getData(true, false);
            // 查询前函数
            if (typeof search == 'function') {
                search(data);
            }
            parentGrid.load(data);
        }

        // 高级查询
        function baseAdvanceSearch() {

            if ($("#advanceSearchControl").css("display") == "none") {
                $("#advanceSearchControl").css("display", "inline");
                mini.get("btnAdvanceSearch").setText("收起");
            } else {
                $("#advanceSearchControl").hide();
                mini.get("btnAdvanceSearch").setText("高级查询");

                // 清空高级查询
                var advanceForm = new mini.Form("#advanceSearchControl");
                advanceForm.clear();
                // 高级查询特殊清空
                if (typeof advanceSearchAfter == 'function') {
                    advanceSearchAfter();
                }
            }

            if (typeof advanceSearch == 'function') {
                advanceSearch(element);
            }

            mini.get("layout1").updateRegion("north", { height: $("#toolbar1").outerHeight(true) });
        }

        // 清空
        function baseClear() {
            var form = new mini.Form("#searchForm");
            form.clear();

            if (typeof baseClearAfter == 'function') {
                baseClearAfter();
            }
        }

        // 父列表选择，加载子列表
        // 是否执行子菜单
        function baseSelectionChanged(e) {
            // 获得选择的对象
            var record = parentGrid.getSelected();
            if (record) {
                if (typeof afterSelectChanged == 'function') {
                    afterSelectChanged(record);
                } else {
                    mini.get($(tabs.getBodyEl()).find('.mini-datagrid').attr('id')).load({
                        id: record.ID || record.RecordID
                    });
                }
            }
        }

        // 父列表双击
        function baseRowDbClick(e) {

            // 记录初始高度
            options.baseToolBarHeight = $("#toolbar1").outerHeight(true);
            options.baseChildDataGridHeight = childGrid.getHeight();

            // 调整按钮样式
            $("#searchForm").addClass("dbclick");


            // 获得选择的对象
            var recode = parentGrid.getSelected();
            //id = recode.ID;
            // 隐藏当前页面
            baseShowOrHidden(true);
            baseSetSize();

            var form = new mini.Form("#detailForm");
            form.setData(recode, false);
            // 如果已审核，则不能编辑
            if (recode.Status == 1) {
                form.setEnabled(false);
                auditStatus();
            } else if (recode.Status == -1) {
                form.setEnabled(true);
                addStatus();
            }
            else {
                form.setEnabled(true);
                saveOrEditStatus();
            }

            // 回调函数
            if (typeof rowDbClickAfter == 'function') {
                rowDbClickAfter(recode);
            }
        }

        // 返回
        function baseBack() {

            baseSetSize(true);

            // 取消按钮样式
            $("#searchForm").removeClass("dbclick");
            // 还原子菜单高度
            //childGrid.setHeight(options.baseChildDataGridHeight);

            // 隐藏显示部分元素
            baseShowOrHidden();

            // 清空表单
            var form = new mini.Form("#detailForm");
            form.clear();

            // 重新加载主菜单
            baseSearch();

            // 回调
            if (typeof backAfter == 'function') {
                backAfter();
            }
        }

        // 设置高度
        function baseSetSize(choose) {
            var windowHeight = $(window).height();
            if (choose) {
                mini.get("layout1").updateRegion("center", { height: windowHeight * 0.75 });
                mini.get("layout1").updateRegion("south", { height: windowHeight * 0.2 });
                mini.get("layout1").updateRegion("north", { height: options.baseToolBarHeight || $("#toolbar1").outerHeight(true) });
            } else {
                mini.get("layout1").updateRegion("north", { height: 35 });
                mini.get("layout1").updateRegion("south", { height: windowHeight * 0.2 });
                var childHeight = windowHeight - mini.get("layout1").getRegion("south").height - mini.get("layout1").getRegion("north").height - $("#parentDataGridDetail").outerHeight(true)-50-$("#btnAddRowToolBar").outerHeight(true);
                mini.get("childDataGrid").setHeight(Math.floor(childHeight));
            }
        }

        // 双击或返回元素
        function baseShowOrHidden(choose) {

            if (choose) {
                $("#btnBaseSearch").hide();
                $("#btnAdvanceSearch").hide();
                $("#btnClear").hide();

                $("#baseSearchControl").hide();
                $("#advanceSearchControl").hide();

                $("#btnAdd").hide();
                mini.get("parentDataGridMain").hide();
                mini.get("childDataGridTabs").show();

                $("#parentDataGridDetail").show();
                $("#btnBack").show();

                $("#btnAudit").show();
                $("#btnSave").show();
                $("#btnEdit").hide();
            } else {
                $("#btnBaseSearch").show();
                $("#btnAdvanceSearch").show();
                $("#btnClear").show();
                $("#btnAddRow").hide();
                $("#baseSearchControl").css("display", "inline");
                // 判断高级查询是否启用
                var advanceText = mini.get("btnAdvanceSearch").getText();
                if (advanceText == "收起") {
                    baseAdvanceSearch();
                }

                $("#btnAdd").show();
                mini.get("parentDataGridMain").show();
                mini.get("childDataGridTabs").hide();

                $("#parentDataGridDetail").hide();
                $("#btnBack").hide();

                $("#btnAudit").hide();
                $("#btnSave").hide();
                $("#btnEdit").show();
            }
        }

        // 中间菜单增行
        function baseMiddleAddRow() {
            var row = {};

            if (typeof middleAddRow == 'function') {
                middleAddRow(row);
            }

            middleGrid.addRow(row, 0);
        }

        // 中间菜单行编辑
        function baseMiddleDataGridCommitedit(e) {
            if (typeof middleDataGridCommitedit == 'function') {
                middleDataGridCommitedit(e);
            }
        }

        // 初始化
        function baseInit() {

            if (!options.parent || !options.child) {
                mini.alert("请设置参数！");
                return;
            }

            $("#parentDataGridTitle").attr("title", options.parent.title);
            $("#childDataGridTitle").attr("title", options.child.title);

            mini.parse();

            parentGrid = mini.get("parentDataGrid");
            childGrid = mini.get("childDataGrid");
            tabs = mini.get("tabBottomDataGrid");

            // 如果高级查询里面有控件，则显示高级查询，否则删除该按钮
            if ($('#advanceSearchControl').html().trim() == "") {
                $("#btnAdvanceSearch").remove();
            }

            // 如果顶部没有按钮，就把它隐藏掉
            if ($("#AdvanceButtons a:not(.no-control-button)").size() == $("#AdvanceButtons .AytgirityHide").size()) {
                $("#AdvanceButtons").remove();
            }

            mini.get("layout1").updateRegion("north", { height: $("#toolbar1").outerHeight(true) });

            parentGrid.setUrl(options.parent.url);
            childGrid.setUrl(options.child.url);

            parentGrid.setShowPager(options.parent.isPaged);
            parentGrid.setMultiSelect(options.parent.multiselect)
            parentGrid.setShowSummaryRow(options.parent.isShowSummaryRow);
            parentGrid.setFitColumns(options.parent.fitColumns || true);
            parentGrid.setSizeList(options.parent.sizeList || [10, 20, 50, 100, 200]);
            parentGrid.setPageSize(options.parent.pageSize || 25);

            childGrid.setShowPager(options.child.isPaged);
            childGrid.setMultiSelect(options.child.multiselect)
            childGrid.setShowSummaryRow(options.child.isShowSummaryRow);
            childGrid.setFitColumns(options.child.fitColumns || true);
            childGrid.setSizeList(options.child.sizeList || [10, 20, 50, 100, 200]);
            childGrid.setPageSize(options.child.pageSize || 25);

            // 调整详细菜单的高度
            baseSetSize(true);

            // 执行查询
            baseSearch();
        }

        // 添加时按钮显示
        function addStatus() {
            $("#btnAdd").hide();
            $("#btnEdit").hide();
            $("#btnCancel").hide();
            $("#btnSave").show();
            $("#btnAudit").hide();
            $("#btnNoAudit").hide();
            $("#btnBack").show();
            if (typeof afterAddStatus == 'function') {
                afterAddStatus();
            }
        }

        // 保存后按钮显示
        function saveOrEditStatus() {
            $("#btnAdd").hide();
            $("#btnEdit").hide();
            $("#btnCancel").show();
            $("#btnSave").show();
            $("#btnAudit").show();
            $("#btnNoAudit").hide();
            $("#btnBack").show();

            if (typeof afterSaveOrEditStatus == 'function') {
                afterSaveOrEditStatus();
            }
        }

        // 审核后按钮显示
        function auditStatus() {
            $("#btnAdd").hide();
            $("#btnEdit").hide();
            $("#btnCancel").hide();
            $("#btnSave").hide();
            $("#btnAudit").hide();
            $("#btnNoAudit").show();
            $("#btnBack").show();

            if (typeof afterAuditStatus == 'function') {
                afterAuditStatus();
            }
        }

        // 编辑
        function baseEdit() {
            $("#btnEdit").hide();
            baseRowDbClick();
            if (typeof edit == 'function') {
                edit();
            }
        }

        // 保存
        function baseSave() {
            $("#btnSave").hide();
            if (typeof save == 'function') {
                save();
            }
        }

        // 审核
        function baseAudit() {
            $("#btnAudit").hide();
            if (typeof audit == 'function') {
                audit();
            }
        }

        function baseMiddleDataGridCommitedit(e) {
            if (typeof middleDataGridCommitedit == 'function') {
                middleDataGridCommitedit(e);
            }
        }
        function baseMiddleDataGridBeginedit(e) {
            if (typeof middleDataGridBeginedit == 'function') {
                middleDataGridBeginedit(e);
            }
        }
    </script>
    @RenderSection("Script")

    <script type="text/javascript">
        baseInit();
    </script>
    <style type="text/css">
        .mini-grid-rows-view {
            width: 99.999% !important;
        }
    </style>
</body>
</html>

```














