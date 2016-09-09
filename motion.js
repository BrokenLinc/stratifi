(function(){

    var BUFFER_SIZE = 6;
    var STRIKE_SENSITIVITY = 200;

    var $motion = $('#motion');
    var $orientation = $('#orientation');
    var $calibrate = $('#calibrate');
    var $notes = $('#notes');

    var device = {
      calibrationPoint: 0,
      calibrationAccell: 0,
      direction: 0,
      accell: 0
    };

    var aBuffer = [];

    function motion(e) {
      var c = event.accelerationIncludingGravity;
      var fun = _.flow(Math.sqrt, v => v * 10, Math.round)
      device.accell = fun([c.x, c.y, c.z]
        .map(val => Math.pow(val, 2))
        .reduce((carry, num) => carry + num, 0));
      var adjustedAccell = device.calibrationAccell - device.accell;
      aBuffer.push(adjustedAccell);
      if (aBuffer.length > BUFFER_SIZE) {
        aBuffer.shift();
        var b = aBuffer
          .concat()
          .sort();
        var diff = Math.abs(b[0] - b[5]);
        aBuffer = [];
        $motion.text(diff);
        if (diff >= STRIKE_SENSITIVITY) {
          play('snare');
        }
      }
    }

    function orientation(e) {
      device.direction = Math.ceil((e.alpha * .009) || 0);
      var adjustedDirection = device.adjustedDirection = device.direction - device.calibrationPoint;
      $notes.removeClass().addClass(adjustedDirection);
      addItem($orientation, `<li>${adjustedDirection}</li>`);
    }

    window.addEventListener('devicemotion', motion, false);
    window.addEventListener('deviceorientation', orientation, false);

    function addItem(list, value) {
      list.html($(value));
    }

    $calibrate.on('click', calibrateDirection);

    function calibrateDirection() {
      $motion.text('');
      device.calibrationPoint = device.direction;
      device.calibrationAccell = device.accell;
    }

  })();