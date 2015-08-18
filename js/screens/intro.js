(function() {
    var Screen = me.Container.extend({
        init: function(index, backgroundColor) {
            this._super(me.Container, 'init');

            index = String(index);
            this.backgroundColor = backgroundColor;

            this.addChild(new me.ColorLayer('background', backgroundColor, 1));
            this.background = new me.ImageLayer(
                0,
                -(me.game.viewport.height * 2),
                {
                    image : 'intro-' + index + '-bg',
                    width : me.game.viewport.width,
                    height : me.game.viewport.height,
                    z : 2
                }
            );
            this.background._width = me.game.viewport.width * 3;
            this.background._height = me.game.viewport.height * 3;
            this.addChild(this.background);

            this.addChild(new me.ImageLayer(0, 0, {
                image : 'intro-' + index + '-frame-bg',
                z : 5
            }));
            this.addChild(new me.ImageLayer(0, 0, {
                image : 'intro-' + index + '-frame',
                z : 10
            }));

            this.MAX_SCREEN_TIME = 4000;
            this.sinceScreenStart = 0;

            this.ended = false;
        },

        update: function(dt) {
            this.background.pos.x -= 1;
            this.background.pos.y += 1;

            this._super(me.Container, 'update', [dt]);

            this.sinceScreenStart += dt;
            if (me.input.isKeyPressed('kick') ||
                me.input.isKeyPressed('jump') ||
                me.input.isKeyPressed('pause') ||
                this.sinceScreenStart >= this.MAX_SCREEN_TIME) {
                    if (!this.ended) {
                        me.state.current().nextScreen(this.backgroundColor);
                        ret = true;
                        this.ended = true;
                    }
                }

            return true;
        }
    });

    var screens = [
        Screen.extend({
            init: function() {
                this._super(Screen, 'init', [1, 'rgb(174, 196, 64)']);

                this.animation = new me.AnimationSheet(0, 0, {
                    image : 'intro-1-anim',
                    framewidth : me.game.viewport.width,
                    frameheight : me.game.viewport.height,
                });
                this.animation.z = 7;
                this.animation.anim.default.animationspeed = 200;
                this.addChild(this.animation);
            }
        }),
        Screen.extend({
            init: function() {
                this._super(Screen, 'init', [2, 'rgb(82, 127, 57)']);
                this.addChild(new me.ImageLayer(0, 0, {
                    image : 'intro-2-anim',
                    z : 10
                }));

                this.zzz = new me.AnimationSheet(128, 48, {
                    image : 'intro-2-anim-zzz',
                    framewidth : 20,
                    frameheight : 20
                });
                this.zzz.z = 15;
                this.zzz.anim.default.animationspeed = 200;
                this.addChild(this.zzz);

                var Boar = me.AnimationSheet.extend({
                    init: function(x, y) {
                        this._super(me.AnimationSheet, 'init', [x, y, {
                            image : 'intro-2-anim-boar',
                            framewidth : 15,
                            frameheight : 15
                        }]);

                        this.z = 7;
                    }
                });

                this.boars = [];
                for (var i = 0; i < 4; ++i) {
                    this.boars.push(new Boar(-16 * i, 80));
                    this.addChild(this.boars[i]);
                }
            },

            update: function(dt) {
                for (var i = 0; i < this.boars.length; ++i) {
                    this.boars[i].pos.x += 0.2 * me.timer.tick;
                }

                return this._super(Screen, 'update', [dt]);
            }
        }),
        Screen.extend({
            init: function() {
                this._super(Screen, 'init', [3, 'rgb(82, 127, 57)']);

                for (i = 0; i < this.children.length; ++i) {
                    this.children[i].floating = true;
                }

                var Boar = me.ImageLayer.extend({
                    init: function(x, last) {
                        this._super(me.ImageLayer, 'init', [x, 48, {
                            image : 'intro-3-anim-boar' + (last ? '-last' : ''),
                            width : 107,
                            height : 47
                        }]);

                        this.z = 7;
                    }
                });

                this.boars = [];
                for (var i = 0; i < 4; ++i) {
                    this.boars.push(new Boar(48 + (i * (107 + 16)), i === 3));
                    this.addChild(this.boars[i]);
                }

                this.junior = null;
            },

            addJunior: function() {
                this.junior = new me.ImageLayer(104, 64, {
                    image : 'intro-3-anim-junior',
                    width : 19,
                    height : 20
                });

                this.junior.z = 6;

                this.addChild(this.junior);
            },

            update: function(dt) {
                var boarSpeed = 2.2;

                if (this.boars[3].pos.x <= 10) {
                    if (this.junior == null) {
                        this.addJunior();
                    }
                    this.junior.pos.y -= 0.1 * me.timer.tick;
                    this.junior.pos.x -= 0.5 * me.timer.tick;
                    boarSpeed = 1.8;
                }

                for (var i = 0; i < this.boars.length; ++i) {
                    this.boars[i].pos.x -= boarSpeed * me.timer.tick;
                }

                this._super(Screen, 'update', [dt]);

                return true;
            }
        }),
        Screen.extend({
            init: function() {
                this._super(Screen, 'init', [4, 'rgb(174, 196, 64)']);

                this.pig = new me.AnimationSheet(-88, 50, {
                    image : 'intro-4-anim-pig',
                    framewidth : 88,
                    frameheight : 50
                });
                this.pig.z = 8;
                this.addChild(this.pig);

                this.junior = new me.AnimationSheet(-22, 46, {
                    image : 'intro-4-anim-junior',
                    framewidth : 22,
                    frameheight : 22
                });
                this.junior.z = 7;
                this.addChild(this.junior);

                this.speed = 8;
                var that = this,
                    tween = new me.Tween({ speed : this.speed }).to({ speed : 0 }, 1500);
                tween.easing(me.Tween.Easing.Quintic.Out);
                tween.onUpdate(function() {
                    that.speed = this.speed;
                });
                tween.start();

                this.speedlines = [];
                for (var i = 0; i < 4; ++i) {
                    this.speedlines.push(new me.Sprite(-71 + (i * 71), 48, {
                        image : 'intro-4-anim-lines'
                    }));
                    this.speedlines[i].z = 6;
                    this.addChild(this.speedlines[i]);
                }
            },

            update: function(dt) {
                this._super(Screen, 'update', [dt]);

                if (this.pig.pos.x) {
                    var speed = this.speed > 0 && this.speed < 1 ? 0 : this.speed;
                    this.pig.pos.x += speed * me.timer.tick;
                    this.junior.pos.x += (speed * 1.2) * me.timer.tick;
                }

                for (var i = 0; i < this.speedlines.length; ++i) {
                    this.speedlines[i].pos.x += 8 * me.timer.tick;
                    if (this.speedlines[i].pos.x >= me.game.viewport.width) {
                        this.speedlines[i].pos.x = -71;
                    }
                }

                return true;
            }
        })
    ];

    game.IntroScreen = me.ScreenObject.extend({
        onResetEvent: function() {
            this.currentScreen = 1;
            this.lastScreen = screens.length;

            me.audio.playUniqueTrack('Intro');

            this.screen = new screens[0]();

            me.game.world.addChild(this.screen);
        },

        onDestroyEvent: function() {
            me.game.world.removeChild(this.screen);
        },

        nextScreen: function(fadeColor) {
            if (this.currentScreen >= this.lastScreen) {
                me.state.transition('fade', fadeColor, 350);
                me.state.change(me.state.MENU);
            } else {
                me.game.viewport.fadeIn(fadeColor, 350, function() {
                    me.game.viewport.fadeOut(fadeColor, 350);
                    ++this.currentScreen;
                    me.game.world.removeChild(this.screen);
                    this.screen = new screens[this.currentScreen - 1]();
                    me.game.world.addChild(this.screen);
                    return false;
                }.bind(this));
            }
        }
    });
})();
