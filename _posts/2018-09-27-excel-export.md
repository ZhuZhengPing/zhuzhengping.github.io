---
layout: post
title:  "javascript excel导出"
date:   2018-01-09 16:32:18 +0800
categories: .net
tags: excel
author: Zhengping Zhu
---

* content
{:toc}

## 概念

.net 后台写excel导出的话，虽然也能实现，但是操作会相对比较麻烦，发现有一种办法能根据JSON数据导出Excel，只是格式丑一点。


















### miniui 根据列导出

使用miniui，可以获得grid的列，从而封装一个excel导出方法

```js
function exportExcel(excelName) {

            // 标题
            var columnsName = "";
            var columnsField = [];
            for (var i = 0; i < grid.columns.length; i++) {
                if (grid.columns[i].field) {
                    columnsName += grid.columns[i].header + '\t,';
                    columnsField.push(grid.columns[i].field);
                }
            }
            columnsName = columnsName.substr(0, columnsName.length - 1);

            // 内容
            var gridContent = "";
            var gridData = grid.data;
            for (var i = 0; i < gridData.length; i++) {
                for (var j = 0; j < columnsField.length; j++) {
                    gridContent += gridData[i][columnsField[j]] + '\t,';
                }
                gridContent+="\n";
            }

            //encodeURIComponent解决中文乱码      
            var uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(columnsName+"\n"+gridContent);
            //通过创建a标签实现      
            var link = document.createElement("a");
            link.href = uri;
            //对下载的文件命名      
            link.download = exportExcel+".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
}
```





