
/* Game namespace */
var game = {

    // an object where to store game information
    data : { },

    // Run on page load.
    onload : function () {
        // Initialize the video.
        var scale = 3 * window.devicePixelRatio;
        if (!me.video.init(160, 144, { wrapper : 'screen', scale : scale })) {
            alert('Your browser does not support HTML5 canvas.');
            return;
        }

        // Initialize the audio.
        me.audio.init('mp3,ogg');

        // setting up sound
        me.audio.samplePlaying = null;
        me.audio.samplePriority = {
            action: ['kick', 'jump']
        };
        me.audio.playUnique = function(soundName, channel, loop) {
            // set to default channel
            channel = channel || 'default';

            // get samples priority
            var selfId = me.audio.samplePriority[channel].indexOf(soundName);
            var currentId = me.audio.samplePriority[channel].indexOf(me.audio.samplePlaying);

            // if this sample is in the priority list
            if (selfId >= 0) {
                // if a sound is playing,
                if (currentId >= 0) {
                    // if has a lower priority
                    if (selfId < currentId) {
                        // we stop current sample only
                        me.audio.stop(me.audio.samplePlaying);
                        me.audio.samplePlaying = null;
                    } else {
                        // we do nothing
                        return null;
                    }
                }

                // we play a sound
                me.audio.samplePlaying = soundName;
                return me.audio.play(soundName, loop, function () {
                    me.audio.samplePlaying = null;
                });
            } else {
                return null;
            }
        }

        // Set a callback to run when loading is complete.
        me.loader.onload = this.loaded.bind(this);

        // Load the resources.
        me.loader.preload(game.resources);

        // Initialize melonJS and display a loading screen.
        me.state.change(me.state.LOADING);
    },

    // Run on game resources loaded.
    loaded : function () {
        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.PLAY, new game.PlayScreen());

        // add our player entity in the entity pool
        me.pool.register('player', game.PlayerEntity);
        me.pool.register('ball', game.BallEntity);
        me.pool.register('piglet', game.PigletEntity);
        me.pool.register('boar', game.BoarEntity);

        // enable the keyboard
        me.input.bindKey(me.input.KEY.LEFT, 'left');
        me.input.bindKey(me.input.KEY.RIGHT, 'right');
        me.input.bindKey(me.input.KEY.UP, 'jump', true);
        me.input.bindKey(me.input.KEY.A, 'kick', true);
        // added for debug purposes
        me.input.bindKey(me.input.KEY.E, 'debug', true);

        // sets global gravity
        me.sys.gravity = 0.7;

        // starts the game.
        me.state.change(me.state.PLAY);
    }
};
