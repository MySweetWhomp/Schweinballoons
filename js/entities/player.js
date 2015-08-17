/**
 * Player Entity
 */
game.PlayerEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        settings.image = 'pig';
        settings.framewidth = 40;
        settings.frameheight = 40;
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'player';

        // shift sprite so that collision box is its bottom
        this.renderable.translate(0, -4);

        // viewport must follow the player
        this.center = this.pos.clone()
                              .add(new me.Vector2d(this.width / 2,
                                                   this.height / 2));
        this.SCROLL_OFFSET_MAX = 30;
        this.SCROLL_OFFSET_SPEED = 1;
        this.SCROLL_DEADZONE_MAX = 8;
        this.scrollOffset = 0;
        this.scrollDeadzone = 0;
        me.game.viewport.setDeadzone(0, 0);
        me.game.viewport.follow(this.center, me.game.viewport.AXIS.BOTH);

        // we set the velocity of the player's body
        this.WALK_SPEED = 2;
        this.RUN_SPEED = 3;
        this.VERTICAL_SPEED = 9;
        this.body.setVelocity(this.WALK_SPEED, this.VERTICAL_SPEED);

        // we always update the player, ALWAYS
        this.alwaysUpdate = true;

        // setting constants
        this.onAirTime = 100;
        this.JUMP_MAX_AIRBONRNE_TIME = 80;
        this.FLICKERING_TIME = 2000;

        // setting initial direction
        this.direction = new me.Vector2d(1, 0);
        this.knockbacked = false;
        this.powerJumping = false;

        this.carrying = false;

        // animations
        this.renderable.addAnimation('idle', [0, 1, 2], 150);
        this.renderable.addAnimation('walk', [3, 4, 5, 6, 7, 8], 100);
        this.renderable.addAnimation('run', [9, 10, 11, 12, 13, 14], 70);
        this.renderable.addAnimation('jump', [15, 16], 50);
        this.renderable.addAnimation('fall', [18, 19], 50);
        this.renderable.addAnimation('kick', [20, 21, 21, 21], 50);
        this.renderable.addAnimation('stun', [23, 24, 23, 24, 23, 24], 50); // Must blink
        this.renderable.addAnimation('win', [25, 26, 27, 26, 25, 26, 27, 26,
                                             25, 26, 27, 26, 25, 26, 27, 26], 120);
        this.renderable.addAnimation('idle-carry', [28, 29, 30], 150);
        this.renderable.addAnimation('walk-carry', [31, 32, 33, 34, 35, 36], 100);
        this.renderable.addAnimation('run-carry', [37, 38, 39, 40, 41, 42], 50);
        this.renderable.addAnimation('jump-carry', [43, 44], 50);
        this.renderable.addAnimation('fall-carry', [46, 47], 50);
        this.renderable.addAnimation('h-drop', [20, 20], 50);
        this.renderable.addAnimation('v-drop', [48, 48], 50);

        this.setCurrentAnimation('idle');
    },

    setCurrentAnimation: function(name, onComplete) {
        if (!this.renderable.isCurrentAnimation(name)) {
            this.renderable.setCurrentAnimation(name, onComplete);
        }
    },

    flipX: function(flipX) {
        // XXX Should we prevent flipping when kicking or move the kick collision shape?
        if (!this.kicking) {
            this.renderable.flipX(flipX);
        }
    },

     knockback: function (strength, direction) {
         // set state as currently knockbacked
         this.knockbacked = true;

         // set default strength
         strength = strength || 2;
         direction = direction || this.direction;

        // change the velocity
        this.body.vel = new me.Vector2d(-strength * 20 * direction.x, -strength);
    },

    kick: function() {
        if (!this.kicking) {
            this.kicking = true;
            this.body.addShape(new me.Rect(
                this.direction.x < 0 ? -20 : 20,
                15,
                17,
                7
            ));
        }
    },

     hit: function() {
        this.renderable.flicker(this.FLICKERING_TIME);

        // drop the ball
        if (this.carrying) {
            this.dropTheBall();
        }
     },

    /**
     * update the entity
     */
    update : function (dt) {
        // handling movement on the side
        if (me.input.keyStatus('kick') && !this.kicking) {
            this.body.setVelocity(this.RUN_SPEED, this.VERTICAL_SPEED);
        } else {
            this.body.setVelocity(this.WALK_SPEED, this.VERTICAL_SPEED);
        }

        if (!me.input.paused) {
            if (!this.knockbacked) {
                if (me.input.isKeyPressed('left')) {
                    this.flipX(true);
                    this.body.vel.x -= this.body.accel.x * me.timer.tick;
                    this.direction = new me.Vector2d(-1, 0);
                    this.scrollDeadzone -= 1;
                    if(this.scrollDeadzone < -this.SCROLL_DEADZONE_MAX) {
                        this.scrollOffset -= this.SCROLL_OFFSET_SPEED;
                    }
                } else if (me.input.isKeyPressed('right')) {
                    this.flipX(false);
                    this.body.vel.x += this.body.accel.x * me.timer.tick;
                    this.direction = new me.Vector2d(1, 0);
                    this.scrollDeadzone += 1;
                    if(this.scrollDeadzone > this.SCROLL_DEADZONE_MAX) {
                        this.scrollOffset += this.SCROLL_OFFSET_SPEED;
                    }
                } else {
                    this.body.vel.x = 0;
                }
            }

            if (this.carrying && !me.input.keyStatus('kick')) {
                this.dropTheBall(true);
            }

            // handling jump
            if (me.input.isKeyPressed('jump')) {
                if (!this.body.jumping &&
                    !this.knockbacked &&
                    (!this.body.falling ||
                     this.onAirTime < this.JUMP_MAX_AIRBONRNE_TIME)) {
                    //set velocity
                    this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                    this.body.jumping = true;

                    //play audio
                    me.audio.playUnique('jump', 'action');
                }
            }

            if (me.input.isKeyPressed('kick')) {
                if (!this.knockbacked) {
                    //play audio
                    if(!this.kicking)
                        me.audio.playUnique('kick', 'action');

                    this.kick();
                }
            }
        }

        this.onAirTime += dt;
        if (!this.body.falling && !this.body.jumping) {
            this.onAirTime = 0;
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        if (me.state.current().won) {
            this.setCurrentAnimation('win', function() {
                this.setCurrentAnimation('win');
                me.state.current().nextLevel();
            }.bind(this));
            this.body.vel.x = 0;
        } else {
            // update animation
            if (!this.kicking) {
                if (this.knockbacked) {
                    this.setCurrentAnimation('stun');
                } else if (this.body.jumping) {
                    this.setCurrentAnimation(this.getAnimationName('jump'));
                } else if (this.body.falling) {
                    this.setCurrentAnimation(this.getAnimationName('fall'));
                } else if (this.body.vel.x !== 0) {
                    this.setCurrentAnimation(
                        this.getAnimationName(me.input.keyStatus('kick') ? 'run' : 'walk')
                    );
                } else {
                    this.setCurrentAnimation(this.getAnimationName('idle'));
                }
            } else {
                if (!this.renderable.isCurrentAnimation('v-drop') &&
                    !this.renderable.isCurrentAnimation('h-drop')) {
                    this.setCurrentAnimation('kick', (function() {
                        this.kicking = false;
                        this.body.removeShapeAt(1);
                    }).bind(this));
                }
            }
        }

        // Compute the center
        this.scrollDeadzone = this.scrollDeadzone > this.SCROLL_DEADZONE_MAX
                                ? this.SCROLL_DEADZONE_MAX
                                : (this.scrollDeadzone < -this.SCROLL_DEADZONE_MAX
                                        ? -this.SCROLL_DEADZONE_MAX
                                        : this.scrollDeadzone);

        this.scrollOffset = this.scrollOffset > this.SCROLL_OFFSET_MAX
                                ? this.SCROLL_OFFSET_MAX
                                : (this.scrollOffset < -this.SCROLL_OFFSET_MAX
                                        ? -this.SCROLL_OFFSET_MAX
                                        : this.scrollOffset);
        var center = this.pos.clone()
                            .add(new me.Vector2d((this.width / 2) + this.scrollOffset,
                                                 this.height / 2))
        this.center.set(center.x, center.y);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) ||
                this.body.vel.x !== 0 ||
                this.body.vel.y !== 0);
    },

    getAnimationName: function(name) {
        return name + (this.carrying ? '-carry' : '');
    },

    dropTheBall: function(powerUp) {
        var ball = me.game.world.getChildByName('ball')[0];
        ball.carried = false;
        if (powerUp) {
            ball.powerUp();
        } else {
            ball.powerDown();
        }

        var dir = 'h';
        if (me.input.isKeyPressed('up')) {
            dir = 'v';
            ball.pos.set(this.left, this.top - ball.body.height);
            ball.goUp();
        } else {
            var vector = this.direction.clone(),
                response = new me.collision.ResponseObject();

            ball.pos.set(
                this.left + (this.width / 2) - (ball.width / 2) + ((this.width) * vector.x),
                this.top + (this.height / 2) - (ball.height / 2)
            );
            if (me.collision.check(ball, response)) {
                if (response.other.name !== this.name) {
                    vector.x = -vector.x;
                    ball.pos.set(
                        this.left + (this.width / 2) - (ball.width / 2) + ((this.width) * vector.x),
                        this.top + (this.height / 2) - (ball.height / 2)
                    );
                }
            }

            ball.go(vector.x, vector.y);
        }

        this.kicking = true;
        this.setCurrentAnimation(dir + '-drop', function() {
            this.kicking = false;
            this.setCurrentAnimation('idle');
        }.bind(this));

        this.carrying = false;
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        var myShapeIndex = response.a.name === this.name ? response.indexShapeA
                                                         : response.indexShapeB;
        var otherShapeIndex = response.a.name === other.name ? response.indexShapeA
                                                             : response.indexShapeB;

        // kick collision shape must not be solid
        if (myShapeIndex > 0) {
            return false;
        }

        // computing independant overlap vector
        var relativeOverlapV = response.overlapV.clone().scale(this.name === response.a.name ? 1 : 0);
        // handling custom collision
        if (other.name === 'ball') {
            if (other.carried) { return false; }
            return !this.powerJumping;
        } else if (other.name === 'piglet') {
            other.rescue();
            return false;
        } else if (other.name === 'trigger') {
            return false;
        } else if (other.name === 'boar') {
            // if our body (not the foot) touches the boar
            if (otherShapeIndex === 0) {
                return false;
            } else if (otherShapeIndex === 1) {
                // if we come from bottom
                if (!this.knockbacked &&
                    !other.stunned &&
                    relativeOverlapV.y > 0 &&
                    this.bottom - relativeOverlapV.y < other.top &&
                    this.body.vel.y > 0) {
                        // we bounce on the head
                        this.body.vel.set(-8 * 10 * (other.pos.x - this.pos.x) > 0 ? 1 : -1, -8);
                        other.stun();
                }
                return !other.stunned && !this.knockbacked;
            } else {
                // If we're not invincible and not stunned
                if (!this.renderable.isFlickering() && !other.stunned) {
                    // giving priority over stunning. way better
                    this.hit();
                    this.knockback(8, new me.Vector2d((other.pos.x - this.pos.x) > 0 ? 1 : -1, 0));
                }
                return !this.renderable.isFlickering() && !other.stunned;
            }
        }
        else {
            // we're not knockbacked anymore
            this.knockbacked = false;
            this.powerJumping = false;
        }

        // Make all other objects solid
        return true;
    }
});
