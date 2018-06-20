function run() {
    const $addFile = document.getElementById('addFile');
    const $addFileWindow = document.getElementById('addFileWindow');
    const $addFileContainer = document.getElementById('addFileContainer');
    
    if ($addFile) {
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
    }
    
    
    const $editBtn = document.getElementById('edit');
    if ($editBtn) {
        const $explorer = document.getElementById('explorer');
        var _edit = false;

        $editBtn.onclick = function() {
            if (_edit) {
                $editBtn.classList.remove('active', 'down');
                $editBtn.innerHTML = 'Modifier';
                $explorer.classList.remove('edit');
                var $folders = document.getElementsByClassName('folder');
                var $files = document.getElementsByClassName('file');
                var $removers = document.getElementsByClassName('icon');

                function addLink(e) {
                    e.setAttribute('href', e.getAttribute('link'));
                    e.removeAttribute('link');
                }
                for (var i = 0; i < $folders.length; i++) {
                    addLink($folders[i]);
                }
                for (var i = 0; i < $files.length; i++) {
                    addLink($files[i]);
                }

                for (var i = 0; i < $removers.length; i++) {
                    $removers[i].onclick = function () {};
                }
            } else {
                $editBtn.classList.add('active', 'down');
                $editBtn.innerHTML = 'Valider';
                $editBtn.onclick = function() {location.reload();};
                $explorer.classList.add('edit');
                var $folders = document.getElementsByClassName('folder');
                var $files = document.getElementsByClassName('file');
                var $removers = document.getElementsByClassName('icon');

                function rmLink(e) {
                    e.setAttribute('link', e.getAttribute('href'));
                    e.removeAttribute('href');
                }
                for (var i = 0; i < $folders.length; i++) {
                    rmLink($folders[i]);
                }
                for (var i = 0; i < $files.length; i++) {
                    rmLink($files[i]);
                }

                for (var i = 0; i < $removers.length; i++) {
                    $removers[i].addEventListener('click', function (e) {
                        e.stopPropagation();
                        var xhttp = new XMLHttpRequest();
                        xhttp.open('POST', '', true);
                        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                        xhttp.send('action=rm&rm='+this.nextSibling.innerHTML);
                        this.parentElement.remove();
                    });
                    var $name = $removers[i].nextSibling
                    $name.setAttribute('contenteditable', 'true');
                    $name.onfocus = function() {
                        this.setAttribute('oldname', this.innerHTML);
                    }
                    $name.onblur = function() {
                        console.log(this.getAttribute('oldname'));
                        console.log()
                        if (this.getAttribute('oldname') == this.innerHTML) return;
                        var xhttp = new XMLHttpRequest();
                        xhttp.open('POST', '', true);
                        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                        xhttp.send('action=mv&oldname=' + this.getAttribute('oldname') + '&newname=' + this.innerHTML);
                    }
                    $name.addEventListener('keypress', function(e) {
                        if (e.keyCode == 13) {
                            this.blur();
                        }
                    });
                    $name.parentElement.addEventListener('click', function(e) {
                        e.preventDefault();
                        this.lastChild.focus();
                    })
                }
            }
            _edit = !_edit;
        };
    }

    const $empty = document.getElementById('empty');
    if ($empty) {
        $empty.onclick = function() {
            var xhttp = new XMLHttpRequest();
            xhttp.open('POST', '', true);
            xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    location.reload();
               }
            };
            xhttp.send('action=empty');
        };
    }
    
    const $newFolder = document.getElementById('newFolder');
    const $folders = document.getElementById('folders');
    if ($newFolder) {
        $newFolder.onclick = function() {
            var $nf = document.createElement('a');
            $nf.classList.add('folder');

            var $icon = document.createElement('i');
            $icon.classList.add('fa', 'fa-times');
            $icon.addEventListener('click', function(e) {
                e.stopPropagation();
                this.parentElement.remove();
            });
            $nf.appendChild($icon);

            var $name = document.createElement('span');
            $name.setAttribute('contenteditable', true);
            $name.addEventListener('keypress', function(e) {
                if (e.keyCode != 13) return;
                this.blur();
                if (this.innerHTML == '') return;
                var xhttp = new XMLHttpRequest();
                xhttp.open('POST', '', true);
                xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        location.reload();
                   }
                };
                xhttp.send('action=newfolder&name=' + this.innerHTML);
            });
            $nf.addEventListener('click', function(e) {
                e.preventDefault();
                $name.focus();
            });
            $nf.appendChild($name);

            $folders.appendChild($nf);
            $name.focus();
        }
    }
};

if (document.readyState != 'loading') run();
else if (document.addEventListener) document.addEventListener('DOMContentLoaded', run);
else document.attachEvent('onreadystatechange', function() {
    if (documeny.readyState=='complete') run();
});