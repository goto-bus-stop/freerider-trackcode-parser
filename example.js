var got = require('got').stream
var parser = require('.')

var request = got.post('http://canvasrider.com/js/load.php', {
  body: {
    track: 1463046
  }
})

request.on('error', console.error)

// Show the amount of each type of operation in the track
var ops = {}
request.pipe(parser()).on('data', function (op) {
  if (ops[op.type]) {
    ops[op.type] ++
  } else {
    ops[op.type] = 1
  }
}).on('finish', function () {
  console.log(ops)
})
