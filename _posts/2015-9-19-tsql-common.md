---
layout : post
title : "常用的tsql"
category : sqlserver
duoshuo: true
date : 2015-9-19

---

这次做项目，感觉很多sql用起来挺舒服的，今天特意记录下来，以备以后会继续使用

#### 多条记录合成一条记录

	select * from
	( 
		select FloorName,Sort,ID from p_Floor  
	)A
	OUTER APPLY
	(
		SELECT [RoomInfo]= STUFF(REPLACE(REPLACE 
		(
			(
				select RoomName from p_Room N where FloorID = A.id FOR XML AUTO 
			), '<N RoomName="', '_'), '"/>', ''), 1, 1, ''
		)  
	)B  where RoomInfo is not null

#### 获得权限查询

	select top 1 *,(select top 1 deptId from deptment ) 
	from 
	(
		select 1 from Role where RoleID = 'XXX' and UserID = 'XXX'
		union all
		select 2 from Role where RoleID = 'ZZZ' and UserID = 'ZZZ'
	)

#### 更新某个状态，如果是0 更新为1 ，如果是1更新为0

    update someTable set status = abs(isnull(status,0)-1) where ID = 'XXX'

#### 集合函数防止重复的另外一种方法

	select sum(case when area in ('北京','上海','深圳') then '大城市' else area end) area from table group by (case when area in ('北京','上海','深圳') then '大城市' else area end)



	
	