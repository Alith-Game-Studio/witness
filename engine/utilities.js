function namespace(code) {
  code()
}

namespace(function() {

/*** Start cross-compatibility ***/
// Used to detect if IDs include a direction, e.g. resize-top-left
if (!String.prototype.includes) {
  String.prototype.includes = function() {
    return String.prototype.indexOf.apply(this, arguments) !== -1
  }
}
Event.prototype.movementX = Event.prototype.movementX || Event.prototype.mozMovementX
Event.prototype.movementY = Event.prototype.movementY || Event.prototype.mozMovementY
Event.prototype.requestPointerLock = Event.prototype.requestPointerLock || Event.prototype.mozRequestPointerLock
/*** End cross-compatibility ***/

// https://stackoverflow.com/q/11409895
// Used to greatly simplify bbox translation by clamping cursor movement per-bbox
Number.prototype.clamp = function(min, max) {
  return this < min ? min : this > max ? max : this
}

// http://stackoverflow.com/q/901115
// @Cleanup: Unneeded? I need to implement daily puzzles somehow, though.
var urlParams
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {return decodeURIComponent(s.replace(pl, ' '))},
        query  = window.location.search.substring(1)

    urlParams = {}
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2])
})()

// https://stackoverflow.com/q/12571650
window_onerror = window.onerror
window.onerror = function(message, url, line) {
  FEEDBACK(message + ' on line ' + line)
  if (window_onerror == undefined) {
    console.error('Parse error in file ' + url + ' on line ' + line)
  } else {
    window_onerror(message, url, line)
  }
}

if (window.location.href.startsWith("http://127.0.0.1")) {
  window.assert = function(condition) {
    if (!condition) {
      debugger;
    }
  }
} else {
  window.assert = function(condition) {}
}

var tracks = {
  'start': new Audio('/data/panel_start_tracing.ogg'),
  'success': new Audio('/data/panel_success.ogg'),
  'fail': new Audio('/data/panel_failure.ogg'),
  'abort': new Audio('/data/panel_abort_tracing.ogg')
}

window.PLAY_SOUND = function(track) {
  console.log('Playing sound:', track)
  for (var name in tracks) {
    var audio = tracks[name]
    if (audio.pause) {
      audio.pause()
      audio.currentTime = 0
    }
  }
  tracks[track].volume = localStorage.volume
  tracks[track].play()
}

window.FEEDBACK = function(message) {
  var request = new XMLHttpRequest()
  request.open('POST', '/feedback', true) // Fire and forget
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  request.send('data=' + message)
}

window.ERROR = function(message) {
  var request = new XMLHttpRequest()
  request.open('POST', '/error', true) // Fire and forget
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  request.send('data=' + message)
}

window.LINE_PRIMARY = '#8FF'
window.LINE_SECONDARY = '#FF2'

if (localStorage.theme === 'true') { // Dark scheme
  window.BACKGROUND      = '#221' // '#000'
  window.FOREGROUND      = '#751' // '#873'
  window.BORDER          = '#666'
  window.LINE_DEFAULT    = '#888' // '#FD8'
  window.LINE_SUCCESS    = '#BBB' // '#FA0'
  window.LINE_FAIL       = '#000'
  window.CURSOR          = '#FFF'
  window.TEXT_COLOR      = '#CCC'
  window.PAGE_BACKGROUND = '#000'
} else { // Light scheme
  window.BACKGROUND      = '#0A8'
  window.FOREGROUND      = '#344'
  window.BORDER          = '#000'
  window.LINE_DEFAULT    = '#AAA'
  window.LINE_SUCCESS    = '#FFF'
  window.LINE_FAIL       = '#000'
  window.CURSOR          = '#FFF'
  window.TEXT_COLOR      = '#000'
  window.PAGE_BACKGROUND = '#FFF'
}

window.LINE_NONE     = 0
window.LINE_BLACK    = 1
window.LINE_BLUE     = 2
window.LINE_YELLOW   = 3
window.DOT_NONE      = 0
window.DOT_BLACK     = 1
window.DOT_BLUE      = 2
window.DOT_YELLOW    = 3
window.DOT_INVISIBLE = 4

// pointer-events: none; allows for onclick events to bubble up
var animations =
'.line-1 {fill: ' + window.LINE_DEFAULT + '; pointer-events: none;}\n' +
'.line-2 {fill: ' + window.LINE_PRIMARY + '; pointer-events: none;}\n' +
'.line-3 {fill: ' + window.LINE_SECONDARY + '; pointer-events: none;}\n' +
'@keyframes line-success {to {fill: ' + window.LINE_SUCCESS + ';}}\n' +
'@keyframes line-fail {to {fill: ' + window.LINE_FAIL + ';}}\n' +
'@keyframes error {to {fill: red;}}\n' +
'@keyframes fade {to {opacity: 0.35;}}\n' +
'@keyframes start-grow {from {r:12;} to {r: 24;}}\n'
var style = document.createElement('style')
style.type = 'text/css'
style.title = 'animations'
style.appendChild(document.createTextNode(animations))
document.head.appendChild(style)

// Custom logging to allow leveling
var consoleError = console.error
var consoleWarn = console.warn
var consoleInfo = console.log
var consoleLog = console.log
var consoleDebug = console.log
var consoleSpam = console.log
var consoleGroup = console.group
var consoleGroupEnd = console.groupEnd

window.setLogLevel = function(level) {
  console.error = function() {}
  console.warn = function() {}
  console.info = function() {}
  console.log = function() {}
  console.debug = function() {}
  console.spam = function() {}
  console.group = function() {}
  console.groupEnd = function() {}

  if (level === 'none') return

  // Instead of throw, but still red flags and is easy to find
  console.error = consoleError
  if (level === 'error') return

  // Less serious than error, but flagged nonetheless
  console.warn = consoleWarn
  if (level === 'warn') return

  // Default visible, important information
  console.info = consoleInfo
  if (level === 'info') return

  // Useful for debugging (mainly validation)
  console.log = consoleLog
  if (level === 'log') return

  // Useful for serious debugging (mainly graphics/misc)
  console.debug = consoleDebug
  if (level === 'debug') return

  // Useful for insane debugging (mainly tracing/recursion)
  console.spam = consoleSpam
  console.group = consoleGroup
  console.groupEnd = consoleGroupEnd
  if (level === 'spam') return
}
setLogLevel('info')

// TODO: This should be a document.DOMContentLoaded listener, and detect the present of a placeholder.
window.loadHeader = function(titleText) {
  document.body.style.marginLeft = '0px'

  var navbar = document.createElement('div')
  document.body.appendChild(navbar)
  navbar.className = 'navbar'
  navbar.style = 'min-width: 700px; position: fixed; top: 0; width: 100%; z-index: 1'
  navbar.style.borderBottom = '2px solid ' + window.BORDER
  navbar.style.background = window.PAGE_BACKGROUND

  var navbarPadding = document.createElement('div')
  document.body.appendChild(navbarPadding)
  navbarPadding.className = 'navbar-padding'

  var titleDiv = document.createElement('div')
  navbar.appendChild(titleDiv)
  titleDiv.style = 'position: absolute; width: 100%; pointer-events: none'

  var titleLabel = document.createElement('label')
  titleDiv.appendChild(titleLabel)
  titleLabel.style = 'font-size: 48; pointer-events: auto'
  titleLabel.id = 'title'
  titleLabel.innerText = titleText

  var link = document.createElement('label')
  navbar.appendChild(link)
  link.style = 'float: left; margin-left: 32px; cursor: pointer; line-height: 60px'
  link.className = 'navbar-content'

  if (window.location.href.endsWith('browse.html')) {
    link.innerText = 'Create a puzzle'
    link.onclick = function() {window.location = '/editor.html'}
  } else if (window.location.href.includes('/play/')) {
    link.innerText = 'Back to all puzzles'
    link.onclick = function() {window.location = '/browse.html'}
  } else /* if (window.location.href.endsWith('editor.html')) */ {
    link.innerText = 'View all puzzles'
    link.onclick = function() {window.location = '/browse.html'}
  }


  var feedbackButton = document.createElement('label')
  navbar.appendChild(feedbackButton)
  feedbackButton.style = 'float: right; margin-right: 8px; cursor: pointer; line-height: 60px'
  feedbackButton.innerText = 'Send feedback'
  feedbackButton.className = 'navbar-content'
  feedbackButton.onclick = function () {
    var feedback = prompt('Provide feedback:')
    if (feedback) {
      window.FEEDBACK(feedback)
    }
  }

  var separator = document.createElement('label')
  navbar.appendChild(separator)
  separator.style = 'float: right; line-height: 60px; padding-left: 6px; padding-right: 6px'
  separator.className = 'navbar-content'
  separator.innerText = '|'

  var sourceLink = document.createElement('label')
  navbar.appendChild(sourceLink)
  sourceLink.style = 'float: right; line-height: 60px; cursor: pointer'
  sourceLink.innerText = 'Source code'
  sourceLink.className = 'navbar-content'
  sourceLink.onclick = function() {window.location = 'https://github.com/jbzdarkid/witness-puzzles'}


  var collapsedSettings = drawSymbol({'type': 'plus', 'width':20, 'height':20})
  navbar.appendChild(collapsedSettings)
  collapsedSettings.style = 'width: 20px; height: 20px; position: absolute; left: 0; cursor: pointer'
  collapsedSettings.style.border = '2px solid ' + window.BORDER
  collapsedSettings.id = 'collapsedSettings'
  collapsedSettings.onclick = function() {
    this.style.display = 'none'
    var expandedSettings = document.getElementById('expandedSettings')
    expandedSettings.style.display = null
  }

  var expandedSettings = document.createElement('div')
  navbar.appendChild(expandedSettings)
  expandedSettings.style = 'width: 250px; position: absolute; left: 0; display: none; padding: 10px'
  expandedSettings.style.border = '2px solid ' + window.BORDER
  expandedSettings.style.background = window.PAGE_BACKGROUND
  expandedSettings.id = 'expandedSettings'

  var minus = drawSymbol({'type':'minus', 'width':20, 'height':20})
  minus.style = 'width: 20px; height: 20px; cursor: pointer; position: absolute; top: 0; left: 0'
  expandedSettings.appendChild(minus)
  minus.onclick = function() {
    this.parentElement.style.display = 'none'
    var collapsedSettings = document.getElementById('collapsedSettings')
    collapsedSettings.style.display = null
  }

  // Now, for the contents of the settings
  var settingsLabel = document.createElement('label')
  expandedSettings.appendChild(settingsLabel)
  settingsLabel.innerText = 'settings'
  settingsLabel.style = 'line-height: 0px' // Attach to the top

  expandedSettings.appendChild(document.createElement('br'))
  expandedSettings.appendChild(document.createElement('br'))

  // Theme
  var themeBox = document.createElement('input')
  expandedSettings.appendChild(themeBox)
  themeBox.className = 'checkbox'
  themeBox.type = 'checkbox'
  themeBox.id = 'theme'
  themeBox.onchange = function() {
    localStorage.theme = this.checked
    location.reload()
  }
  themeBox.checked = (localStorage.theme === 'true')
  // This needs to happen now, since the document body hasn't yet loaded.
  document.body.style.color = window.TEXT_COLOR
  document.body.style.background = window.PAGE_BACKGROUND

  var themeLabel = document.createElement('label')
  expandedSettings.appendChild(themeLabel)
  themeLabel.htmlFor = 'theme'
  themeLabel.innerText = ' Dark theme'

  expandedSettings.appendChild(document.createElement('br'))
  expandedSettings.appendChild(document.createElement('br'))

  // Sensitivity
  var sensLabel = document.createElement('label')
  expandedSettings.appendChild(sensLabel)
  sensLabel.htmlFor = 'sens'
  sensLabel.innerText = 'Mouse Speed 2D'

  if (localStorage.sensitivity == undefined) localStorage.sensitivity = 0.7
  var sens = document.createElement('input')
  expandedSettings.appendChild(sens)
  sens.style.width = '100%'
  sens.type = 'range'
  sens.id = 'sens'
  sens.min = '0.1'
  sens.max = '1.3'
  sens.step = '0.1'
  sens.value = localStorage.sensitivity
  sens.onchange = function() {
    localStorage.sensitivity = this.value
  }

  // Volume
  var volumeLabel = document.createElement('label')
  expandedSettings.appendChild(volumeLabel)
  volumeLabel.htmlFor = 'volume'
  volumeLabel.innerText = 'Volume'

  if (localStorage.volume == undefined || localStorage.volume < 0 || localStorage.volume > 0.24) {
    localStorage.volume = 0.12
  }
  var volume = document.createElement('input')
  expandedSettings.appendChild(volume)
  volume.style.width = '100%'
  volume.type = 'range'
  volume.id = 'volume'
  volume.min = '0'
  volume.max = '0.24'
  volume.step = '0.02'
  volume.value = localStorage.volume
  volume.onchange = function() {
    localStorage.volume = this.value
  }
}












/// ------------
/// Everything below this is legacy, and should not be used.
/// ============



window.createLink = function(href, title, parent) {
  parent = parent || document.currentScript.parentElement
  var link = document.createElement('label')
  parent.appendChild(link)
  link.onclick = function() {
    window.location = href
  }
  link.innerText = title
  link.style = style
  link.style.cursor = 'pointer'
  link.style.color = window.TEXT_COLOR // Not inherited, sadly
}

///


function loadFeedback() {
  var feedbackButton = document.createElement('label')
  document.currentScript.parentElement.appendChild(feedbackButton)
  feedbackButton.innerText = 'Send feedback'
  feedbackButton.style.margin = 'auto'
  feedbackButton.style.cursor = 'pointer'
  feedbackButton.style.fontSize = '28'
  feedbackButton.onclick = function () {
    var feedback = prompt('Provide feedback:')
    if (feedback) {
      window.FEEDBACK(feedback)
    }
  }
}

function hideSettings() {
  localStorage.settings = 'hidden'
  var settings = document.getElementById('settings')
  settings.style.display = 'none'
  var toggle = document.getElementById('settingsToggle')
  toggle.innerHTML = '+'
  toggle.onclick = function(){ showSettings() }
  toggle.parentElement.style.width = '20px'
  toggle.parentElement.style.height = '20px'
  toggle.style.top = '-11px'
}

function showSettings() {
  localStorage.settings = 'visible'
  var settings = document.getElementById('settings')
  settings.style.display = null
  var toggle = document.getElementById('settingsToggle')
  toggle.innerHTML = '&ndash; &nbsp; &nbsp; &nbsp; &nbsp;settings&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; '
  toggle.onclick = function(){ hideSettings() }
  toggle.parentElement.style.width = '250px'
  toggle.parentElement.style.height = null
  toggle.style.top = '-10px'
}

// @Cleanup: Settings should live in one variable in localStorage, it makes it easier to save them / persist them across clears
function loadSettings(parent) {
  parent = parent || document.currentScript.parentElement
  var parentDiv = document.createElement('div')
  parent.appendChild(parentDiv)
  parentDiv.style.position = 'absolute'
  parentDiv.style.border = '2px solid ' + window.BORDER
  parentDiv.style.background = window.PAGE_BACKGROUND

  var toggle = document.createElement('label')
  parentDiv.appendChild(toggle)
  toggle.style.position = 'absolute'
  toggle.style.left = '2'
  toggle.style.cursor = 'pointer'
  toggle.id = 'settingsToggle'

  var settings = document.createElement('div')
  parentDiv.appendChild(settings)
  settings.id = 'settings'
  settings.style.margin = '10px'

  if (localStorage.settings === 'hidden') {
    hideSettings()
  } else {
    showSettings()
  }

  // Now, for the contents of the settings
  settings.appendChild(document.createElement('br'))

  // Theme
  var themeBox = document.createElement('input')
  settings.appendChild(themeBox)
  themeBox.className = 'checkbox'
  themeBox.type = 'checkbox'
  themeBox.id = 'theme'
  themeBox.onchange = function() {
    localStorage.theme = this.checked
    location.reload()
  }
  themeBox.checked = (localStorage.theme === 'true')
  // This needs to happen now, since the document body hasn't yet loaded.
  document.body.style.color = window.TEXT_COLOR
  document.body.style.background = window.PAGE_BACKGROUND

  var themeLabel = document.createElement('label')
  settings.appendChild(themeLabel)
  themeLabel.htmlFor = 'theme'
  themeLabel.innerText = ' Dark theme'

  settings.appendChild(document.createElement('br'))
  settings.appendChild(document.createElement('br'))

  // Sensitivity
  var sensLabel = document.createElement('label')
  settings.appendChild(sensLabel)
  sensLabel.htmlFor = 'sens'
  sensLabel.innerText = 'Mouse Speed 2D'

  if (localStorage.sensitivity == undefined) localStorage.sensitivity = 0.7
  var sens = document.createElement('input')
  settings.appendChild(sens)
  sens.style.width = '100%'
  sens.type = 'range'
  sens.id = 'sens'
  sens.min = '0.1'
  sens.max = '1.3'
  sens.step = '0.1'
  sens.value = localStorage.sensitivity
  sens.onchange = function() {
    localStorage.sensitivity = this.value
  }

  // Volume
  var volumeLabel = document.createElement('label')
  settings.appendChild(volumeLabel)
  volumeLabel.htmlFor = 'volume'
  volumeLabel.innerText = 'Volume'

  if (localStorage.volume == undefined || localStorage.volume < 0 || localStorage.volume > 0.24) {
    localStorage.volume = 0.12
  }
  var volume = document.createElement('input')
  settings.appendChild(volume)
  volume.style.width = '100%'
  volume.type = 'range'
  volume.id = 'volume'
  volume.min = '0'
  volume.max = '0.24'
  volume.step = '0.02'
  volume.value = localStorage.volume
  volume.onchange = function() {
    localStorage.volume = this.value
  }
}

})