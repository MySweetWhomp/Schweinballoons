(function() {
    var CenteredText = me.Container.extend({
        init: function(y, text, font) {
            this._super(me.Container, 'init', [0, y]);
            this.name = text[0];

            this.alwaysUpdate = true;

            this.font = font;
            this.text = [];
            var basePosX = me.game.viewport.width / 2,
                fontHeight = font.measureText(' ').height,
                basePosY = (me.game.viewport.height / 2) - ((text.length * fontHeight) / 2);
            for (var i = 0; i < text.length; ++i) {
                this.text.push({
                    text : text[i],
                    x : basePosX,
                    y : basePosY + (i * fontHeight)
                });
            }
        },

        draw: function(renderer, rect) {
            this._super(me.Container, 'draw', [renderer, rect]);

            renderer.save();
            renderer.translate(this.pos.x, this.pos.y);
            for (var i = 0; i < this.text.length; ++i) {
                this.font.draw(
                    renderer,
                    this.text[i].text,
                    this.text[i].x,
                    this.text[i].y
                );
            }
            renderer.restore();
        }
    });

    var CreditsContainer = me.Container.extend({
        init: function() {
            var texts = [
                ['SCHWEINBALLON', '', 'A GAME FOR', 'GBJAM #4'],
                ['GAME DESIGN', ' ', 'MATTHIEU GODET', 'PAUL JOANNON'],
                ['2D ART', ' ', 'MATTHIEU GODET'],
                ['MUSIC & SOUNDS', ' ', 'DJ PIE'],
                ['PROGRAMMATION', ' ', 'PAUL JOANNON', 'MATTHIEU VIENOT'],
                ['THANKS FOR', 'PLAYING', '', '-', '', 'MERCI D\'AVOIR', 'JOUE']
            ];

            var screenHeight = me.game.viewport.height;
            this._super(me.Container, 'init', [
                0, 0,
                me.game.viewport.width, texts.length * screenHeight
            ]);

            this.z = 10;
            this.alwaysUpdate = true;

            this.SCROLL_SPEED = 0.5;

            var font = new me.BitmapFont('font', { x : 8 , y : 8 }, 1);
            font.set('center', 1);

            for (var i = 0; i < texts.length; ++i) {
                this.addChild(new CenteredText(i * screenHeight, texts[i], font));
                this.lastScreenPosY = i * screenHeight;
            }

            this.BEFORE_SCROLL_START = 2000;
            this.startedSince = 0;
        },

        update: function(dt) {
            var ret = this._super(me.Container, 'update', [dt]);

            this.startedSince += dt;

            if (this.startedSince >= this.BEFORE_SCROLL_START) {
                if (me.game.viewport.pos.y < this.lastScreenPosY) {
                    me.game.viewport.translate(0, this.SCROLL_SPEED * me.timer.tick);
                    ret = true;
                }
            }

            return ret;
        }
    });

    game.CreditsScreen = me.ScreenObject.extend({
        onResetEvent: function() {
            me.audio.playUniqueTrack('Final');
            this.background = new me.ColorLayer('background', 'rgb(215, 232, 148)', 1);
            this.credits = new CreditsContainer();

            this.piglets = [
                new game.PigletEntity(5, 16, { width : 16 , height : 16 }),
                new game.PigletEntity(139, 16, { width : 16 , height : 16 }),
                new game.PigletEntity(5, 64, { width : 16 , height : 16 }),
                new game.PigletEntity(139, 64, { width : 16 , height : 16 }),
                new game.PigletEntity(5, 112, { width : 16 , height : 16 }),
                new game.PigletEntity(139, 112, { width : 16 , height : 16 })
            ];

            me.game.world.addChild(this.background);
            me.game.world.addChild(this.credits);
            for (var i = 0; i < this.piglets.length; ++i) {
                this.piglets[i].floating = true;
                this.piglets[i].rescued = true;
                this.piglets[i].body.gravity = 0;
                this.piglets[i].renderable.setCurrentAnimation('happy');
                me.game.world.addChild(this.piglets[i]);
            }
        },

        onDestroyEvent: function() {
            me.game.world.removeChild(this.background);
            me.game.world.removeChild(this.credits);
            for (var i = 0; i < this.piglets.length; ++i) {
                me.game.world.removeChild(this.piglets[i]);
            }
        }
    });
})();
