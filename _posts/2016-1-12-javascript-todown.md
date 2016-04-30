---
layout : post
title : "javascript插入元素操作"
category : javascript
duoshuo: true
date : 2016-3-13

---

Javascript使元素向下

	function toDown(obj) {
        var parent = document.getElementById("appData");
        var tag = document.getElementById(obj);
        if (tag.nextElementSibling){
			// 如果有下一个临节点，
            parent.insertBefore(tag.nextElementSibling, tag);
        } else {
            parent.insertBefore(tag,parent.firstChild);
        }
    }

	
	
	
	
	