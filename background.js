const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let trackedTab = new Map();

chrome.storage.local.clear(() => {
    if (chrome.runtime.lastError) {
        console.error("Error clearing storage:", chrome.runtime.lastError.message);
    } else {
        console.log("Local storage cleared successfully!");
    }
});

chrome.storage.local.get(['data'], (result) => {
    console.log("dATA STORED",result);
})

function saveTrackings(trackedTabDetails) {
        try {
            // Check if any data is available in the storage
            chrome.storage.local.get(['data'], (result) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError.message);
                }

                // Initialize 'data' if it doesn't exist
                let data = result.data || {};

                // Get the current year, month, and date
                const today = new Date();
                const year = today.getFullYear();
                const month = MONTHS[today.getMonth()];
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

                const domain = trackedTabDetails.domain;

                // Create a deep copy of the trackedTabDetails
                const trackedTabCopy = JSON.parse(JSON.stringify(trackedTabDetails));

                // Ensure tracking data for the title exists
                if (!data[year][month][date][domain]) {
                    data[year][month][date][domain] = trackedTabCopy;
                } else {
                    // Update the details in the copied data
                    data[year][month][date][domain].count += trackedTabCopy.count;
                    data[year][month][date][domain].time += trackedTabCopy.time;
                }

                // Save the updated data back to storage
                chrome.storage.local.set({ data });

                // Reset the original tab count and time after saving
                trackedTabDetails.count = 0;
                trackedTabDetails.time = 0;
            });
        } catch (error) {
            console.error(error)
        }
}

async function saveAllTrackedTabs() {
    // Create an array of promises to save tracked tabs concurrently
    const savePromises = Array.from(trackedTab.values()).forEach( (tab) => {
        // saveTrackings(tab);
        console.log("tab done", tab);
    });
    trackedTab.clear(); // Clear only if saving succeeds
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        const domain = extractDomainFromUrl(tab.url);
        if (domain &&!trackedTab.has(domain)) {
            trackedTab.set(domain, {
                id: tab.id,
                title: tab.title,
                count: 1,
                time: 0,
                domain: domain,
                icon: tab.favIconUrl,
                url: tab.url
            });
        } else {
            if(domain) {
                const tracked = trackedTab.get(domain);
                tracked.count += 1;
            }
            
        }
        console.log(trackedTab);
        chrome.storage.local.get(['data'], (result) => {
            console.log("dATA STORED",result);
        })
    }
    
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
        chrome.tabs.get(tabId, (tab) => {
            if (!tab) return;
            const { title,id,url } = tab;
            const domain = extractDomainFromUrl(url);
            if(domain && !trackedTab.has(domain)) {
                trackedTab.set(domain, {
                    id,
                    title,
                    domain,
                    count: 1,
                    time: 0,
                    icon: tab.favIconUrl,
                    url
                });
            }
            else {
                if(domain) {
                    const tracked = trackedTab.get(domain);
                    tracked.count += 1;
                }
                
            }
        });
        console.log(trackedTab);
});

function extractDomainFromUrl(url) {
    const regex = /^https:\/\/([^/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Save tracked tabs periodically
// setInterval(() => {
//     try {
//         console.log("Saving tracked tabs...");
//         saveAllTrackedTabs();
//         chrome.storage.local.get(['data'], (result) => {
//             console.log("dATA STORED",result);
//         })
//     } catch (error) {
//         console.error("Error saving tracked tabs:", error);
//     }
// }, 10000);
