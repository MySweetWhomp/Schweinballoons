/**
 * a pause screen
 */

game.Pause = game.Pause || {};
game.Pause.Container = me.Container.extend({
    init: function() {
        this._super(me.Container, 'init');
        this.name = 'pause';

        this.floating = true;
        this.z = 95;
        this.alpha = 0;
        this.updateWhenPaused = true;

        this.addChild(new me.ColorLayer('background', 'rgb(215, 232, 148)', 95));
        this.font = new me.BitmapFont('font', { x : 8 , y : 8 }, 1);
        this.message = 'PAUSE';
        var messageSize = this.font.measureText(me.video.renderer, this.message);
        this.messagePosition = new me.Vector2d(
            (me.game.viewport.width / 2) - messageSize.width / 2,
            (me.game.viewport.height / 2) - messageSize.height / 2
        );
    },

    update: function(dt) {
        var ret = this._super(me.Container, 'update', [dt]);

        if (me.input.isKeyPressed('pause')) {
            this.alpha = this.alpha ? 0 : 1;
            if (this.alpha) {
                game.pause();
            } else {
                game.resume();
            }
            ret = true;
        }

        return ret;
    },

    draw: function(renderer, rect) {
        this._super(me.Container, 'draw', [renderer, rect]);
        renderer.save();
        renderer.setGlobalAlpha(this.alpha);
        this.font.draw(renderer, this.message, this.messagePosition.x, this.messagePosition.y);
        renderer.restore();
    }
});
