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
        try {
            // check if any data is available in the storage
            chrome.storage.local.get(['data'], (result) => {
                // Initialize 'data' if it doesn't exist
                let data = result.data || {};
            
                // Get the current year, month, and date
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1; // 1-based month
                const date = today.getDate();
            
                // Ensure the year structure exists
                if (!data[year]) {
                    data[year] = {};
                }
            
                // Ensure the month structure exists
                if (!data[year][month]) {
                    data[year][month] = {};
                }
            
                // Ensure the date structure exists
                if (!data[year][month][date]) {
                    data[year][month][date] = {};
                }
            
                // Get the current tab title (simulate `tab.title`)
                const title = tab.title; // Replace with actual `tab.title`
            
                // Ensure tracking data for the title exists
                if (!data[year][month][date][title]) {
                    data[year][month][date][title] = { count: 0 };
                }
            
                // Increment the count for the title
                data[year][month][date][title].count += 1;
            
                // Save the updated data back to storage
                chrome.storage.local.set({ data });
            });
        } catch (error) {
            console.log("Something went wrong")
        }
        
    }
});

