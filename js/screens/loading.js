(function() {
    var Shape = me.Renderable.extend({
        init: function() {
            this._super(me.Renderable, 'init', [
                16,
                (me.game.viewport.height / 2) - 16,
                me.game.viewport.width - 32,
                32
            ]);

            this.z = 10;

            this.progress = 0;
            this.invalidate = false;
        },

        update: function() {
            if (this.invalidate) {
                this.invalidate = false;
                return true;
            }
            return false;
        },

        draw: function(renderer) {
            renderer.save();

            renderer.translate(this.pos.x, this.pos.y);

            renderer.setColor('rgb(32, 70, 49)');
            renderer.fillRect(0, 0, this.width, this.height);

            renderer.setColor('rgb(215, 232, 148)');
            renderer.fillRect(2, 2, this.progress, this.height - 4);

            renderer.restore();
        },

        onProgressUpdate: function(progress) {
            this.progress = ~~(progress * (this.width - 4));
            this.invalidate = true;
        }
    });

    var Dot = me.Renderable.extend({
        init: function(x, y, index) {
            this._super(me.Renderable, 'init', [ x, y, 8, 8 ]);

            this.z = 10;

            this.alpha = +(index > 0);

            this.TIME_ON = 2500;
            this.TIME_OFF = 500;

            this.timer = this.TIME_ON - (index * this.TIME_OFF);
        },

        update: function(dt) {
            var ret = this._super(me.Renderable, 'update', [dt]);

            this.timer += dt;

            if (this.alpha && this.timer >= this.TIME_ON) {
                this.timer = this.alpha = 0;
                ret = true;
            } else if (!this.alpa && this.timer > this.TIME_OFF) {
                this.time = 0;
                this.alpha = 1;
                ret = true;
            }

            return ret;
        },

        draw: function(renderer) {
            renderer.save();

            renderer.setGlobalAlpha(this.alpha);

            renderer.setColor('rgb(32, 70, 49)');
            renderer.fillRect(this.pos.x, this.pos.y, this.width, this.height);

            renderer.restore();
        }
    });

    game.LoadingScreen = me.ScreenObject.extend({
        /**
         *  action to perform on state change
         */
        onResetEvent: function() {
            me.game.reset();

            this.background = new me.ColorLayer('background', 'rgb(215, 232, 148)', 1);
            this.shape = new Shape();
            this.dots = [];

            me.game.world.addChild(this.background);
            me.game.world.addChild(this.shape);
            for (var i = 0; i < 5; ++i) {
                this.dots.push(new Dot(
                    (me.game.viewport.width / 2) - 28 + (i * 12),
                    96,
                    i
                ));
                me.game.world.addChild(this.dots[i]);
            }

            this.loaderHdlr = me.event.subscribe(
                me.event.LOADER_PROGRESS,
                this.shape.onProgressUpdate.bind(this.shape)
            );
        },

        /**
         *  action to perform when leaving this screen (state change)
         */
        onDestroyEvent: function() {
            me.game.world.removeChild(this.background);
            me.game.world.removeChild(this.shape);
            for (var i = 0; i < this.dots.length; ++i) {
                me.game.world.removeChild(this.dots[i]);
            }
        }
    });
})();
