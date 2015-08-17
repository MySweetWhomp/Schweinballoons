
/* Game namespace */
var game = {

    // an object where to store game information
    data : {
        currentLevel : 1
    },

    // the channels for buttons/doors
    channels : { },

    // Run on page load.
    onload : function () {
        // Initialize the video.
        var scale = 3 * window.devicePixelRatio;
        if (!me.video.init(160, 144, { wrapper : 'screen', scale : scale })) {
            alert('Your browser does not support HTML5 canvas.');
            return;
        }

        // Initialize the audio.
        me.audio.init('ogg');

        // setting up sound
        me.audio.samplePlaying = null;
        me.audio.samplePriority = { action: ['startpause', 'youpi', 'mort', 'interrupteur',
                                             'blockdestroy', 'kick', 'jump', 'oscours'] };

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
        };

        me.audio.playUniqueTrack = function(trackName) {
            if (me.audio.getCurrentTrack() !== trackName) {
                me.audio.stopTrack();
                me.audio.playTrack(trackName);
            }
        };

        me.state.set(me.state.LOADING, new game.LoadingScreen());

        // Set a callback to run when loading is complete.
        me.loader.onload = this.loaded.bind(this);

        // Load the resources.
        me.loader.preload(game.resources);

        // Initialize melonJS and display a loading screen.
        me.state.change(me.state.LOADING);
    },

    // Run on game resources loaded.
    loaded : function () {
        me.state.GAME_START = me.state.USER + 1;
        me.state.set(me.state.GAME_START, new game.IntroScreen());
        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.PLAY, new game.PlayScreen());
        me.state.set(me.state.GAME_END, new game.EndScreen());
        me.state.set(me.state.CREDITS, new game.CreditsScreen());

        // add our player entity in the entity pool
        me.pool.register('player', game.PlayerEntity);
        me.pool.register('ball', game.BallEntity);
        me.pool.register('piglet', game.PigletEntity);
        me.pool.register('boar', game.BoarEntity);
        me.pool.register('block', game.BlockEntity);
        me.pool.register('trigger', game.TriggerEntity);
        me.pool.register('door', game.DoorEntity);

        // enable the keyboard
        me.input.bindKey(me.input.KEY.LEFT, 'left');
        me.input.bindKey(me.input.KEY.RIGHT, 'right');
        me.input.bindKey(me.input.KEY.UP, 'up');
        me.input.bindKey(me.input.KEY.C, 'jump', true);
        me.input.bindKey(me.input.KEY.X, 'kick', true);
        me.input.bindKey(me.input.KEY.ESC, 'pause', true);

        // sets global gravity
        me.sys.gravity = 0.7;

        this.paused = false;
        me.input.paused = false;

        me.state.transition('fade', 'rgb(215, 232, 148)', 350);

        me.state.onResume = function() {
            if (game.isPaused()) {
                game.pause();
            }
        };

        // starts the game.
        me.state.change(me.state.GAME_START);
    },

    pause: function() {
        this.paused = true;
        me.state.pause(true);
    },

    resume: function() {
        this.paused = false;
        me.state.resume(true);
    },

    isPaused: function() {
        return this.paused;
    },
};
