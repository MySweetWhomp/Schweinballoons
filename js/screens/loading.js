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

    game.LoadingScreen = me.ScreenObject.extend({
        /**
         *  action to perform on state change
         */
        onResetEvent: function() {
            me.game.reset();

            this.background = new me.ColorLayer('background', 'rgb(215, 232, 148)', 1);
            this.shape = new Shape();

            me.game.world.addChild(this.background);
            me.game.world.addChild(this.shape);

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
        }
    });
})();
