var test = require('tape')
var fs = require('fs')
var parser = require('.')

// Try a smallish track
test(function (t) {
  t.plan(2)
  fs.createReadStream('test/1363905.txt')
    .pipe(parser())
    .on('data', function (op) {
      if (op.type === 'vehicle') {
        t.equal(op.vehicle, 'BMX')
      }
      if (op.type === 'time') {
        t.equal(op.time, 30240)
      }
    })
    .on('finish', t.end)
})

// Try a large track
test(function (t) {
  t.plan(2)
  fs.createReadStream('test/785674.txt')
    .pipe(parser())
    .on('data', function (op) {
      if (op.type === 'vehicle') {
        t.equal(op.vehicle, 'MTB')
      }
      if (op.type === 'time') {
        t.equal(op.time, 16400)
      }
    })
    .on('finish', t.end)
})

