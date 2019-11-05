// ==UserScript==
// @name         Grafana alerts scroll
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Scrolls Grafana alerts
// @author       w.shellabarger
// @match        https://grafana.crto.in/*
// @grant        none
// ==/UserScript==

(function(){
    //only run at top level page
    if(window.location == window.parent.location){
        getAndScrollAlertingPanels();
        refreshPanels();
    }
})();

var PANELS_PER_SCROLL = 6;
var WAIT_DURATION_MS = 30000;
var REFRESH_TIME_MS = 30000;

function getAndScrollAlertingPanels (){
    var alertingPanels = [];
    var allPanels = [];
    var panelsIframe = frames['guest-app'];
    if(panelsIframe){
        alertingPanels = panelsIframe.contentDocument.getElementsByClassName('panel-alert-state--alerting');
        allPanels = panelsIframe.contentDocument.getElementsByClassName('panel-container');
    }
    console.log("found " + alertingPanels.length + " alerting panels");
    if(alertingPanels.length){
        scrollPanelsIntoView(alertingPanels, 0);
    }
    else if(allPanels.length){
        scrollPanelsIntoView(allPanels, 0, PANELS_PER_SCROLL);
    }
    else{
        setTimeout(function(){
            getAndScrollAlertingPanels();
        }, WAIT_DURATION_MS);
    }
}

function scrollPanelsIntoView (alertingPanels, index, indexIncrement = 1){
    if(index > alertingPanels.length - 1){
        getAndScrollAlertingPanels();
        return;
    }
    alertingPanels[index].scrollIntoView({
        behavior: "smooth"
    });
    setTimeout(function(){
        // only scroll when tab is in view
        if(!document.hidden){
            index += indexIncrement;
        }
        else{
            console.log("tab is not in view, skipping scroll");
        }
        scrollPanelsIntoView(alertingPanels, index, indexIncrement);
    }, WAIT_DURATION_MS)
}

// because the grafana auto refresh sucks
function refreshPanels(){
    setTimeout(function(){
        console.log("refreshing graphs...");
        var panelsIframe = frames['guest-app'];
        if(panelsIframe){
            var timePicker = panelsIframe.contentDocument.getElementsByClassName('time-picker-button-select')[0];
            if(timePicker){
                timePicker.click();
            }
            setTimeout(function(){
                var applyButton = panelsIframe.contentDocument.getElementsByClassName("gf-form-select-box__option--is-selected")[0];
                if(applyButton){
                    applyButton.click();
                }
            }, 1000)
        }
        refreshPanels();
    }, REFRESH_TIME_MS);
}

