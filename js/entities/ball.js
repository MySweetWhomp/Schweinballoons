/**
 * Ball Entity
 */
game.BallEntity = me.Entity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {
        settings.image = 'ball';
        settings.framewidth = 20;
        settings.frameheight = 20;
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'ball';

        // define movement constants
        this.NORMAL_SPEED  = 2.5;
        this.ACCELERATED_SPEED = 6;
        this.DECCELERATION_STEPS = 3;

        // the ball must not react to gravity
        this.poweredUp = false;
        this.powerLevel = 0;
        this.body.setVelocity(this.NORMAL_SPEED, this.NORMAL_SPEED);
        this.body.gravity = 0;

        // we always update the ball, ALWAYS
        this.alwaysUpdate = true;

        // set initial state
        this.direction = new me.Vector2d(0, 1);
        this.lastDirectionChange = 50;
        this.BEFORE_DIRECTION_CHANGE_TIME = 50;

        // define animations
        this.renderable.addAnimation('idle', [0, 1], 200);
        this.renderable.addAnimation('jumpedOver', [2, 2], 50);
        this.renderable.addAnimation('kicked', [5, 5], 50);
        this.renderable.addAnimation('vAcceleration', [3, 4], 50);
        this.renderable.addAnimation('hAcceleration', [6, 7], 50);
        this.setCurrentAnimation('idle');

        this.isColliding = false;
        this.lastNotCollidingPos = this.pos.clone();
        this.lastNotCollidingDir = this.direction.clone();

        this.carried = false;
    },

    setCurrentAnimation: function(name, onComplete) {
        if (!this.renderable.isCurrentAnimation(name)) {
            this.renderable.setCurrentAnimation(name, onComplete);
        }
    },

    /**
     * accelerates the ball
     */
    powerUp: function() {
        if (this.direction.x) {
            this.setCurrentAnimation('kicked', 'hAcceleration');
        } else {
            this.setCurrentAnimation('jumpedOver', 'vAcceleration');
        }

        this.poweredUp = true;
        this.powerLevel = this.DECCELERATION_STEPS;
        this.body.setVelocity(this.ACCELERATED_SPEED, this.ACCELERATED_SPEED);
    },

    /**
     * deccelerates the ball
     */
    powerDown: function() {
        this.setCurrentAnimation('idle');

        this.powerLevel = this.powerLevel > 0 ? this.powerLevel - 1 : 0;
        this.poweredUp = this.powerLevel !== 0;

        var step = (this.ACCELERATED_SPEED - this.NORMAL_SPEED) / this.DECCELERATION_STEPS;
        var speed = this.NORMAL_SPEED + this.powerLevel * step;
        this.body.setVelocity(speed, speed);
    },

    /**
     * update the entity
     */
    update: function(dt) {
        if (this.carried) {
            var alpha = this.renderable.alpha;
            this.renderable.alpha = 0;
            return false;
        } else {
            this.renderable.alpha = 1;
        }

        if (this.direction.x !== 0 && this.direction.y !== 0) {
            this.direction.y = 0;
        }

        this.body.vel.set(0, 0);

        if (!game.data.won) {
            this.body.vel.x += (this.body.accel.x * me.timer.tick) * this.direction.x;
            this.body.vel.y += (this.body.accel.y * me.timer.tick) * this.direction.y;
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // make sure we're in the viewport (or bounce direction)
        if (!me.game.viewport.contains(this)) {
            if (this.top < me.game.viewport.top) {
                this.powerDown();
                this.goDown();
            } else if (this.right > me.game.viewport.right) {
                this.powerDown();
                this.goLeft();
            } else if (this.bottom > me.game.viewport.bottom) {
                this.powerDown();
                this.goUp();
            } else if (this.left < me.game.viewport.left) {
                this.powerDown();
                this.goRight();
            }
        }

        if (!this.isColliding) {
            this.lastNotCollidingPos = this.pos.clone();
            this.lastNotCollidingDir = this.direction.clone();
        }

        this.lastDirectionChange += dt;
        this.isColliding = false;

        return (this._super(me.Entity, 'update', [dt]) ||
                this.body.vel.x !== 0 ||
                this.body.vel.y !== 0);
    },

    go: function(x, y) {
        if (this.lastDirectionChange > this.BEFORE_DIRECTION_CHANGE_TIME) {
            this.direction.x = x;
            this.direction.y = y;
            this.lastDirectionChange = 0;
        }
    },

    bounceDirection: function() {
        this.go(-this.direction.x, -this.direction.y);
    },

    accelerateUp: function() {
        this.goUp();
        this.powerUp();
    },

    accelerateDown: function() {
        this.goDown();
        this.powerUp();
    },

    goUp: function() {
        this.go(0, -1);
    },

    goRight: function() {
        this.go(1, 0);
    },

    goDown: function() {
        this.go(0, 1);
    },

    goLeft: function() {
        this.go(-1, 0);
    },

    onCollision: function(response, other) {
        if (this.carried) { return false; }

        var otherShapeIndex = response.a.name === other.name ? response.indexShapeA
                                                             : response.indexShapeB;

        this.isColliding = true;

        if (other.name === 'player') {
            if (me.input.keyStatus('kick') && !other.kicking) {
                other.carrying = true;
                this.carried = true;
                return false;
            }
            // if the player is hitting then we go horizontal
            if (other.kicking) {
                this.powerUp();
                if (other.direction.x >= 0) {
                    this.goRight();
                } else {
                    this.goLeft();
                }
            } else {
                this.powerDown();
                // if horizontal movement
                if (Math.abs(response.overlapV.x) > Math.abs(response.overlapV.y)) {
                    // we reverse direction
                    this.bounceDirection();
                } else {
                    // if up movement
                    if (response.overlapV.y < 0) {
                        // if we're jumping but not powerjumping
                        if (other.body.jumping && !other.powerJumping) {
                            // we stop the player
                            other.body.vel.y = 0;
                            other.body.jumping = false;
                            other.onAirTime = 0;
                            // accelerate ball downwards
                            this.accelerateUp();
                        } else if (!other.powerJumping) {
                            // the ball goes up at normal speed
                            this.goUp();
                        }
                    } else {
                        // if the player has no velocity
                        if (!other.body.vel.y) {
                            this.bounceDirection();
                        } else if (!other.powerJumping && other.body.vel.y > 0) {
                            // we jump
                            other.body.vel.set(-8 * 10 * (other.pos.x - this.pos.x) > 0 ? 1 : -1, -8);
                            other.powerJumping = true;
                            // we accelerate the ball downwards
                            this.accelerateDown();
                        } else {
                            // the ball goes up at normal speed
                            this.goDown();
                        }
                    }
                }
            }
        } else if (other.name === 'boar') {
            if (otherShapeIndex === 2) {
                // we kill the boar
                if (this.powerLevel === this.DECCELERATION_STEPS) {
                    other.kill();
                }
                this.bounceDirection();
                this.powerDown();
                return true;
            }
        } else if (other.name !== 'piglet'){
            if (response.overlap >= this.body.width / 2) {
                this.pos = this.lastNotCollidingPos.clone();
                // this.direction = this.lastNotCollidingDir.clone();
            }

            if (other.name === 'block') {
                if (this.powerLevel === this.DECCELERATION_STEPS) {
                    other.break();
                }
            }

            this.bounceDirection();
            this.powerDown();
        }

        return false;
    }
});
