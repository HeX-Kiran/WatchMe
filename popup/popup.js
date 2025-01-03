document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('end') ;
    if(startBtn) {
        startBtn.addEventListener('click',function(){
            // Show the stop tracking button
            stopBtn.style.display = "block";
            startBtn.style.display = "none";
            chrome.storage.local.set({isTracking:true})
        })
    }

    if(stopBtn) {
        stopBtn.addEventListener('click',function(){
            // show start tracking button
            startBtn.style.display = "block";
            stopBtn.style.display = "none";
            chrome.storage.local.set({isTracking:false})
            chrome.storage.local.get(['data'],(result) => {
                console.log(result);
            });
        })
    }
});
