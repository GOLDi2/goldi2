/**
 * Created by Paul on 18.05.2017.
 */

///<reference path="./d_ts/jquery.d.ts" />

function closeTab(obj) {
    $(obj).parent().remove();
    $(".nav-tabs li").children('a').last().click();
}

//TODO: function addTab()