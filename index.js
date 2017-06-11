var through = require('through2')

function parseInt32(n) {
  return parseInt(n, 32)
}

var throughOpts = {
  writableObjectMode: false,
  readableObjectMode: true
}

function linesParser(type) {
  var buffer = ''

  return through(throughOpts, onwrite, onflush)

  function parse(stream, list) {
    list.forEach(function (line) {
      var coords = line.split(' ').map(parseInt32)
      var last = { x: coords.shift(), y: coords.shift() }
      while (coords.length >= 2) {
        var next = { x: coords.shift(), y: coords.shift() }
        stream.push({
          type: type,
          start: last,
          end: next
        })
        last = next
      }
    })
  }

  function onwrite(chunk, enc, cb) {
    var lines = (buffer + chunk).split(',')
    buffer = lines.pop()
    parse(this, lines)
    cb()
  }
  function onflush(cb) {
    parse(this, [buffer])
    cb()
  }
}

function powerupsParser() {
  var buffer = ''
  return through(throughOpts, onwrite, onflush)

  function parse(stream, list) {
    list.forEach(function (powerup) {
      var data = powerup.split(' ')
      var type = data.shift()
      var pos = { x: parseInt32(data.shift()), y: parseInt32(data.shift()) }

      var pack = {
        type: 'powerup',
        powerup: type,
        position: pos
      }
      if (type === 'B' || type === 'G') {
        pack.direction = parseInt32(data.shift())
      }

      stream.push(pack)
    })
  }

  function onwrite(chunk, enc, cb) {
    var powerups = (buffer + chunk).split(',')
    buffer = powerups.pop()
    parse(this, powerups)
    cb()
  }
  function onflush(cb) {
    parse(this, [buffer])
    cb()
  }
}

function vehicleParser() {
  var buffer = ''
  return through(throughOpts, onwrite, onflush)

  function onwrite(chunk, enc, cb) {
    buffer += chunk.toString()
    cb()
  }
  function onflush(cb) {
    this.push({
      type: 'vehicle',
      vehicle: buffer
    })
    cb()
  }
}

function timeParser() {
  var buffer = ''
  return through(throughOpts, onwrite, onflush)
  function onwrite(chunk, enc, cb) {
    buffer += chunk.toString()
    cb()
  }
  function onflush(cb) {
    this.push({
      type: 'time',
      time: parseInt(buffer, 10)
    })
    cb()
  }
}

module.exports = function freeRiderTrackcodeParser() {
  var state = 0

  var parsers = [
    linesParser('line'),
    linesParser('scenery'),
    powerupsParser(),
    vehicleParser(),
    timeParser()
  ]

  var stream = through(throughOpts, onwrite, onflush)

  parsers.forEach(function (parser) {
    parser.on('data', stream.push.bind(stream))
  })

  return stream

  function onwrite(chunk, enc, cb) {
    var separator
    while ((separator = chunk.indexOf('#')) !== -1) {
      if (parsers[state]) {
        parsers[state].end(chunk.slice(0, separator))
      }
      chunk = chunk.slice(separator + 1)
      state += 1
    }
    // If there were more # than expected, treat the rest as junk
    if (parsers[state]) {
      parsers[state].write(chunk)
    }

    cb()
  }
  function onflush(cb) {
    if (parsers[state]) parsers[state].end()
    cb()
  }
}
