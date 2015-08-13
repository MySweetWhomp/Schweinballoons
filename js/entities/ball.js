/**
 * Ball Entity
 */
game.BallEntity = me.Entity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'ball';

        // define movement constants
        this.NORMAL_SPEED  = 0.5;
        this.ACCELERATED_SPEED = 1.5;
        this.DECCELERATION_STEPS = 3;

        // the ball must not react to gravity
        this.poweredUp = false;
        this.powerLevel = 0;
        this.body.setVelocity(this.NORMAL_SPEED, this.NORMAL_SPEED);
        this.body.gravity = 0;
        this.jumpedOver = false;

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
        this.renderable.addAnimation('vAcceleration', [6, 7], 50);
        this.renderable.addAnimation('hAcceleration', [3, 4], 50);
        this.setCurrentAnimation('idle');
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
        this.setCurrentAnimation('kicked', 'hAcceleration');

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
        if (this.direction.x !== 0 && this.direction.y !== 0) {
            this.direction.y = 0;
        }

        this.body.vel.set(0, 0);
        this.body.vel.x += (this.body.accel.x * me.timer.tick) * this.direction.x;
        this.body.vel.y += (this.body.accel.y * me.timer.tick) * this.direction.y;

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

        this.lastDirectionChange += dt;
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
        if (other.name !== 'player') {
            this.bounceDirection();
            this.powerDown();
        } else {
            var playerShapeIndex = response.a.name === other.name ? response.indexShapeA
                                                                  : response.indexShapeB;

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
                if ((Math.abs(response.overlapV.x) > Math.abs(response.overlapV.y)) &&
                    (other.body.vel.x !== 0 || other.onAirTime === 0)) {
                    if (response.overlapV.x < 0) {
                        this.goLeft();
                    } else {
                        this.goRight();
                    }
                } else {
                    this.jumpedOver = true;
                    this.setCurrentAnimation('jumpedOver', 'idle');

                    if (response.overlapV.y > 0) {
                        this.goDown();
                    } else {
                        this.goUp();
                    }
                }
            }
        }
        return false;
    }
});
