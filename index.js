//utils
function setupProgramChanges() {
	for(var i=0;i<instruments.length;i++) {
		MIDI.programChange(i, MIDI.ProgramNumbers[instruments[i]]);	
	}
}
function rint(min, max) {
	return min + Math.floor(Math.random() * (max-min+1));
}
function generatePentaScale(startingWith, octaves) {
	var scale = [];
	for (var i=0; i<octaves;i++) {
		var base = startingWith + 12*i;
		scale.push(base);
		scale.push(base+2);
		scale.push(base+4);
		scale.push(base+7);
		scale.push(base+9);
	}
	return scale;
}

// play note
// Ex: play('snare');
// Ex: play('synth_bass_1', e.which, 100);
// Instruments: https://github.com/gleitz/midi-js-soundfonts/blob/master/FluidR3_GM/names.json
// Notes to numbers: https://newt.phys.unsw.edu.au/jw/graphics/notesinvert.GIF
function play(instrument, note, velocity) {
	if(drums[instrument]) {
		drums[instrument].currentTime = 0;
		drums[instrument].volume = 0.5;
		drums[instrument].play();
	} else {
		var delay = 0;
		var channelIndex =  _.indexOf(instruments, instrument);
		// play the note
		MIDI.setVolume(0, 127);
		MIDI.noteOn(channelIndex, note, velocity, delay);
		MIDI.noteOff(channelIndex, note, delay + 0.75);
	}
}

//demo config
var instruments = [
	'acoustic_grand_piano',
	'synth_bass_1',
	'marimba'
];
var drums = {
	'bass-drum': new Audio("soundfiles/bass-drum.wav"),
	'closed-hat': new Audio("soundfiles/closed-hat.mp3"),
	'snare': new Audio("soundfiles/snare.wav")
};
var scale = generatePentaScale(44, 1);

//demo interactions
$(document).on('mousedown', function() {
	play(['bass-drum', 'closed-hat', 'snare'][rint(0,2)]);
});
$(document).on('keydown', function(e) {
	play('marimba', scale[rint(0, scale.length - 1)], 100);
});

//setup (run after config)
MIDI.loadPlugin({
	soundfontUrl: "FluidR3_GM/",
	instruments: instruments,
	callback: function() {
		setupProgramChanges();
	}
});