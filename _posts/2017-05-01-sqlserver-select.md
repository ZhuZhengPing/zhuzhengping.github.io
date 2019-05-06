---
layout: post
title:  "Sql 高级查询"
date:   2017-05-01 16:32:18 +0800
categories: sql
tags: sql
author: Zhengping Zhu
---

* content
{:toc}

### 行转列

```sql
select * from ContractInfo c 
outer apply(
 select [HouseIDs]= STUFF(REPLACE(REPLACE((
	SELECT HouseID FROM ContractHouseRelation N
	WHERE ContractID = c.RecordID and N.IsValid='1' FOR XML AUTO), '<N HouseID="', ','), '"/>', ''), 1, 1, '')
)zz
OUTER APPLY(select [HouseNames]=STUFF(REPLACE(REPLACE((SELECT (x.Name+g.Name+f.Name+I.HouseNo) as HouseNo  FROM ContractHouseRelation N 
	inner join HouseInfo I on N.HouseID = i.RecordID
	inner join BuildingFloorRelation AS f ON I.RelationID = f.RecordID
	inner join BuildingFloorRelation AS g ON f.ParentID = g.RecordID 
	inner join BuildingFloorRelation AS x ON g.ParentID = x.RecordID 
	WHERE ContractID = c.RecordID and N.IsValid='1' FOR XML AUTO), '<N HouseNo="', ','), '"/>', ''), 1, 1, '')
)r
```




















### 列转行函数

```sql
ALTER FUNCTION [dbo].[SDF_SplitString]
(
    @sString nvarchar(max),
    @cDelimiter nchar(1)
)
RETURNS @tParts TABLE ( part nvarchar(2048) )
AS
BEGIN
    if @sString is null return
    declare @iStart int,
            @iPos int
    if substring( @sString, 1, 1 ) = @cDelimiter 
    begin
        set @iStart = 2
        insert into @tParts
        values( null )
    end
    else 
        set @iStart = 1
    while 1=1
    begin
        set @iPos = charindex( @cDelimiter, @sString, @iStart )
        if @iPos = 0
            set @iPos = len( @sString )+1
        if @iPos - @iStart > 0          
            insert into @tParts
            values  ( substring( @sString, @iStart, @iPos-@iStart ))
        else
            insert into @tParts
            values( null )
        set @iStart = @iPos+1
        if @iStart > len( @sString ) 
            break
    end
    RETURN
END
```

### 临时表

```sql
WITH temp AS
(
	select * from table
)
select * from temp 
```
























