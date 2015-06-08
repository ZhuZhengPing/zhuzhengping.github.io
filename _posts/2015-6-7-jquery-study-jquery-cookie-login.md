---
layout : post
title : "ajax login"
category : jquery
duoshuo: true
date : 2015-6-7

---

####php login

	<?php
		require 'config.php';
		
		$query = mysql_query("select user from user where user = '{$_POST['user']}' ");
		
		if(mysql_fetch_array($query,MYSQL_ASSOC)){
			echo 'false';
		}else{
			echo 'true';
		}
		mysql_close();
	?>
	
	
	



