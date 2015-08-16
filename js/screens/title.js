(function() {
    var TextContainer = me.Container.extend({
        init: function() {
            this._super(me.Container, 'init');

            this.z = 10;

            this.font = new me.BitmapFont('font', { x : 8 , y : 8 }, 1);
            this.font.set('center', 1);
            this.text = [
                { text : '@2015' },
                { text : 'MY SWEET WHOMP' }
            ];
            var basePosX = me.game.viewport.width / 2,
                basePosY = me.game.viewport.bottom - 8;
            for (var i = 0; i < this.text.length; ++i) {
                var pos = new me.Vector2d(
                    basePosX,
                    basePosY - (8 * (this.text.length - i))
                );
                this.text[i].x = pos.x;
                this.text[i].y = pos.y;
            }
        },

        update: function(dt) {
            var ret = this._super(me.Container, 'update', [dt]);

            if (me.input.isKeyPressed('kick') ||
                me.input.isKeyPressed('jump') ||
                me.input.isKeyPressed('pause')) {
                    ret = true;
                    me.state.change(me.state.GAME_START);
                }

            return ret;
        },

        draw: function(renderer, rect) {
            this._super(me.Container, 'draw', [renderer, rect]);

            for (var i = 0; i < this.text.length; ++i) {
                this.font.draw(renderer, this.text[i].text, this.text[i].x, this.text[i].y);
            }
        }
    });

    game.TitleScreen = me.ScreenObject.extend({
        /**
         *  action to perform on state change
         */
        onResetEvent: function() {
            this.background = new me.ColorLayer('black', 'rgb(215, 232, 148)', 1);
            this.text = new TextContainer();
            me.game.world.addChild(this.background);
            me.game.world.addChild(this.text);
        },

        /**
         *  action to perform when leaving this screen (state change)
         */
        onDestroyEvent: function() {
            me.game.world.removeChild(this.background);
            me.game.world.removeChild(this.text);
        }
    });
})();
