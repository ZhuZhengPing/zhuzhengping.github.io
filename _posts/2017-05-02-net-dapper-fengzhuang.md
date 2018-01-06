---
layout: post
title:  "dapper 封装"
date:   2017-05-02 16:32:18 +0800
categories: .net
tags: .net
author: Zhengping Zhu
---

* content
{:toc}

##概念

dapper 封装类















```c#
public class BaseRepository
{
	public string connectionString { get; set; }

	public BaseRepository() 
	{
		connectionString = "XXX";
	}

	public BaseRepository(string conn)
	{
		connectionString = conn;
	}


	public SqlConnection OpenConnection()
	{
		string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectionString].ConnectionString;
		var connection = new SqlConnection(connStr);
		connection.Open();
		return connection;
	}

	/// <summary>
	/// 单表插入
	/// </summary>
	/// <typeparam name="T">实体类型</typeparam>
	/// <param name="t">实体数据</param>
	/// <param name="conn">数据库链接</param>
	/// <param name="tran">事务</param>
	/// <returns>受影响行数</returns>
	public int Insert<T>(T t, SqlConnection conn = null, SqlTransaction tran = null) where T : class
	{
		Type type = typeof(T);
		// 判断是否为集合类型
		if (type.IsGenericType)
		{
			var nowType = t as IEnumerable;
			IEnumerator enumerator = nowType.GetEnumerator();
			enumerator.MoveNext();
			type = enumerator.Current.GetType();
		}
		string insertSql = string.Join(",", type.GetProperties().OrderBy(p => p.GetHashCode()).Select(p => p.Name));
		string valueSql = string.Join(",", type.GetProperties().OrderBy(p => p.GetHashCode()).Select(p => "@" + p.Name));
		string sql = string.Format("insert into {0}({1})values({2})", type.Name, insertSql, valueSql);
		if (conn == null)
		{
			conn = OpenConnection();
		}
		using (conn)
		{
			return conn.Execute(sql, t, tran);
		}
	}

	/// <summary>
	/// 单表插入（在事务中执行）
	/// </summary>
	/// <typeparam name="T">实体类型</typeparam>
	/// <param name="t">实体数据</param>
	/// <param name="conn">数据库链接</param>
	/// <param name="tran">事务</param>
	/// <returns>受影响行数</returns>
	public int InsertInTransaction<T>(T t, SqlConnection conn, SqlTransaction tran) where T : class
	{
		if (conn == null || tran == null)
		{
			throw new ArgumentNullException();
		}

		Type type = typeof(T);
		// 判断是否为集合类型
		if (type.IsGenericType)
		{
			var nowType = t as IEnumerable;
			IEnumerator enumerator = nowType.GetEnumerator();
			enumerator.MoveNext();
			type = enumerator.Current.GetType();
		}
		string insertSql = string.Join(",", type.GetProperties().OrderBy(p => p.GetHashCode()).Where(p=>!p.Name.Contains("_")).Select(p => p.Name));
		string valueSql = string.Join(",", type.GetProperties().OrderBy(p => p.GetHashCode()).Where(p => !p.Name.Contains("_")).Select(p => "@" + p.Name));
		string sql = string.Format("insert into {0}({1}) values({2})", type.Name, insertSql, valueSql);

		return conn.Execute(sql, t, tran);
	}

	/// <summary>
	/// 单表插入，返回自增ID，注意如果是批量插入的返回的是最后一条的自增ID
	/// </summary>
	/// <typeparam name="T">实体类型</typeparam>
	/// <param name="t">实体数据</param>
	/// <param name="conn">数据库链接</param>
	/// <param name="tran">事务</param>
	/// <returns>返回自增ID，注意如果是批量插入的返回的是最后一条的自增ID</returns>
	public int? InsertReturnIdentity<T>(T t, SqlConnection conn, SqlTransaction tran) where T : class
	{
		if (conn == null || tran == null)
		{
			throw new ArgumentNullException();
		}

		Type type = typeof(T);
		// 判断是否为集合类型
		if (type.IsGenericType)
		{
			var nowType = t as IEnumerable;
			IEnumerator enumerator = nowType.GetEnumerator();
			enumerator.MoveNext();
			type = enumerator.Current.GetType();
		}
		string insertSql = string.Join(",", type.GetProperties().OrderBy(p => p.GetHashCode()).Select(p => p.Name));
		string valueSql = string.Join(",", type.GetProperties().OrderBy(p => p.GetHashCode()).Select(p => "@" + p.Name));
		string sql = string.Format("insert into {0}({1})values({2}); SELECT SCOPE_IDENTITY();", type.Name, insertSql, valueSql);
		object result = conn.ExecuteScalar<object>(sql, t, tran);
		if (result != System.DBNull.Value)
			return Convert.ToInt32(result);
		else
			return null;
	}

	/// <summary>
	/// 单表插入，返回自增ID，注意如果是批量插入的返回的是最后一条的自增ID
	/// </summary>
	/// <typeparam name="T"></typeparam>
	/// <param name="t"></param>
	/// <returns>返回自增ID，注意如果是批量插入的返回的是最后一条的自增ID</returns>
	public int? InsertReturnIdentity<T>(T t) where T : class
	{
		int? identity;
		using (var conn = DapperFactory.OpenConnection())
		{
			var tran = conn.BeginTransaction();
			try
			{
				identity = InsertReturnIdentity(t, conn, tran);
				tran.Commit();
			}
			catch (Exception)
			{
				identity = null;
			}
			finally
			{
				tran.Dispose();
			}
		}
		return identity;
	}

	/// <summary>
	/// 更新实体
	/// </summary>
	/// <typeparam name="T">需要更新的实体名称</typeparam>
	/// <param name="t">实体数据</param>
	/// <param name="conn">数据库链接</param>
	/// <param name="fields">需要更新的字段</param>
	/// <param name="tran">事物</param>
	/// <returns>受影响行数</returns>
	public int Update<T>(T t, string[] fields = null, SqlConnection conn = null, SqlTransaction tran = null) where T : class,new()
	{
		Type type = typeof(T);
		if (type.IsGenericType)
		{
			var nowType = t as IEnumerable;
			IEnumerator enumerator = nowType.GetEnumerator();
			enumerator.MoveNext();
			type = enumerator.Current.GetType();
		}
		if (fields == null)
		{
			fields = type.GetProperties().Select(p => p.Name).ToArray();
		}
		string updateSql = string.Join(",", fields.Select(p => p + "=@" + p));
		string sql = string.Format("update {0} set {1} where ID=@ID", type.Name, updateSql, tran);
		if (conn == null)
		{
			conn = OpenConnection();
		}
		using (conn)
		{
			return conn.Execute(sql, t, tran);
		}
	}

	/// <summary>
	/// 更新实体
	/// </summary>
	/// <typeparam name="T">需要更新的实体名称</typeparam>
	/// <param name="t">实体数据</param>
	/// <param name="conn">数据库链接</param>
	/// <param name="fields">需要更新的字段</param>
	/// <param name="tran">事物</param>
	/// <returns>受影响行数</returns>
	public int UpdateInTransaction<T>(T t, SqlConnection conn, SqlTransaction tran, string[] fields = null) where T : class,new()
	{
		if (conn == null || tran == null)
		{
			throw new ArgumentNullException();
		}

		Type type = typeof(T);
		if (type.IsGenericType)
		{
			var nowType = t as IEnumerable;
			IEnumerator enumerator = nowType.GetEnumerator();
			enumerator.MoveNext();
			type = enumerator.Current.GetType();
		}
		if (fields == null)
		{
			fields = type.GetProperties().Where(p => !p.Name.Contains("_")).Select(p => p.Name).ToArray();
		}
		string updateSql = string.Join(",", fields.Select(p => p + "=@" + p));
		string sql = string.Format("update {0} set {1} where ID=@ID", type.Name, updateSql, tran);
		return conn.Execute(sql, t, tran);
	}

	/// <summary>
	/// 更新实体
	/// </summary>
	/// <typeparam name="T">需要更新的实体名称</typeparam>
	/// <param name="t">实体数据</param>
	/// <param name="conn">数据库链接</param>
	/// <param name="fields">需要更新的字段</param>
	/// <param name="tran">事物</param>
	/// <returns>受影响行数</returns>
	public int Update<T>(string sql, T t, string[] fields = null, SqlConnection conn = null, SqlTransaction tran = null) where T : class,new()
	{
		Type type = typeof(T);

		if (fields == null)
		{
			fields = type.GetProperties().Select(p => p.Name).ToArray();
		}
		string updateSql = string.Join(",", fields.Select(p => p + "=@" + p));
		//string sql = string.Format("update {0} set {1} where ID=@ID", table, updateSql, tran);
		sql = string.Format(sql, updateSql, tran);
		if (conn == null)
		{
			conn = OpenConnection();
		}
		using (conn)
		{
			return conn.Execute(sql, t, tran);
		}
	}

	public int Update(string sql, string[] fields = null, SqlConnection conn = null, SqlTransaction tran = null)
	{
		if (conn == null)
		{
			conn = OpenConnection();
		}
		using (conn)
		{
			return conn.Execute(sql, tran);
		}
	}

	public int Execute<T>(string sql, T t, CommandType commandType, SqlConnection conn, SqlTransaction tran) where T : class
	{
		if (conn == null)
		{
			conn = OpenConnection();
		}
		using (conn)
		{
			return conn.Execute(sql,t,tran,null,commandType);
		}
	}

	public int Execute<T>(string sql, T t, CommandType commandType) where T : class
	{
		return Execute<T>(sql, t, commandType, null, null);
	}

	public int Execute<T>(string sql, T t) where T : class
	{
		return Execute<T>(sql, t, CommandType.Text, null, null);
	}

	public int Execute(string sql)
	{
		return Execute<string>(sql, null, CommandType.Text, null, null);
	}

	public T Query<T>(string sql)
	{
		return QueryArray<T, DBNull>(sql, null, null, null, null).FirstOrDefault();
	}

	public T Query<T>(string sql, SqlConnection conn, SqlTransaction tran)
	{
		return QueryArray<T, DBNull>(sql, null, null, conn, tran).FirstOrDefault();
	}

	public T Query<T, S>(string sql, S s, CommandType commandType) where S : class
	{
		return QueryArray<T, S>(sql, s, commandType, null, null).FirstOrDefault();
	}
	public T Query<T, S>(string sql, S s,SqlConnection conn, CommandType commandType) where S : class
	{
		return QueryArray<T, S>(sql, s, commandType,conn, null).FirstOrDefault();
	}

	public IEnumerable<T> QueryArray<T>(string sql)
	{
		return QueryArray<T, DBNull>(sql, null, null, null, null);
	}

	public IEnumerable<T> QueryArray<T>(string sql, SqlConnection conn, SqlTransaction tran) 
	{
		return QueryArray<T, DBNull>(sql, null, null, conn, tran);
	}

	public IEnumerable<T> QueryArray<T, S>(string sql, S s, CommandType? commandType, SqlConnection conn, SqlTransaction tran) where S : class
	{
		if (conn == null)
		{
			conn = OpenConnection();
		}
		using (conn)
		{
			return conn.Query<T>(sql, s, tran, true, null, commandType);
		}
	}

	/// <summary>
	/// 查询列表
	/// </summary>
	/// <param name="sql">sql语句</param>
	/// <param name="param">参数</param>
	/// <param name="conn">数据库链接</param>
	/// <param name="tran">事务</param>
	/// <returns>查询返回集合</returns>
	public string QueryList<T>(string sql, T t, SqlConnection conn, SqlTransaction tran, CommandType? commandType, int? commandTimeOut) where T : class
	{
		if (conn == null)
		{
			conn = OpenConnection();
		}
		using (conn)
		{
			return JsonConvert.SerializeObject(conn.Query(sql, t, tran, true, commandTimeOut, commandType));
		}
	}

	public string QueryList<T>(string sql, T t, CommandType? commandType, int? commandTimeOut) where T : class
	{
		return QueryList(sql, t, null, null, commandType, commandTimeOut);
	}

	public string QueryList<T>(string sql, T t, CommandType? commandType) where T : class
	{
		return QueryList(sql, t, null, null, commandType, null);
	}

	public string QueryList<T>(string sql, T t) where T : class
	{
		return QueryList(sql, t, null, null, null, null);
	}

	public string QueryList(string sql)
	{
		return QueryList<DBNull>(sql, null, null, null, null, null);
	}

	/// <summary>
	/// 查询分页
	/// </summary>
	/// <param name="sql">查询语句</param>
	/// <param name="param">查询语句参数</param>
	/// <param name="pageIndex">页码</param>
	/// <param name="pageSize">每页显示条数</param>
	/// <param name="conn">数据库链接</param>
	/// <param name="tran">事务</param>
	/// <returns>miniui 数据格式</returns>
	public string QueryPageList(string sql, int pageIndex, int pageSize, SqlConnection conn, CommandType commandType)
	{
		return QueryPageList<string>(sql, null, pageIndex, pageSize, conn,commandType);
	}

	public string QueryPageList(string sql, int pageIndex, int pageSize, SqlConnection conn)
	{
		return QueryPageList<string>(sql, null, pageIndex, pageSize, conn, null);
	}
	public string QueryPageList<T>(string sql, T t, int pageIndex, int pageSize)
	{
		return QueryPageList<string>(sql, null, pageIndex, pageSize,null, null);
	}
	public string QueryPageList<T>(string sql, T t, int pageIndex, int pageSize, CommandType commandType)
	{
		return QueryPageList<string>(sql, null, pageIndex, pageSize, null, commandType);
	}
	public string QueryPageList<T>(string sql, T t, CommandType commandType)
	{
		return QueryPageList<T>(sql, t,0,0,null,commandType);
	}
	public string QueryPageList(string sql, int pageIndex, int pageSize)
	{
		return QueryPageList<string>(sql, null, pageIndex, pageSize, null, null);
	}
	//public string QueryPageList(string sql)
	//{
	//    return QueryPageList<string>(sql, null, 0, 25, null, null);
	//}
	/// <summary>
	/// 查询分页
	/// </summary>
	/// <param name="sql">查询语句</param>
	/// <param name="param">查询语句参数</param>
	/// <param name="pageIndex">页码</param>
	/// <param name="pageSize">每页显示条数</param>
	/// <param name="conn">数据库链接</param>
	/// <param name="tran">事务</param>
	/// <returns>miniui 数据格式</returns>
	public string QueryPageList<T>(string sql, T t, int pageIndex, int pageSize, SqlConnection conn, CommandType? commandType)
	{
		// 如果没有查询总数，需要添加查询总数的 sql 语句
		// 这里需要匹配 Count(*),但是需要去空格
		// 存储过程不需要
		if (commandType == CommandType.Text || commandType==null)
		{

			// 判定sql语句里面是否执行了分页
			if (sql.ToLower().IndexOf("offset") == -1)
			{
				// 如果没有排序，默认根据添加日期倒叙排列排序
				if (sql.ToLower().IndexOf("order") == -1)
				{
					sql = sql + " order by createtime desc ";
				}
				sql = sql + string.Format(" offset {0} row fetch next {1} rows only ", pageIndex * pageSize, pageSize);
			}

			Regex reg = new Regex(@"count\s*\(\s*\*\s*\)", RegexOptions.IgnoreCase);
			var match = reg.Match(sql);
			if (match.Success == false)
			{
				// 截取出表名以及条件
				// 表名和条件是在 from 和 order by 之间的数值
				match = Regex.Match(sql, @"from([\s\S]*?)order[\s\S]*by", RegexOptions.IgnoreCase);
				string matchValue = match.Groups[0].Value;
				// 替换到匹配的order by
				reg = new Regex(@"order[\s\S]*by", RegexOptions.IgnoreCase);
				matchValue = reg.Replace(matchValue, "");
				sql = " select count(*) " + matchValue + sql;
			}
		}

		if (conn == null)
		{
			conn = OpenConnection();
		}
		using (var multi = conn.QueryMultiple(sql,t,null,null,commandType)) 
		{
			// 返回总条数
			int total = multi.Read<int>().FirstOrDefault();
			// 返回的集合
			var list = multi.Read<dynamic>();

			return JsonConvert.SerializeObject(new
			{
				data = list,
				total = total
			});
		}
	}
}
```


















