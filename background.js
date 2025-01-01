chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.query({ active:true, currentWindow:true },(tabs) => {
        if(tabs.length > 0){
            const currentTab = tabs[0];
            console.log("Current tab is ",currentTab)
        }
    })
});


chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab) => {
    if(changeInfo.status === "complete" && tab.active) {
        console.log("Active tab details",tab);
    }
});

