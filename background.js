
// chrome.storage.local.clear(() => {
//     if (chrome.runtime.lastError) {
//         console.error("Error clearing storage:", chrome.runtime.lastError.message);
//     } else {
//         console.log("Local storage cleared successfully!");
//     }
// });

// chrome.storage.local.get(['data'], (result) => {
//     console.log("dATA STORED",result);
// })


const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let currentTrackingDomain = null;
let startTime = null;

function saveTrackings(trackedTabDetails) {
        try {
            // Check if any data is available in the storage
            chrome.storage.local.get(['data'], (result) => {
                console.log("stored DATA",result);
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
                    console.log("First time domain",domain)
                    data[year][month][date][domain] = trackedTabCopy;
                } else {
                    // Update the details in the copied data
                    console.log("track time",trackedTabCopy.time);
                    console.log("domain",trackedTabCopy.domain);
                    data[year][month][date][domain].count += 1;
                    data[year][month][date][domain].time += trackedTabCopy.time;
                }

                // Save the updated data back to storage
                chrome.storage.local.set({ data });
            });
        } catch (error) {
            console.error(error)
        }
}

// Handle tracking logic when switching tabs or updating tabs
 function handleTabChange(newTab) {
    // Transition to a new tab or domain
    if (newTab) {
        const { url, title, id, favIconUrl } = newTab;
        const domain = extractDomainFromUrl(url);
        if (currentTrackingDomain === domain) return;
        if (currentTrackingDomain && startTime) {
            // Calculate time spent on the current domain
            const totalTimeSpent = new Date() - startTime;
            saveTrackings({ domain: currentTrackingDomain, time: totalTimeSpent });
        }
    
        if (domain) {
            // Reset tracking for the new domain
            currentTrackingDomain = domain;
            startTime = new Date(); // Start tracking time for the new domain
            setTimeout(()=>{
                saveTrackings({
                    id,
                    title,
                    domain,
                    count: 1,
                    time: 0, // New domain starts with zero tracked time
                    icon: favIconUrl,
                    url,
                });
            },1000)
            
        }
    } else {
        // Reset tracking if no newTab is provided
        currentTrackingDomain = null;
        startTime = null;
    }
}




// Extract the domain from a URL
function extractDomainFromUrl(url) {
    const regex = /^https:\/\/([^/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        handleTabChange(tab);
    }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId, (tab) => {
        if (tab) {
            handleTabChange(tab);
        }
    });
});

// This event is triggered when browser is minimized
chrome.windows.onFocusChanged.addListener((windowId) => {
    console.log("Browser closed")
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // save the current tracking domain and time
        if (currentTrackingDomain && startTime) {
            // Calculate time spent on the current domain
            const totalTimeSpent = new Date() - startTime;
            saveTrackings({ domain: currentTrackingDomain, time: totalTimeSpent });
        }

        currentTrackingDomain = null;
        startTime = null;
    }
    else{
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const activeTab = tabs[0];
                handleTabChange(activeTab);
            }
        });
    }
});

chrome.idle.onStateChanged.addListener((newState) => {
    console.log("Locked");
    if (newState !== 'active') {
        if (currentTrackingDomain && startTime) {
            // Calculate time spent on the current domain
            const totalTimeSpent = new Date() - startTime;
            saveTrackings({ domain: currentTrackingDomain, time: totalTimeSpent });
        }
        currentTrackingDomain = null;
        startTime = null;
    }
    else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const activeTab = tabs[0];
                handleTabChange(activeTab);
            }
        });
    } 
});

