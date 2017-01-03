var videoLinks;

function VideoPlayer(embedCode) {
    var videoWrapper = document.createElement('div');
    videoWrapper.style.zIndex = 1000;
    videoWrapper.style.position = 'absolute';
    videoWrapper.style.width = 100 + '%';
    videoWrapper.style.height = 100 + '%';
    videoWrapper.style.top = 0 + 'px';
    videoWrapper.style.left = 0 + 'px';
    videoWrapper.style.opacity = 0;

    var background = document.createElement('div');
    background.style.position = 'fixed';
    background.style.background = '#ffffff';
    background.style.opacity = 0.5;
    background.style.width = 100 + '%';
    background.style.height = 100 + '%';
    videoWrapper.appendChild(background);

    var videoContent = document.createElement('div');
    videoContent.style.position = 'fixed';
    videoContent.style.left = 50 + '%';
    videoContent.style.top = 50 + '%';
    videoContent.style.background = 'black';
    videoContent.style.WebkitTransform = "translateX(-50%) translateY(-50%)";

    var closeButton = document.createElement('div');
    closeButton.style.position = 'absolute';
    closeButton.style.right = -40 + 'px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = 40 + 'px';
    closeButton.style.lineHeight = 20 + 'px';
    closeButton.innerHTML = '&times;';

    var embed = document.createElement('div');
    embed.innerHTML = embedCode;
    // embed.children[0].style.width = 700 + 'px';
    // embed.children[0].style.height = 400 + 'px';

    function closeVideo() {

        closeButton.removeEventListener('click', closeVideo);

        TweenMax.to(videoWrapper, 0.5, {
            opacity: 0,
            onComplete: function() {
                embed.innerHTML = '';
                document.body.removeChild(videoWrapper);
            }
        });

    }
    closeButton.addEventListener('click', closeVideo);
    videoContent.appendChild(closeButton);
    videoContent.appendChild(embed);
    videoWrapper.appendChild(videoContent);
    document.body.appendChild(videoWrapper);
    TweenMax.to(videoWrapper, 0.5, {
        opacity: 1
    });
}

function openOverlay(event) {
    event.preventDefault();
    var t = event.currentTarget;

    if (t.getAttribute('data-youtube')) {
        var source = 'youtube';
        var id = t.getAttribute('data-youtube');
        var embedCode = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+ id +'?autoplay=1&amp;rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>';
    }else if (t.getAttribute('data-vimeo')) {
        var source = 'vimeo';
        var id = t.getAttribute('data-vimeo');
        var embedCode = '<iframe src="http://player.vimeo.com/video/'+ id + '?color=ffffff&title=0&byline=0&portrait=0&autoplay=1" width="800" height="450" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    }

    var video = new VideoPlayer(embedCode);
}

function videoInit(){
    videoLinks = document.querySelectorAll('a.video');
    for (var i = 0; i < videoLinks.length; i++) {
        videoLinks[i].addEventListener('click', openOverlay);
    }
}
window.addEventListener('load', videoInit);
