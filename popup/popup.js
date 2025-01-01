const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('end') ;

if(startBtn) {
    startBtn.addEventListener('click',function(){
        // Show the stop tracking button
       stopBtn.style.display = "block";
       startBtn.style.display = "none";
    })
}

if(stopBtn) {
    stopBtn.addEventListener('click',function(){
        // show start tracking button
        startBtn.style.display = "block";
        stopBtn.style.display = "none";
    })
}

