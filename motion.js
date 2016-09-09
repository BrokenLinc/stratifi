(function(){

    var BUFFER_SIZE = 5;
    var STRIKE_SENSITIVITY = 100;

    var $motion = $('#motion');
    var $orientation = $('#orientation');
    var $calibrate = $('#calibrate');
    var $notes = $('#notes');
    var $drumsound = $('#drumsound');

    var device = {
      instrument: 'drums',
      calibrationPoint: 0,
      calibrationAccell: 0,
      direction: 0,
      accell: 0,
      adjustedDirection: 0
    };

    function getDrumSound(val) {
      if (val == 0) 
        return 'bass-drum';
      else if (val < 0)
        return 'snare';
      else
        return 'closed-hat'
    }

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
        var diff = Math.abs(b[0] - b[BUFFER_SIZE - 1]);
        // $motion.text(diff);
        if (diff >= STRIKE_SENSITIVITY) {
          aBuffer = [];
          $('body').css('background-color', 'red');
          setTimeout(() => $('body').css('background-color', ''), 100);
          $drumsound.text(getDrumSound(device.adjustedDirection));
          if (device.instrument == 'drums') {
            play(getDrumSound(device.adjustedDirection));
          } else {
            play(device.instrument, scale[rint(0, scale.length - 1)], 350);
          }
        }
      }
    }

    $('.instrument').on('click', changeInstruments);
    function changeInstruments(ev) {
      var $inst = $(this);
      $('.instrument').removeClass('active');
      $inst.addClass('active');
      device.instrument = $inst.attr('data-inst');
      console.log(device);
    }

    function orientation(e) {
      device.direction = Math.ceil((e.alpha * .03) || 0);
      device.adjustedDirection = device.calibrationPoint - device.direction;
      addItem($orientation, `<li>${device.adjustedDirection}</li>`);
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