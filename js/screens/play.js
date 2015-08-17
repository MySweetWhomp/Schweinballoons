game.PlayScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // load a level
        var currentLevelIndex = '0' + String(game.data.currentLevel);
        me.levelDirector.loadLevel('area' + currentLevelIndex);

        // setting bgm
        me.audio.playUniqueTrack('BGM');

        // add our HUD to the game world
        this.HUD = new game.HUD.Container();
        this.pause = new game.Pause.Container();
        me.game.world.addChild(this.HUD);
        me.game.world.addChild(this.pause);

        me.input.paused = false;

        me.state.transition('fade', 'rgb(215, 232, 148)', 350);

        this.won = false;
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);
        me.game.world.removeChild(this.pause);
    },

    win: function() {
        me.input.paused = true;
        this.won = true;
    },

    nextLevel: function() {
        if (game.data.currentLevel < me.levelDirector.levelCount() - 1) {
            ++game.data.currentLevel;
            me.state.change(me.state.PLAY);
        } else {
            me.state.change(me.state.GAME_END);
        }
    }
});
