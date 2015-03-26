var time_end;
var time_day;
var time_hour;
var time_minute;
var time_second;


window.onload = function () {
    time_day = document.getElementById("times_day");
    time_hour = document.getElementById("times_hour");
    time_minute = document.getElementById("times_minute");
    time_second = document.getElementById("second");
    time_end = new Date("2015/3/31 08:33:00");  // 设定活动结束结束时间
    time_end = time_end.getTime();
    setTimeout("count_down()", 1000);//设置每一秒调用一次倒计时函数
}

function count_down() {
    var time_now = new Date();  // 获取当前时间
    time_now = time_now.getTime();
    var time_distance = time_end - time_now;  // 时间差：活动结束时间减去当前时间   
    var int_day, int_hour, int_minute, int_second;
    if (time_distance >= 0) {
        int_day = Math.floor(time_distance / 86400000)
        time_distance -= int_day * 86400000;
        int_hour = Math.floor(time_distance / 3600000)
        time_distance -= int_hour * 3600000;
        int_minute = Math.floor(time_distance / 60000)
        time_distance -= int_minute * 60000;
        int_second = Math.floor(time_distance / 1000)
        if (int_hour < 10)
            int_hour = "0" + int_hour;
        if (int_minute < 10)
            int_minute = "0" + int_minute;
        if (int_second < 10)
            int_second = "0" + int_second;
        time_day.innerHTML = int_day;
        time_hour.innerHTML = int_hour;
        time_minute.innerHTML = int_minute;
        time_second.innerHTML = int_second;
        setTimeout("count_down()", 1000);
    } else {
        time_end = time_end + 3 * 24 * 60 * 60 * 1000;
        setTimeout("count_down()", 1000);
    }
}