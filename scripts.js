var CLIENT_ID = 0;
var REDIRECT_URL = window.location.href;

var container = document.getElementById('pics');
var fullViewImg = document.getElementById('fullViewImg');
var viewerbg = document.getElementById('vwr');
var head = document.getElementById('head');
var related = document.getElementById('related');
var fromuser = document.getElementById('fromuser');
var fromda = document.getElementById('fromda');
var fromlists = document.getElementById('fromlists');
var images = document.getElementsByClassName('YvY');
var searchOverlay = document.getElementById('search');
var searchbox = document.getElementById('searchbox');
var description = document.getElementById('description');
var imgIndex = 1, imgCount = 1, offset = 0, propcount = 0, scrollingLocked = true, relatedScrollLocked = false, carousel, backOrForward, paused = false, did, searchQuery, searchQueryRaw, feedType = 'recommend';

const getCookie = (cookie) => (document.cookie.match('(^|;)\\s*'+cookie+'\\s*=\\s*([^;]+)')?.pop()||'');

function setCookie(cookie,value,del=false) {
  var date = new Date();
  if(del) date.setTime(0);
  else date.setTime(date.getTime() + (60*60*1000));
  document.cookie = cookie + '=' + value + '; expires=' + date.toUTCString() + '; path=/; samesite=lax; secure';
}

function getHashValue(key) {
  var matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}

if(window.location.hash) {
  var token = getHashValue('access_token');
  setCookie('vsda-access',token);
  history.replaceState(null,'','.');
}
else
  var token = getCookie('vsda-access');

if(token) {
  DA_API('dd').then(z => {prop(z)});
  DA_API('feed').then(z => {prop(z)});
  DA_API('popular').then(z => {prop(z)});
}
else
  window.location.href = 'https://www.deviantart.com/oauth2/authorize?response_type=token&client_id='+CLIENT_ID+'&redirect_uri='+REDIRECT_URL+'&scope=user%20browse%20browse.mlt&state=vs';

function DA_API(request) {
  switch(request) {
    case 'dd': request = 'https://www.deviantart.com/api/v1/oauth2/browse/dailydeviations?with_session=false&mature_content=true&access_token='; break;
    case 'feed': request = 'https://www.deviantart.com/api/v1/oauth2/browse/deviantsyouwatch?with_session=false&mature_content=true&limit=50&access_token='; break;
    case 'popular': request = 'https://www.deviantart.com/api/v1/oauth2/browse/popular?with_session=false&mature_content=true&limit=50&timerange=24hr&access_token='; break;
    case 'recommend': request = 'https://www.deviantart.com/api/v1/oauth2/browse/recommended?with_session=false&mature_content=true&limit=50&offset='+offset+'&access_token='; break;
    case 'related': request = 'https://www.deviantart.com/api/v1/oauth2/browse/morelikethis/preview?seed='+did+'&mature_content=true&access_token='; break;
    case 'get_deviation': request ='https://www.deviantart.com/api/v1/oauth2/deviation/'+did+'?access_token='; break;
    case 'get_tags': request ='https://www.deviantart.com/api/v1/oauth2/deviation/metadata?deviationids%5B%5D='+did+'&ext_submission=false&ext_camera=false&ext_stats=false&ext_collection=false&ext_gallery=false&mature_content=true&access_token='; break;
    case 'search': request = 'https://www.deviantart.com/api/v1/oauth2/browse/recommended?q='+encodeURIComponent(searchQuery)+'&with_session=false&mature_content=true&limit=50&offset='+offset+'&access_token='; break;
    case 'search_tags': request = 'https://www.deviantart.com/api/v1/oauth2/browse/tags?tag='+encodeURIComponent(searchQuery)+'&with_session=false&mature_content=true&limit=50&offset='+offset+'&access_token='; break;
    case 'user_gallery': request = 'https://www.deviantart.com/api/v1/oauth2/gallery/all?username='+encodeURIComponent(searchQuery)+'&with_session=false&mature_content=true&limit=24&offset='+offset+'&access_token='; break;
  }
  return fetch(request + token)
  .then(x => x.json(), () => {alert('DeviantArt authentication token expired after 1hr.\nYou must refresh this page to renew it.'); throw false;});
}

function prop(y) {
  for(let x of y.results) {
    if(x.thumbs.length == 0 || !('content' in x)) continue;
    let box = document.createElement('div');
    box.classList.add('box');
    let img = document.createElement('img');
    img.src = x.thumbs[x.thumbs.length - 1].src;
    img.classList.add('YvY');
    img.id = x.deviationid;
    img.width = x.thumbs[x.thumbs.length - 1].width;
    img.height = x.thumbs[x.thumbs.length - 1].height;
    img.setAttribute('onclick','viewer("flex",' + imgCount + ')');
    img.setAttribute('full', x.content.src);
    img.setAttribute('pubtime', x.published_time);
    imgCount++;
    box.appendChild(img);
    let title = document.createElement('span');
    title.classList.add('title');
    title.innerHTML = `<a href="${x.url}" target=_blank>${x.title}</a><div class=usericon><a href="https://www.deviantart.com/${x.author.username}/gallery/all" onclick="event.preventDefault();searchDA('@${x.author.username}')" target=_blank>${x.author.username}<img src="${x.author.usericon}" /></a></div>`;
    box.appendChild(title);
    container.appendChild(box);
  }
  scrollingLocked = false;
  propcount++;
  if(offset !== null && propcount > 2 && document.body.scrollHeight < window.innerHeight) {
    scrollingLocked = true;
    DA_API(feedType).then(z => {offset = z.next_offset; prop(z)}, () => {scrollingLocked = false});
  }
}

function relatedimgs(y) {
  function partition(z, part) {
    for(let x of z) {
      if(x.thumbs.length == 0 || !('content' in x)) continue;
      let anchor = document.createElement('a');
      anchor.href = x.url;
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('onclick', 'turnPageR(event,\'' + x.deviationid + '\')');
      let img = document.createElement('img');
      img.width = x.thumbs[1].width;
      img.height = x.thumbs[1].height;
      img.src = x.thumbs[1].src;
      img.title = x.title;
      img.setAttribute('full', x.content.src);
      anchor.appendChild(img);
      part.appendChild(anchor);
    }
  }
  partition(y.more_from_artist, fromuser);
  partition(y.more_from_da, fromda);
  for(let a in y.suggested_collections)
    partition(y.suggested_collections[a].deviations, fromlists);
}

viewerbg.addEventListener('click',function(event) {if (event.target.id === 'vwr' || event.target.id === 'sw') {fullscreen(0); viewer('none');}},false); //click background to close viewer
searchOverlay.addEventListener('click',function(event) {if (event.target.id === 'search') {view_search('close');}},false); //click background to close search
document.addEventListener('keydown',event => {
  if(document.activeElement === searchbox) return;
  if(event.key === 's' && !event.repeat) {event.preventDefault(); view_search(); return;}
  if(event.repeat || viewerbg.style.display !== 'flex') return;
  switch(event.key) {
    case "Escape": fullscreen(0); viewer('none'); break;
    case "ArrowLeft": turnPage(-1); break;
    case "ArrowRight": turnPage(1); break;
    case 'f': fullscreen(1); break;
    case 'p': pausePlay(); break;
    case ' ': get_related(); break;
  }},false);

function viewer(openOrClose, pageNum, popState=false) {
  viewerbg.style.display = openOrClose;
  clearInterval(carousel);
  paused = false;
  if(openOrClose === 'flex') { //open
    document.body.style.overflow = 'hidden';
    if(pageNum) {
      imgIndex = pageNum;
      history.pushState(null,null);
      turnPage(0);
    }
  }
  else { //close
    document.body.style.overflow = 'auto';
    if(!popState) history.pushState({'did':null,'search':searchQueryRaw},null);
    document.title = searchQueryRaw || 'DeviantArt Gallery';
  }
}

function turnPage(previousOrNext) {
  imgIndex += previousOrNext;
  if (imgIndex > images.length) imgIndex = 1;
  if (imgIndex < 1) imgIndex = images.length;
  relatedScrollLocked = true;
  viewerbg.scrollTop = 0;
  fullViewImg.src = images[imgIndex-1].getAttribute('full');
  description.innerHTML = new Date(1000 * images[imgIndex-1].getAttribute('pubtime')).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
  head.innerHTML = images[imgIndex-1].nextElementSibling.innerHTML;
  did = images[imgIndex-1].id;
  document.getElementById('tags').innerHTML = fromuser.innerHTML = fromda.innerHTML = fromlists.innerHTML = '';
  if(backOrForward === 255 && previousOrNext != 0) history.pushState({'did':did,'search':searchQueryRaw},null);
  else history.replaceState({'did':did,'search':searchQueryRaw},null);
  document.title = images[imgIndex-1].nextElementSibling.children[0].innerText + ' | ' + images[imgIndex-1].nextElementSibling.children[1].innerText;
  backOrForward = previousOrNext;
  setTimeout(() => {relatedScrollLocked = false;}, 50);
}

async function turnPageR(e, _did) {
  e.preventDefault();
  did = _did;
  backOrForward = 255;
  var da = await DA_API('get_deviation');
  fullViewImg.src = da.content.src;
  description.innerHTML = new Date(1000 * da.published_time).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
  head.innerHTML = `<a href="${da.url}" target=_blank>${da.title}</a><div class=usericon><a href="https://www.deviantart.com/${da.author.username}/gallery/all" onclick="event.preventDefault();searchDA('@${da.author.username}')" target=_blank>${da.author.username}<img src="${da.author.usericon}" /></a></div>`;
  document.getElementById('tags').innerHTML = fromuser.innerHTML = fromda.innerHTML = fromlists.innerHTML = '';
  relatedScrollLocked = false;
  get_related();
  viewerbg.scrollTop = 0;
  if(e.type !== 'pop') history.pushState({'did':did,'search':searchQueryRaw},null);
  document.title = da.title + ' | ' + da.author.username;
  return false;
}

function get_related() {
  if(!relatedScrollLocked) {
    relatedScrollLocked = true;
    DA_API('related').then(z => {relatedimgs(z)},()=>{});
    DA_API('get_tags').then(x => {get_tags(x)},()=>{});
  }
}

function get_tags(k) {
  var links = '';
  var d = k.metadata[0].description;
  var idx = d.indexOf('https://www.deviantart.com/users/outgoing?');
  while(idx > -1) {
    d = d.substring(0,idx) + d.substring(idx + 42);
    idx = d.indexOf('https://www.deviantart.com/users/outgoing?');
  }
  description.innerHTML += '<br>' + d;
  for(let g of k.metadata[0].tags)
    links += '<a onclick=searchDA("#'+g.tag_name+'")>#'+g.tag_name+'</a>';
  document.getElementById('tags').innerHTML = links;
}

function view_search(openOrClose = 'open') {
  searchbox.value = null;
  if(openOrClose === 'open') {
    document.getElementById('search').style.display = 'flex';
    searchbox.focus();
  }
  else {
    document.getElementById('search').style.display = 'none';
    searchbox.blur();
  }
}

function searchDA(_query, popState=false) {
  const _searchQuery = _query || document.getElementById('searchbox').value;
  if(!_searchQuery) return;
  if(_searchQuery.startsWith('http')) {search_url(_searchQuery); return;}
  searchQueryRaw = _searchQuery;
  searchQuery = _searchQuery.replace(/[@#;:$<>"{}|~`*%]+/g,'');
  feedType = 'search';
  if(searchQueryRaw.charAt(0) === '#') {feedType = 'search_tags'; searchQuery = searchQuery.replace(/\s+/g,'');}
  if(searchQueryRaw.charAt(0) === '@') {feedType = 'user_gallery'; searchQuery = searchQuery.replace(/\s+/g,'');}
  scrollingLocked = true;
  offset = 0;
  imgCount = 1;
  container.innerHTML = '';
  DA_API(feedType).then(z => {offset = z.next_offset; prop(z)}, () => {});
  view_search('close',null,true);
  viewer('none',null,popState);
}

function search_url(s) {
  if(!s.match(/^https?:\/\/[^\.]+\.deviantart\.com\//)) {alert('Unsupported link\ndeviantart.com addresses only'); return;}
  view_search('close');
  viewer('flex');
  fetch('linkid.php?q=' + s)
  .then(y => {if(y.ok) return y.text(); else throw y.status;}, () => {throw false;})
  .then(x => {turnPageR(new Event('na'), x)}, (z) => {if(z === 406) alert('Unable to extract UUID from URL'); else alert('Unable to connect to server side relay');});
}

window.addEventListener('scroll',() => { //Infinate Scroll
  if(!scrollingLocked && offset !== null && window.scrollY > (document.body.offsetHeight - window.outerHeight - 556)) {
    scrollingLocked = true;
    DA_API(feedType).then(z => {offset = z.next_offset; prop(z)}, () => {scrollingLocked = false});
  }
});

document.getElementById('vwr').addEventListener('scroll',() => {if(!relatedScrollLocked) get_related();});
document.getElementById('searchbox').addEventListener('keyup',(event) => {if(event.key === 'Enter') searchDA();});

window.onpopstate = function(event) { //history api
  view_search('close');
  if(event.state && event.state.did) {
    viewer('flex',null,true);
    turnPageR(new Event('pop'),event.state.did);
  }
  else if(event.state && event.state.search && event.state.search !== searchQueryRaw)
    searchDA(event.state.search,true);
  else {
    if(searchQueryRaw && (!event.state || searchQueryRaw !== event.state.search)) {
      searchQueryRaw = null;
      feedType = 'recommend';
      offset = 0;
      imgCount = 1;
      container.innerHTML = '';
      DA_API('recommend').then(z => {prop(z)})
    }
    viewer('none',null,true);
  }
};

function pausePlay() {
  paused = !paused;
  if(paused) carousel = setInterval(turnPage,5000,1); //5 second autoplay
  else clearInterval(carousel);
}

function fullscreen(fs=1) {
  if(document.fullscreenElement == null) {
    if(fs === 1) {
      var rfs = viewerbg.requestFullscreen || viewerbg.mozRequestFullscreen || viewerbg.webkitRequestFullscreen; rfs.call(viewerbg);
    }
  }
  else {
    var rfs = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen; rfs.call(document);
  }
}

fullViewImg.addEventListener('load',() => { //preload next image
  if(backOrForward === 255) return; //clicked on related item
  if(backOrForward < 0 && imgIndex > 1) (new Image()).src = images[imgIndex-2].getAttribute('full');
  if(backOrForward >= 0 && imgIndex < images.length) (new Image()).src = images[imgIndex].getAttribute('full');
});

//Swipe Gestures
var xDown, swipe = 0;
document.addEventListener('touchstart', function(evt) {xDown = evt.touches[0].clientX; swipe = 0;}, false);
document.addEventListener('touchmove', function(evt) {
  var xUp = evt.touches[0].clientX;
  var xDiff = xDown - xUp;
  if(xDiff > 60 && swipe === 0) {turnPage(1); swipe=1;}
  if(xDiff < -60 && swipe === 0) {turnPage(-1); swipe=1;}
}, false);

