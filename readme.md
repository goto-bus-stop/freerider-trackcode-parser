# freerider-trackcode-parser

A streaming parser for Free Rider trackcodes, like those used by [CanvasRider](http://canvasrider.com/).

## Usage

```js
var got = require('got').stream
var parser = require('freerider-trackcode-parser')

var request = got.post('http://canvasrider.com/js/load.php', {
  body: {
    track: 1463046
  }
})

request.pipe(parser()).on('data', function (op) {
  switch (op.type) {
  case 'line':
    // a line from
    [op.start.x, op.start.y];
    // to
    [op.end.x, op.end.y];
    break
  case 'scenery':
    // a scenery line from
    [op.start.x, op.start.y];
    // to
    [op.end.x, op.end.y];
    break
  case 'powerup':
    // a powerup of type
    op.powerup // 'B', 'G', 'O', 'C', 'S', 'T'
    // at
    [op.position.x, op.position.y];
    // and if the type is 'B' or 'G',
    op.direction // in degrees
    break
  case 'vehicle':
    // the default vehicle type
    op.vehicle
    break
  case 'time':
    // the fastest finish time so far
    op.time
    break
  }
})
```

## License

[MIT](./LICENSE)

