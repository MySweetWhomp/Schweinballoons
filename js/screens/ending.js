(function() {
    var Dummy = me.Container.extend({
        init: function() {
            this._super(me.Container, 'init');

            this.player = new game.PlayerEntity(0, 96, {
                width : 16,
                height : 32
            });
            this.player.body.gravity = 0;
            this.player.pos.set(-this.player.renderable.width, this.player.pos.y);
            this.addChild(this.player);

            this.piglets = [];
            for (var i = 0; i < 15; ++i) {
                this.piglets.push(new game.PigletEntity(
                    this.player.pos.x - (26 + (i * 24)),
                    112,
                    {
                        width : 16,
                        height : 16
                    }
                ));
                this.piglets[i].body.gravity = 0;
                this.piglets[i].rescued = true;
                this.piglets[i].setCurrentAnimation('happy');
                this.piglets[i].alwaysUpdate = true;
                this.addChild(this.piglets[i]);
            }

            this.TIME_BEFORE_CREDITS = 17500;
            this.startedSince = 0;
        },

        update: function(dt, rect) {
            var ret = false;

            this.player.body.vel.x = 0.3 * me.timer.tick;
            for (var i = 0; i < this.piglets.length; ++i) {
                this.piglets[i].body.vel.x = 0.3 * me.timer.tick;
            }

            this.startedSince += dt;
            if (this.startedSince >= this.TIME_BEFORE_CREDITS) {
                this.startedSince = 0;
                me.state.change(me.state.CREDITS);
                ret = true;
            }

            return this._super(me.Container, 'update', [dt, rect]) || ret;
        }
    });

    game.EndScreen = me.ScreenObject.extend({
        /**
         *  action to perform on state change
         */
        onResetEvent: function() {
            me.game.reset();

            // load a level
            me.levelDirector.loadLevel('area00');

            // setting bgm
            me.audio.playUniqueTrack('Final');

            me.sys.gravity = 0;

            me.input.paused = true;

            this.dummy = new Dummy();
            me.game.world.addChild(this.dummy);

            me.state.transition('fade', 'rgb(215, 232, 148)', 1000);
        },

        /**
         *  action to perform when leaving this screen (state change)
         */
        onDestroyEvent: function() {
            // remove the HUD from the game world
            me.game.world.removeChild(this.dummy);
        },
    });
})();
