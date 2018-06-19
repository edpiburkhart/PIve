function run() {
    const $addFile = document.getElementById('addFile');
    const $addFileWindow = document.getElementById('addFileWindow');
    const $addFileContainer = document.getElementById('addFileContainer');
    
    $addFile.onclick = function() {
        $addFileWindow.style.display = 'block';
        $addFileWindow.style.opacity = 1;
    };
    $addFileContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    $addFileWindow.onclick = function() {
        $addFileWindow.style.opacity = 0;
        setTimeout(function() {$addFileWindow.style.display = 'none';}, 250);
    };
};

if (document.readyState != 'loading') run();
else if (document.addEventListener) document.addEventListener('DOMContentLoaded', run);
else document.attachEvent('onreadystatechange', function() {
    if (documeny.readyState=='complete') run();
});