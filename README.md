# DeviantArt Gallery
### _Browse DeviantArt more quickly as a minimalist image gallery_

The DeviantArt API plugged into my unbranded seamless image gallery ([Chicnado](https://github.com/Voldrix/Chicnado))

## Features
- images load in pop-up, keeping you on the same page
- related images are larger and easier to see
- no UI clutter on screen
- search for: text, tags, users, or specific image URL
- image titles are not truncated
- browse anything quickly while never leaving the page
- no libraries or dependencies

## Instructions
you need to register your app with the deviantArt API using __implicit__ authentication. [https://www.deviantart.com/developers/](https://www.deviantart.com/developers/)\
The authorization code method will be supported in a future version\
enter the redirect URL to point to your install of this software\
once you save, take the __client_id__ and set it to the variable on line 1 of `scripts.js`\
you do not need to select publish to deviantArt

### Controls
- `S` Search
  - `Enter` submit search
- `P` Play / Pause image carousel (5s interval)
- `F` Fullscreen / unFullscreen
- `ESC` unFullscreen / Close image
- `Left` Previous image
- `Right` Next image
- `Space` / `scroll wheel` load related images
  - scroll wheel only works if the image fills the screen vertically

__Click Controls__
- thumbnail - opens image
- image title - opens image on deviantart, in new tab
- image username - loads user's gallery
- related image - loads full size image in viewer
- related image (opened in new tab) - loads user's gallery and displays selected image
- tag - search for that tag
- hover title in viewer - displays description (only once related images have been requested/loaded)
- hover related image - see image title as HTML title
- translucent background - close viewer / search

__Search__
- `any text` regular (recommended) search
- `#tag` images with that tag
- `@user` load user's gallery
- `https://www.deviantart.com/USER/art/TITLE` load specific image in viewer
  - also works with old subdomain based links
  - uses `linkid.php` to relay the link and scrape the UUID from the head metadata
  - does not support fav.me since deviantart has deprecated it

__on-screen navigation buttons__\
left, right, close\
swipe left, swipe right (only on mobile)

__History__\
uses the browser history API so you can navigate back to previously viewed images

### Live Demo
[https://voldrixia.com/da/](https://voldrixia.com/da/)

#### Contributing
pull requests are welcome, especially for mobile compatibility, as I haven't tested that extensively\
Just remember the goal of this project to keep the UI mostly invisible / minimal

__ToDo__\
support authentication code method\
/popular API endpoint is broken. (issue has already been [reported](https://github.com/wix-incubator/DeviantArt-API/issues/206))\
keyboard control alternatives for mobile\
maybe a service worker to cache API calls

#### License
[MIT License](LICENSE)

